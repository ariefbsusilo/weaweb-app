import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const WORKER_URL = process.env.WORKER_URL || "http://127.0.0.1:4010";

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
    const cleanPhone = phoneNumber.replace(/[^0-9@.]/g, "");

    // Verify if there is a connected device
    const connectedDevice = await prisma.device.findFirst({
      where: { tenantId, status: "connect" }
    });
    if (!connectedDevice) {
      return NextResponse.json({ 
        error: "No connected device found. Please connect your WhatsApp device first." 
      }, { status: 400 });
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

    // Try to send via worker
    let wamid = `msg-${Date.now()}`;
    let sendStatus = "queued";

    try {
      console.log(`[Inbox New] Sending to worker at ${WORKER_URL}/send`);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      
      const workerRes = await fetch(`${WORKER_URL}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, phoneNumber: cleanPhone, content }),
        signal: controller.signal
      });
      clearTimeout(timeout);
      
      const workerData = await workerRes.json();
      
      if (workerRes.ok && workerData.success) {
        wamid = workerData.data?.key?.id || wamid;
        sendStatus = "sent";
      } else {
        throw new Error(workerData.error || "Worker returned error");
      }
    } catch (e: any) {
      console.error("[Inbox New] Worker send failed:", e.message);
      return NextResponse.json({ 
        error: e.name === 'AbortError'
          ? "WhatsApp service timeout - worker may be starting up, please try again"
          : `Failed to send: ${e.message}`
      }, { status: 500 });
    }

    // Save outbound message
    const message = await prisma.message.create({
      data: {
        tenantId,
        contactId: contact.id,
        content,
        status: sendStatus,
        direction: "outbound",
        whatsappId: wamid
      }
    });

    return NextResponse.json({ success: true, message, contact });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
