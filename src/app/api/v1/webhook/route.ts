import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "weaweb_secret_token"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const mode = url.searchParams.get("hub.mode")
  const token = url.searchParams.get("hub.verify_token")
  const challenge = url.searchParams.get("hub.challenge")

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  } else {
    return new NextResponse("Forbidden", { status: 403 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const url = new URL(req.url)
    // Assume tenant ID is passed in webhook URL for multi-tenancy: /api/v1/webhook?tenantId=cuid
    // If not, we fallback to finding the first tenant (for MVP demo purposes)
    let tenantId = url.searchParams.get("tenantId")
    if (!tenantId) {
      const firstTenant = await prisma.tenant.findFirst()
      if (firstTenant) tenantId = firstTenant.id
    }

    await prisma.webhookLog.create({
      data: {
        tenantId,
        eventType: "whatsapp_incoming",
        payload: JSON.stringify(body)
      }
    })

    if (!body.entry?.[0]?.changes?.[0]?.value) {
        return new NextResponse("OK", { status: 200 })
    }

    const value = body.entry[0].changes[0].value;

    // 1. Process Status Updates (Delivery Receipts)
    if (value.statuses) {
      for (const statusObj of value.statuses) {
        const wamid = statusObj.id
        const newStatus = statusObj.status 
        await prisma.message.updateMany({
          where: { whatsappId: wamid },
          data: { status: newStatus }
        })
      }
    }

    // 2. Process Incoming Messages
    if (value.messages && tenantId) {
      for (const msg of value.messages) {
        if (msg.type === "text") {
            const incomingText = msg.text.body;
            const fromPhone = msg.from;
            const wamid = msg.id;

            // Find or create contact
            let contact = await prisma.contact.findUnique({
                where: { tenantId_phoneNumber: { tenantId, phoneNumber: fromPhone } }
            });
            
            if (!contact) {
                contact = await prisma.contact.create({
                    data: { tenantId, phoneNumber: fromPhone, name: msg.profile?.name || "Unknown" }
                });
            }

            // Save incoming message
            await prisma.message.create({
                data: {
                    tenantId,
                    contactId: contact.id,
                    content: incomingText,
                    status: "delivered",
                    direction: "inbound",
                    whatsappId: wamid
                }
            });

            // Auto-Reply Chatbot Logic
            const rules = await prisma.autoReplyRule.findMany({
                where: { tenantId, isActive: true }
            });

            for (const rule of rules) {
                let isMatch = false;
                if (rule.matchType === "exact" && incomingText.trim().toLowerCase() === rule.keyword.trim().toLowerCase()) {
                    isMatch = true;
                } else if (rule.matchType === "contains" && incomingText.toLowerCase().includes(rule.keyword.toLowerCase())) {
                    isMatch = true;
                }

                if (isMatch) {
                    // Send Auto-Reply via local worker
                    try {
                        await fetch("http://127.0.0.1:4000/send", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                tenantId,
                                phoneNumber: contact.phoneNumber,
                                content: rule.replyText
                            })
                        });
                    } catch (e) {
                        console.error("[Webhook] Failed to forward auto-reply to worker", e);
                    }
                    break; // Only match one rule per message
                }
            }
        }
      }
    }

    return new NextResponse("OK", { status: 200 })
  } catch (error) {
    console.error("Webhook processing error:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
