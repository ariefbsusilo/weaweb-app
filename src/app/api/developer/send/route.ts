import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid Authorization header" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const apiKey = await prisma.apiKey.findUnique({
      where: { key: token },
      include: { tenant: true }
    });

    if (!apiKey) {
      return NextResponse.json({ error: "Invalid API Key" }, { status: 401 });
    }

    const { tenantId } = apiKey;
    const body = await req.json();
    const { phoneNumber, message, mediaUrl, mediaType } = body;

    if (!phoneNumber || !message) {
      return NextResponse.json({ error: "phoneNumber and message are required" }, { status: 400 });
    }

    // Call internal worker HTTP API to actually send it via Baileys 
    // because Baileys runs in the worker process, not Next.js
    const workerRes = await fetch("http://127.0.0.1:4010/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            tenantId, 
            phoneNumber, 
            content: message,
            mediaUrl,
            mediaType
        })
    });

    const workerData = await workerRes.json();
    if (!workerRes.ok) {
        throw new Error(workerData.error || "Worker failed to send");
    }

    // Save to Database
    await prisma.$transaction(async (tx) => {
        let contact = await tx.contact.findUnique({
            where: { tenantId_phoneNumber: { tenantId, phoneNumber } }
        });
        if (!contact) {
            contact = await tx.contact.create({
                data: { tenantId, phoneNumber, name: "API User" }
            });
        }

        await tx.message.create({
            data: {
                tenantId,
                contactId: contact.id,
                content: message,
                mediaUrl,
                mediaType,
                status: "sent",
                direction: "outbound",
                whatsappId: `wa-api-${Date.now()}`
            }
        });
    });

    return NextResponse.json({ success: true, message: "Message sent successfully via API" });

  } catch (error: any) {
    console.error("Developer API Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
