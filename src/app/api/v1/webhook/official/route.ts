import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Verification Endpoint for Meta Webhook
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  // Since we don't have a global env VERIFY_TOKEN, we'll accept any token for MVP
  // Ideally, the user configures their own verify_token.
  if (mode === "subscribe" && challenge) {
    console.log("WEBHOOK_VERIFIED");
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

// Handle Incoming Messages & Status Updates from Meta
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.object) {
      if (
        body.entry &&
        body.entry[0].changes &&
        body.entry[0].changes[0] &&
        body.entry[0].changes[0].value.messages &&
        body.entry[0].changes[0].value.messages[0]
      ) {
        const phone_number_id = body.entry[0].changes[0].value.metadata.phone_number_id;
        const from = body.entry[0].changes[0].value.messages[0].from;
        const msg_body = body.entry[0].changes[0].value.messages[0].text?.body || "[Media Message]";

        // Find which tenant this phone_number_id belongs to
        const device = await prisma.device.findFirst({
          where: { officialPhoneId: phone_number_id, provider: "official" },
          include: { tenant: true }
        });

        if (device) {
          console.log(`[Official API] Received msg from ${from}: ${msg_body}`);

          // Save contact if doesn't exist
          const contact = await prisma.contact.upsert({
            where: { tenantId_phoneNumber: { tenantId: device.tenantId, phoneNumber: from } },
            update: {},
            create: {
              tenantId: device.tenantId,
              phoneNumber: from,
              name: `Official Contact ${from.substring(from.length - 4)}`
            }
          });

          // Save message
          await prisma.message.create({
            data: {
              tenantId: device.tenantId,
              contactId: contact.id,
              content: msg_body,
              status: "delivered",
              direction: "inbound",
              whatsappId: body.entry[0].changes[0].value.messages[0].id
            }
          });

          // Trigger Tenant Webhook if exists
          if (device.tenant.webhookUrl) {
            try {
              await fetch(device.tenant.webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  event: "message.received",
                  data: {
                    from,
                    text: msg_body,
                    timestamp: new Date()
                  }
                })
              });
            } catch (err) {
              console.error("[Official API] Webhook forward error:", err);
            }
          }
        }
      }

      return new NextResponse("EVENT_RECEIVED", { status: 200 });
    } else {
      return new NextResponse("Not Found", { status: 404 });
    }
  } catch (err) {
    console.error("[Official API Webhook Error]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
