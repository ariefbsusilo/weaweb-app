import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const tenantId = (session as any).tenantId;
    const { phoneNumber, content } = await req.json();

    if (!phoneNumber || !content) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Clean phone number
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, "");

    // Verify if there is a connected device
    const connectedDevice = await prisma.device.findFirst({
      where: { tenantId, status: "connect" }
    });
    if (!connectedDevice) {
      return NextResponse.json({ error: "No connected device found. Please connect your WhatsApp device first." }, { status: 400 });
    }

    // Find or create contact
    let contact = await prisma.contact.findUnique({
        where: { tenantId_phoneNumber: { tenantId, phoneNumber: cleanPhone } }
    });
    
    if (!contact) {
        contact = await prisma.contact.create({
            data: { tenantId, phoneNumber: cleanPhone, name: cleanPhone }
        });
    }

    // Save outbound message
    const message = await prisma.message.create({
        data: {
            tenantId,
            contactId: contact.id,
            content: content,
            status: "queued",
            direction: "outbound",
            whatsappId: `wa-direct-${Date.now()}`
        }
    });

    // We can directly send to the local worker
    try {
        await fetch((process.env.WORKER_URL || "http://127.0.0.1:4010") + "/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                tenantId: tenantId,
                phoneNumber: cleanPhone,
                content: content
            })
        });
        
        // Update to sent locally since we dispatched it
        await prisma.message.update({
            where: { id: message.id },
            data: { status: "sent" }
        });
    } catch (err) {
        console.error("Failed to forward to worker:", err);
    }

    return NextResponse.json({ success: true, message });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
