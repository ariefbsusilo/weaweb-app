import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { initWhatsApp, sendMessageWA, logoutWA, qrStore, validateNumberWA, getGroupsWA, deleteMessageWA, simulateTypingWA } from "./lib/whatsapp";

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// API Endpoints for Next.js to communicate with Worker
app.get("/qr/:deviceId", (req, res) => {
  const { deviceId } = req.params;
  const qr = qrStore.get(deviceId);
  res.json({ qr: qr || null });
});

app.post("/action", async (req, res) => {
  const { deviceId, tenantId, action } = req.body;
  if (!deviceId || !action) return res.status(400).json({ error: "Missing parameters" });

  try {
    if (action === "start") {
      console.log(`[WA System] Starting session for device ${deviceId}`);
      await initWhatsApp(deviceId, tenantId);
    } else if (action === "logout") {
      console.log(`[WA System] Logging out session for device ${deviceId}`);
      await logoutWA(deviceId);
    }
    res.json({ success: true });
  } catch (error: any) {
    console.error(`[WA System Error] ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

app.post("/send", async (req, res) => {
  const { tenantId, phoneNumber, content, mediaUrl, mediaType, location } = req.body;
  if (!tenantId || !phoneNumber || !content) return res.status(400).json({ error: "Missing parameters" });

  try {
    const result = await sendMessageWA(tenantId, phoneNumber, content, mediaUrl, mediaType, location);
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error(`[WA Send Error] ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

app.get("/groups/:deviceId", async (req, res) => {
  const { deviceId } = req.params;
  
  try {
    const groups = await getGroupsWA(deviceId);
    res.json({ success: true, groups: Object.values(groups) });
  } catch (error: any) {
    console.error(`[WA Groups Error] ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

app.post("/validate", async (req, res) => {
  const { tenantId, phoneNumber } = req.body;
  if (!tenantId || !phoneNumber) return res.status(400).json({ error: "Missing parameters" });
  try {
    const result = await validateNumberWA(tenantId, phoneNumber);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/groups/:tenantId", async (req, res) => {
  const { tenantId } = req.params;
  if (!tenantId) return res.status(400).json({ error: "Missing parameters" });
  try {
    const groups = await getGroupsWA(tenantId);
    res.json({ success: true, data: groups });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/delete", async (req, res) => {
  const { tenantId, jid, messageId, fromMe } = req.body;
  if (!tenantId || !jid || !messageId) return res.status(400).json({ error: "Missing parameters" });
  try {
    await deleteMessageWA(tenantId, jid, { id: messageId, fromMe: fromMe ?? true });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/typing", async (req, res) => {
  const { tenantId, phoneNumber } = req.body;
  if (!tenantId || !phoneNumber) return res.status(400).json({ error: "Missing parameters" });
  try {
    await simulateTypingWA(tenantId, phoneNumber);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Campaign Poller (Replaces BullMQ)
async function startCampaignPoller() {
  console.log("🚀 Weaweb Campaign Poller started...");
  
  setInterval(async () => {
    try {
      // Find up to 5 pending messages
      const pendingMessages = await prisma.campaignMessage.findMany({
        where: { 
          status: "pending",
          OR: [
            { scheduledAt: null },
            { scheduledAt: { lte: new Date() } }
          ]
        },
        include: {
          campaign: true,
          contact: true,
        },
        take: 5
      });

      for (const msg of pendingMessages) {
        // Only process if tenant is connected
        const tenant = await prisma.tenant.findUnique({ where: { id: msg.campaign.tenantId } });
        if (tenant?.whatsappStatus !== "connected") continue;

        console.log(`[Poller] Processing campaign message for contact: ${msg.contact.phoneNumber}`);
        let wamid = `wa-mock-${Date.now()}`;
        
        let finalContent = msg.campaign.content;
        if (msg.contact.name) {
          finalContent = finalContent.replace(/{{name}}/g, msg.contact.name);
        }
        
        try {
          await sendMessageWA(
            tenant.id, 
            msg.contact.phoneNumber, 
            finalContent, 
            msg.campaign.mediaUrl, 
            msg.campaign.mediaType
          );
          wamid = `wa-sent-${Date.now()}`;
        } catch (e: any) {
          console.error(`[WA] Failed to send to ${msg.contact.phoneNumber}:`, e.message);
          await prisma.campaignMessage.update({
            where: { id: msg.id },
            data: { status: "failed" }
          });
          continue;
        }

        // Success
        await prisma.$transaction(async (tx) => {
          const newMsg = await tx.message.create({
            data: {
              tenantId: tenant.id,
              contactId: msg.contactId,
              content: msg.campaign.content,
              status: "sent",
              direction: "outbound",
              whatsappId: wamid,
              mediaUrl: msg.campaign.mediaUrl,
              mediaType: msg.campaign.mediaType
            }
          });
          
          await tx.campaignMessage.update({
            where: { id: msg.id },
            data: { 
              status: "sent",
              messageId: newMsg.id
            }
          });
        });

        // Check if campaign completed
        const pendingCount = await prisma.campaignMessage.count({
          where: { campaignId: msg.campaignId, status: "pending" }
        });

        if (pendingCount === 0) {
          await prisma.campaign.update({
            where: { id: msg.campaignId },
            data: { status: "completed" }
          });
          console.log(`✅ Campaign ${msg.campaignId} fully completed!`);
        }

        // Random delay between 3s and 8s to avoid spam detection
        const delayMs = Math.floor(Math.random() * 5000) + 3000;
        console.log(`[Poller] Waiting ${delayMs}ms before next message...`);
        await new Promise(res => setTimeout(res, delayMs));
      }
    } catch (e) {
      console.error("[Poller Error]", e);
    }
  }, 5000); // Poll every 5 seconds
}

// Startup
async function startup() {
  console.log("🚀 Weaweb Worker (No-Redis) starting on port 4000...");
  
  const devices = await prisma.device.findMany({
    where: { status: { in: ["connect", "connecting"] } }
  });
  
  for (const d of devices) {
    console.log(`[WA] Auto-starting session for device: ${d.id}`);
    await initWhatsApp(d.id, d.tenantId);
  }

  app.listen(4000, "0.0.0.0", () => {
    console.log("✅ Worker HTTP API listening on http://0.0.0.0:4000");
  });

  startCampaignPoller();
}

startup();
