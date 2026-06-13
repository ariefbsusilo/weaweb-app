import { NextResponse } from "next/server";
import { authenticateApiKey } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const apiKey = await authenticateApiKey(req);
    if (!apiKey) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { messageId } = body;

    if (!messageId) return NextResponse.json({ error: "Missing 'messageId'" }, { status: 400 });

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { contact: true }
    });

    if (!message || message.tenantId !== apiKey.tenantId) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }
    
    if (!message.whatsappId) {
      return NextResponse.json({ error: "Message does not have a WhatsApp ID yet" }, { status: 400 });
    }

    const res = await fetch(`http://127.0.0.1:4010/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        tenantId: apiKey.tenantId, 
        jid: message.contact.phoneNumber,
        messageId: message.whatsappId,
        fromMe: message.direction === "outbound"
      })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    // Update DB
    await prisma.message.update({
      where: { id: messageId },
      data: { status: "deleted" }
    });

    return NextResponse.json({ success: true, message: "Message deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
