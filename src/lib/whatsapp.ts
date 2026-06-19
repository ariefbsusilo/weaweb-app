import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, downloadMediaMessage } from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import pino from "pino";
import { prisma } from "./prisma";
import { checkAllowList, buildGeminiTools, getIntegrationNameByFunctionName, executeIntegration, executeCustomWebhook } from "./integrations";
import path from "path";
import fs from "fs";

// Store active connections in memory for the worker
const globalForWA = globalThis as unknown as {
  waSessions: Map<string, any>;
  qrStore: Map<string, string>;
};

export const sessions = globalForWA.waSessions || new Map<string, any>();
if (process.env.NODE_ENV !== "production") globalForWA.waSessions = sessions;

export const qrStore = globalForWA.qrStore || new Map<string, string>();
if (process.env.NODE_ENV !== "production") globalForWA.qrStore = qrStore;

// Logger for baileys
const logger = pino({ level: "silent" });

export async function initWhatsApp(deviceId: string, tenantId: string, forceRecreate = false) {
  if (sessions.has(deviceId)) {
    if (forceRecreate) {
      console.log(`[WA] Force recreating session for device ${deviceId}`);
      const oldSock = sessions.get(deviceId);
      sessions.delete(deviceId);
      try {
        oldSock.ws.close();
      } catch (e) {}
    } else {
      console.log(`Session for device ${deviceId} already exists.`);
      return;
    }
  }

  const sessionDir = path.join(process.cwd(), "data", "sessions", deviceId);
  if (forceRecreate) {
    qrStore.delete(deviceId);
    if (fs.existsSync(sessionDir)) {
      console.log(`[WA] Deleting old session directory to force new QR for device ${deviceId}`);
      fs.rmSync(sessionDir, { recursive: true, force: true });
    }
  }

  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  let version = [2, 3000, 1015901307] as any;
  try {
    const { version: fetchedVersion } = await fetchLatestBaileysVersion();
    version = fetchedVersion;
  } catch (err) {
    console.error(`[WA] Failed to fetch latest Baileys version, using fallback:`, err);
  }

  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: false,
    auth: state,
    syncFullHistory: false,
    browser: ["WEAWEB SaaS", "Chrome", "1.0.0"],
  });

  sessions.set(deviceId, sock);

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      qrStore.set(deviceId, qr);
      await prisma.device.update({
        where: { id: deviceId },
        data: { status: "connecting" }
      });
      console.log(`[WA] Generated new QR for device ${deviceId}`);
    }

    if (connection === "close") {
      const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log(`[WA] Connection closed for device ${deviceId}. Reconnecting: ${shouldReconnect}`);
      
      sessions.delete(deviceId);
      
      if (shouldReconnect) {
        setTimeout(() => initWhatsApp(deviceId, tenantId), 5000);
      } else {
        // Logged out
        await prisma.device.update({
          where: { id: deviceId },
          data: { status: "disconnect" }
        });
        qrStore.delete(deviceId);
        fs.rmSync(sessionDir, { recursive: true, force: true });
        console.log(`[WA] Logged out & session cleared for device ${deviceId}`);
      }
    } else if (connection === "open") {
      console.log(`[WA] Connection opened for device ${deviceId}`);
      await prisma.device.update({
        where: { id: deviceId },
        data: { status: "connect" }
      });
      qrStore.delete(deviceId);
    }
  });

  sock.ev.on("messaging-history.set", async ({ chats, contacts, messages }) => {
    // History sync is ignored to prevent flooding Weaweb with personal WhatsApp data
    console.log(`[WA] Received history sync with ${messages?.length || 0} messages, ignoring to prevent data flood.`);
  });

  sock.ev.on("messages.upsert", async (m) => {
    if (m.type !== "notify") return;
    for (const msg of m.messages) {
      if (!msg.message) continue;

      const msgTimestamp = msg.messageTimestamp ? (typeof msg.messageTimestamp === 'number' ? msg.messageTimestamp : (msg.messageTimestamp as any).low || (msg.messageTimestamp as any).toNumber?.() || Math.floor(Date.now() / 1000)) * 1000 : Date.now();
      // Ignore messages older than 2 minutes to prevent syncing old unread history on connection
      if (Date.now() - msgTimestamp > 2 * 60 * 1000) {
        continue;
      }
      
      const remoteJid = msg.key.remoteJid;
      if (!remoteJid || remoteJid === "status@broadcast" || remoteJid.includes("@newsletter")) continue; // Ignore status, channels

      let phoneNumber = remoteJid.split("@")[0];
      // If it's a LID (Linked Device ID) or Group, we MUST preserve the domain 
      // so we don't accidentally send replies to @s.whatsapp.net and fail.
      if (remoteJid.includes("@lid") || remoteJid.includes("@g.us")) {
        phoneNumber = remoteJid;
      }
      
      const incomingText = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

      if (!incomingText && !msg.message.imageMessage && !msg.message.documentMessage && !msg.message.videoMessage && !msg.message.audioMessage) continue;

      let mediaUrl = null;
      let mediaType = null;

      try {
        if (msg.message.imageMessage || msg.message.documentMessage || msg.message.videoMessage || msg.message.audioMessage) {
          const buffer = await downloadMediaMessage(msg, 'buffer', { }, { 
            logger,
            reuploadRequest: sock.updateMediaMessage
          });
          const uploadsDir = path.join(process.cwd(), "public", "uploads");
          if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
          
          const ext = msg.message.imageMessage ? 'jpg' : msg.message.videoMessage ? 'mp4' : msg.message.audioMessage ? 'mp3' : 'pdf';
          mediaType = msg.message.imageMessage ? 'image' : msg.message.videoMessage ? 'video' : msg.message.audioMessage ? 'audio' : 'document';
          const filename = `media_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
          
          await fs.promises.writeFile(path.join(uploadsDir, filename), buffer);
          mediaUrl = `/uploads/${filename}`;
        }
      } catch (err) {
        console.error(`[WA] Failed to download media:`, err);
      }

      const isFromMe = msg.key.fromMe;

      // Find contact in Weaweb DB (robust lookup for 62..., 0..., and +62...)
      let localNumber = phoneNumber;
      if (phoneNumber.startsWith("62")) {
          localNumber = "0" + phoneNumber.substring(2);
      }

      let contact = await prisma.contact.findFirst({
          where: { 
              tenantId,
              OR: [
                  { phoneNumber: phoneNumber },
                  { phoneNumber: localNumber },
                  { phoneNumber: `+${phoneNumber}` }
              ]
          }
      });
      
      if (isFromMe) {
          // Save message sent from the user's own phone ONLY if contact exists
          if (contact) {
              await prisma.message.create({
                  data: {
                      tenantId,
                      contactId: contact.id,
                      content: incomingText || (mediaType ? `[${mediaType}]` : ""),
                      mediaUrl,
                      mediaType,
                      status: "sent",
                      direction: "outbound",
                      whatsappId: msg.key.id || `wa-self-${Date.now()}`
                  }
              });
          }
          continue; // Don't run auto-replies for our own messages
      }

      // Save incoming message ONLY if contact is saved in Weaweb
      if (!contact) {
        // Auto-create contact for new inbound users
        contact = await prisma.contact.create({
          data: {
            tenantId,
            phoneNumber,
            name: msg.pushName || phoneNumber
          }
        });
      }

      if (contact) {
          await prisma.message.create({
              data: {
                  tenantId,
                  contactId: contact.id,
                  content: incomingText || (mediaType ? `[${mediaType}]` : ""),
                  mediaUrl,
                  mediaType,
                  status: "delivered",
                  direction: "inbound",
                  whatsappId: msg.key.id || `wa-${Date.now()}`,
                  createdAt: msg.messageTimestamp ? new Date((typeof msg.messageTimestamp === 'number' ? msg.messageTimestamp : (msg.messageTimestamp as any).low || Math.floor(Date.now()/1000)) * 1000) : new Date(),
                  senderName: msg.pushName || (msg.key.participant ? msg.key.participant.split('@')[0] : null)
              }
          });
      }

      console.log(`[WA] Incoming message from ${phoneNumber}: ${incomingText}`);

      // Auto-Reply Logic
      const tenantRecord = await prisma.tenant.findUnique({ where: { id: tenantId } });
      const rules = await prisma.autoReplyRule.findMany({
          where: { tenantId, isActive: true }
      });

      let matchedRule = null;
      let defaultRule = null;

      for (const rule of rules) {
          if (rule.matchType === "default") {
              defaultRule = rule;
              continue;
          }

          let isMatch = false;
          const incTxt = incomingText.trim();
          const ruleKw = rule.keyword.trim();

          if (rule.matchType === "exact" && incTxt.toLowerCase() === ruleKw.toLowerCase()) {
              isMatch = true;
          } else if (rule.matchType === "contains" && incTxt.toLowerCase().includes(ruleKw.toLowerCase())) {
              isMatch = true;
          } else if (rule.matchType === "startsWith" && incTxt.toLowerCase().startsWith(ruleKw.toLowerCase())) {
              isMatch = true;
          } else if (rule.matchType === "regex") {
              try {
                const re = new RegExp(ruleKw, "i");
                if (re.test(incTxt)) isMatch = true;
              } catch (e) {}
          }

          if (isMatch) {
              matchedRule = rule;
              break; 
          }
      }

      if (!matchedRule && incomingText.trim() !== "") {
        try {
          const aiConfig = await prisma.aiConfig.findUnique({ where: { deviceId } });
          if (aiConfig && aiConfig.isActive && aiConfig.apiKey && contact?.aiEnabled !== false) {
            // === Allow List Pre-Check ===
            const allowCheck = await checkAllowList(deviceId, phoneNumber);
            if (!allowCheck.allowed) {
              if (allowCheck.message) {
                await sendMessageWA(tenantId, phoneNumber, allowCheck.message, null, null, null, deviceId);
              }
              return; // Block this message entirely
            }

            const aiKnowledgeSources = await prisma.aiKnowledgeSource.findMany({ where: { deviceId } });
            
            let systemPrompt = aiConfig.prompt || "You are a helpful WhatsApp assistant.";
            if (aiKnowledgeSources.length > 0) {
              systemPrompt += "\n\nKnowledge Base (Use this to answer questions accurately):\n" + aiKnowledgeSources.map(d => `${d.title}:\n${d.content}`).join("\n\n");
            }
            systemPrompt += "\n\nKeep your answers concise, friendly, and suitable for WhatsApp. Answer in Indonesian unless requested otherwise.";

            // === Fetch Active Integrations & Build Tools ===
            const activeIntegrations = await prisma.aiIntegration.findMany({
              where: { deviceId, isActive: true }
            });
            const toolDeclarations = buildGeminiTools(activeIntegrations);

            let aiReply = "Maaf, AI sedang mengalami gangguan.";
            let success = false;

            const integrationCtx = {
              deviceId,
              tenantId,
              phoneNumber,
              contactName: msg.pushName || contact?.name || "Customer",
              configJson: null as string | null
            };

            if (aiConfig.provider === "gemini") {
              // Build Gemini request with function calling
              const requestBody: any = {
                systemInstruction: { parts: [{ text: systemPrompt }] },
                contents: [{ parts: [{ text: incomingText }] }]
              };

              if (toolDeclarations.length > 0) {
                requestBody.tools = [{
                  functionDeclarations: toolDeclarations
                }];
              }

              const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${aiConfig.apiKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody)
              });

              if (res.ok) {
                const data = await res.json();
                const candidate = data.candidates?.[0];
                
                if (candidate?.content?.parts) {
                  // Check if AI wants to call a function
                  const functionCall = candidate.content.parts.find((p: any) => p.functionCall);
                  
                  if (functionCall) {
                    const fc = functionCall.functionCall;
                    console.log(`[WA] AI called function: ${fc.name}`, fc.args);
                    
                    // Find which integration this belongs to
                    const integrationName = getIntegrationNameByFunctionName(fc.name, activeIntegrations);
                    
                    if (integrationName) {
                      // Get config for this integration
                      const intRecord = activeIntegrations.find(i => i.name === integrationName);
                      integrationCtx.configJson = intRecord?.configJson || null;
                      
                      let toolResult;
                      if (intRecord?.provider === "custom" && intRecord?.webhookUrl) {
                        toolResult = await executeCustomWebhook(intRecord, fc.args, integrationCtx);
                      } else {
                        toolResult = await executeIntegration(integrationName, fc.name, fc.args, integrationCtx);
                      }
                      
                      // Send function result back to Gemini for a natural response
                      const followUpBody: any = {
                        systemInstruction: { parts: [{ text: systemPrompt }] },
                        contents: [
                          { role: "user", parts: [{ text: incomingText }] },
                          { role: "model", parts: [{ functionCall: { name: fc.name, args: fc.args } }] },
                          { role: "user", parts: [{ functionResponse: { name: fc.name, response: { result: toolResult.message } } }] }
                        ]
                      };

                      if (toolDeclarations.length > 0) {
                        followUpBody.tools = [{ functionDeclarations: toolDeclarations }];
                      }

                      const followUpRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${aiConfig.apiKey}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(followUpBody)
                      });
                      
                      if (followUpRes.ok) {
                        const followUpData = await followUpRes.json();
                        const textPart = followUpData.candidates?.[0]?.content?.parts?.find((p: any) => p.text);
                        if (textPart) {
                          aiReply = textPart.text;
                          success = true;
                        } else {
                          aiReply = toolResult.message;
                          success = true;
                        }
                      } else {
                        aiReply = toolResult.message;
                        success = true;
                      }
                    }
                  } else {
                    // Regular text response (no function call)
                    const textPart = candidate.content.parts.find((p: any) => p.text);
                    if (textPart) {
                      aiReply = textPart.text;
                      success = true;
                    }
                  }
                }
              } else {
                console.error("[WA] Gemini API error:", await res.text());
              }
            } else if (aiConfig.provider === "openai") {
              // Build OpenAI request with tool calls
              const requestBody: any = {
                model: "gpt-4o-mini",
                messages: [
                  { role: "system", content: systemPrompt },
                  { role: "user", content: incomingText }
                ]
              };

              if (toolDeclarations.length > 0) {
                requestBody.tools = toolDeclarations.map(t => ({
                  type: "function",
                  function: {
                    name: t.name,
                    description: t.description,
                    parameters: t.parameters
                  }
                }));
              }

              const res = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: { 
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${aiConfig.apiKey}`
                },
                body: JSON.stringify(requestBody)
              });
              
              if (res.ok) {
                const data = await res.json();
                const choice = data.choices?.[0];
                
                if (choice?.message?.tool_calls && choice.message.tool_calls.length > 0) {
                  const toolCall = choice.message.tool_calls[0];
                  const fc = toolCall.function;
                  let fcArgs: any = {};
                  try { fcArgs = JSON.parse(fc.arguments); } catch(e) {}
                  
                  const integrationName = getIntegrationNameByFunctionName(fc.name, activeIntegrations);
                  
                  if (integrationName) {
                    const intRecord = activeIntegrations.find(i => i.name === integrationName);
                    integrationCtx.configJson = intRecord?.configJson || null;
                    
                    let toolResult;
                    if (intRecord?.provider === "custom" && intRecord?.webhookUrl) {
                      toolResult = await executeCustomWebhook(intRecord, fcArgs, integrationCtx);
                    } else {
                      toolResult = await executeIntegration(integrationName, fc.name, fcArgs, integrationCtx);
                    }
                    
                    // Send function result back to OpenAI
                    const followUpRes = await fetch("https://api.openai.com/v1/chat/completions", {
                      method: "POST",
                      headers: { 
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${aiConfig.apiKey}`
                      },
                      body: JSON.stringify({
                        model: "gpt-4o-mini",
                        messages: [
                          { role: "system", content: systemPrompt },
                          { role: "user", content: incomingText },
                          choice.message,
                          { role: "tool", tool_call_id: toolCall.id, content: toolResult.message }
                        ]
                      })
                    });
                    
                    if (followUpRes.ok) {
                      const followUpData = await followUpRes.json();
                      if (followUpData.choices?.[0]?.message?.content) {
                        aiReply = followUpData.choices[0].message.content;
                        success = true;
                      } else {
                        aiReply = toolResult.message;
                        success = true;
                      }
                    } else {
                      aiReply = toolResult.message;
                      success = true;
                    }
                  }
                } else if (choice?.message?.content) {
                  aiReply = choice.message.content;
                  success = true;
                }
              } else {
                console.error("[WA] OpenAI API error:", await res.text());
              }
            }

            if (success) {
              await sendMessageWA(tenantId, phoneNumber, aiReply, null, null, null, deviceId);
              
              await prisma.aiConfig.update({
                  where: { deviceId },
                  data: { totalResponses: { increment: 1 } }
              });

              if (contact) {
                  await prisma.message.create({
                      data: {
                          tenantId,
                          contactId: contact.id,
                          content: aiReply,
                          status: "sent",
                          direction: "outbound",
                          whatsappId: `wa-ai-${Date.now()}`
                      }
                  });
              }
              matchedRule = true as any; // Skip default rule processing
            }
          }
        } catch (err) {
          console.error("[WA] AI Processing Error:", err);
        }
      }

      if (!matchedRule && defaultRule && incomingText.trim() !== "") {
          matchedRule = defaultRule;
      }

      if (matchedRule) {
          // Personalisasi Nama
          let finalReply = matchedRule.replyText;
          const senderName = msg.pushName || (contact && contact.name ? contact.name : "Kak") || "Kak";
          finalReply = finalReply.replace(/\{\{name\}\}/g, senderName);

          await sendMessageWA(tenantId, phoneNumber, finalReply, matchedRule.mediaUrl, matchedRule.mediaType);
          
          // Save outbound auto-reply to DB ONLY if contact exists
          if (contact) {
              await prisma.message.create({
                  data: {
                      tenantId,
                      contactId: contact.id,
                      content: finalReply,
                      status: "sent",
                      direction: "outbound",
                      whatsappId: `wa-auto-${Date.now()}`
                  }
              });
          }
      }

      // Webhook Trigger
      if (tenantRecord?.webhookUrl) {
          try {
              console.log(`[WA] Triggering webhook for ${tenantId} to ${tenantRecord.webhookUrl}`);
              await fetch(tenantRecord.webhookUrl, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                      event: "message.received",
                      data: {
                          from: phoneNumber,
                          name: msg.pushName || contact?.name || "Unknown",
                          text: incomingText,
                          mediaUrl,
                          mediaType,
                          timestamp: msg.messageTimestamp ? new Date(Number(msg.messageTimestamp) * 1000) : new Date()
                      }
                  })
              });
          } catch (error) {
              console.error(`[WA] Webhook failed for ${tenantId}:`, error);
          }
      }
    }
  });

  sock.ev.on("messages.update", async (updates) => {
    for (const item of updates) {
      if (item.key.id && item.update.status) {
        let newStatus = "sent";
        switch (item.update.status) {
          case 2: // SERVER_ACK
            newStatus = "sent";
            break;
          case 3: // DELIVERY_ACK
            newStatus = "delivered";
            break;
          case 4: // READ
          case 5: // PLAYED
            newStatus = "read";
            break;
          default:
            continue; // Ignore other statuses
        }

        try {
          await prisma.message.updateMany({
            where: { tenantId, whatsappId: item.key.id },
            data: { status: newStatus }
          });
        } catch (error) {
          console.error(`[WA] Error updating message status:`, error);
        }
      }
    }
  });
}

export async function sendMessageWA(tenantId: string, phoneNumber: string, text: string, mediaUrl?: string | null, mediaType?: string | null, location?: { latitude: number, longitude: number, name?: string, address?: string } | null, specificDeviceId?: string) {
  console.log(`[WA Send] Sending to ${phoneNumber} for tenant ${tenantId}`);
  
  let targetDeviceId = specificDeviceId;
  
  if (!targetDeviceId) {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }});
    targetDeviceId = tenant?.defaultDeviceId || undefined;
  }
  
  if (!targetDeviceId) {
    const anyDevice = await prisma.device.findFirst({ where: { tenantId, status: "connect" }});
    targetDeviceId = anyDevice?.id;
  }
  
  if (!targetDeviceId) {
    throw new Error(`No connected WhatsApp device found for tenant ${tenantId}`);
  }

  const sock = sessions.get(targetDeviceId);
  if (!sock) {
    console.error(`[WA Send] WhatsApp session not active in memory for device ${targetDeviceId}`);
    throw new Error(`WhatsApp session not active for device ${targetDeviceId}`);
  }
  
  const jid = phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@s.whatsapp.net`;
  console.log(`[WA Send] Formatted JID: ${jid}`);
  
  try {
    const finalText = text ? `${text}\n\n> _Sent via weaweb.app_` : `> _Sent via weaweb.app_`;
    let messagePayload: any = { text: finalText };
    
    if (location && location.latitude && location.longitude) {
      messagePayload = {
        location: {
          degreesLatitude: location.latitude,
          degreesLongitude: location.longitude,
          name: location.name || "Location",
          address: location.address || ""
        }
      };
    } else if (mediaUrl) {
      const localPath = mediaUrl.startsWith('/uploads') ? path.join(process.cwd(), "public", mediaUrl) : mediaUrl;
      
      if (mediaType === 'image' || mediaUrl.match(/\.(jpeg|jpg|gif|png)$/i)) {
        messagePayload = { image: { url: localPath }, caption: finalText };
      } else if (mediaType === 'video' || mediaUrl.match(/\.(mp4|avi|mov)$/i)) {
        messagePayload = { video: { url: localPath }, caption: finalText };
      } else if (mediaType === 'document' || mediaUrl.match(/\.(pdf|doc|docx|xls|xlsx|csv)$/i)) {
        messagePayload = { document: { url: localPath }, caption: finalText, mimetype: 'application/pdf', fileName: 'Document' };
      }
    }

    const result = await sock.sendMessage(jid, messagePayload);
    console.log(`[WA Send] Success! Result:`, JSON.stringify(result));
    return result;
  } catch (e: any) {
    console.error(`[WA Send] Error sending message to ${jid}:`, e);
    throw e;
  }
}

export async function logoutWA(deviceId: string) {
  const sock = sessions.get(deviceId);
  if (sock) {
    await sock.logout();
  } else {
    // If not in memory but folder exists
    const sessionDir = path.join(process.cwd(), "sessions", deviceId);
    if (fs.existsSync(sessionDir)) {
      fs.rmSync(sessionDir, { recursive: true, force: true });
    }
    await prisma.device.update({
        where: { id: deviceId },
        data: { status: "disconnect" }
    });
    qrStore.delete(deviceId);
  }
}

export async function validateNumberWA(tenantId: string, phoneNumber: string) {
  const sock = sessions.get(tenantId);
  if (!sock) throw new Error("WhatsApp not connected");
  
  const jid = phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@s.whatsapp.net`;
  const [result] = await sock.onWhatsApp(jid);
  return result;
}

export async function getGroupsWA(tenantId: string) {
  const sock = sessions.get(tenantId);
  if (!sock) throw new Error("WhatsApp not connected");
  
  const groups = await sock.groupFetchAllParticipating();
  return groups;
}

export async function deleteMessageWA(tenantId: string, jid: string, messageKey: any) {
  const sock = sessions.get(tenantId);
  if (!sock) throw new Error("WhatsApp not connected");
  
  await sock.sendMessage(jid, { delete: messageKey });
  return true;
}

export async function simulateTypingWA(tenantId: string, phoneNumber: string) {
  const sock = sessions.get(tenantId);
  if (!sock) throw new Error("WhatsApp not connected");
  
  const jid = phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@s.whatsapp.net`;
  await sock.sendPresenceUpdate('composing', jid);
  
  // Auto clear typing status after 3 seconds
  setTimeout(() => {
    sock.sendPresenceUpdate('paused', jid).catch(() => {});
  }, 3000);
  
  return true;
}
