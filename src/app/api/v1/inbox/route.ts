import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import fs from "fs";
import path from "path";

const WORKER_URL = process.env.WORKER_URL || "http://127.0.0.1:4010";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const tenantId = (session as any).tenantId;

    // Get all contacts with their latest message
    const contacts = await prisma.contact.findMany({
      where: { tenantId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 50
        }
      }
    });

    // Filter contacts that have at least one message and sort by latest message date
    const conversations = contacts
      .filter(c => c.messages.length > 0)
      .sort((a, b) => b.messages[0].createdAt.getTime() - a.messages[0].createdAt.getTime());

    return NextResponse.json(conversations);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const tenantId = (session as any).tenantId;
    
    const contentType = req.headers.get('content-type') || '';
    let contactId: string;
    let content: string;
    let mediaUrl: string | null = null;
    let mediaType: string | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      contactId = formData.get('contactId') as string;
      content = (formData.get('content') as string) || '';
      const file = formData.get('file') as File | null;

      if (file) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
        
        const ext = file.name.split('.').pop();
        const filename = `upload_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
        
        await fs.promises.writeFile(path.join(uploadsDir, filename), buffer);
        mediaUrl = `/uploads/${filename}`;
        
        if (file.type.startsWith('image/')) mediaType = 'image';
        else if (file.type.startsWith('video/')) mediaType = 'video';
        else if (file.type.startsWith('audio/')) mediaType = 'audio';
        else mediaType = 'document';
      }
    } else {
      const body = await req.json();
      contactId = body.contactId;
      content = body.content || '';
    }

    if (!contactId! || (!content && !mediaUrl)) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const contact = await prisma.contact.findUnique({ where: { id: contactId! }});
    if (!contact) return NextResponse.json({ error: "Contact not found" }, { status: 404 });

    // Verify if there is a connected device
    const connectedDevice = await prisma.device.findFirst({
      where: { tenantId, status: "connect" }
    });
    if (!connectedDevice) {
      return NextResponse.json({ 
        error: "No connected device found. Please connect your WhatsApp device first." 
      }, { status: 400 });
    }

    // Try to send via worker
    let wamid = `msg-${Date.now()}`;
    let sendStatus = "queued";
    
    try {
      console.log(`[Inbox POST] Sending to worker at ${WORKER_URL}/send`);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      const res = await fetch(`${WORKER_URL}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, phoneNumber: contact.phoneNumber, content, mediaUrl, mediaType }),
        signal: controller.signal
      });
      clearTimeout(timeout);
      
      const resData = await res.json();
      console.log(`[Inbox POST] Worker response:`, res.status, resData);
      
      if (res.ok && resData.success) {
        wamid = resData.data?.key?.id || wamid;
        sendStatus = "sent";
      } else {
        throw new Error(resData.error || "Worker returned error");
      }
    } catch (e: any) {
      console.error("[Inbox POST] Worker send failed:", e.message);
      console.log("[Inbox POST] Falling back to local sendMessageWA...");
      
      try {
        const { sendMessageWA } = await import("@/lib/whatsapp");
        const result = await sendMessageWA(tenantId, contact.phoneNumber, content, mediaUrl || undefined, mediaType || undefined);
        wamid = result?.key?.id || wamid;
        sendStatus = "sent";
        console.log("[Inbox POST] Local send succeeded.");
      } catch (localErr: any) {
        console.error("[Inbox POST] Local send failed:", localErr.message);
        return NextResponse.json({ 
          error: "Failed to send message. WhatsApp device might be disconnected or worker is unreachable."
        }, { status: 500 });
      }
    }

    const message = await prisma.message.create({
      data: {
        tenantId,
        contactId: contactId!,
        content,
        mediaUrl,
        mediaType,
        status: sendStatus,
        direction: "outbound",
        whatsappId: wamid
      }
    });

    return NextResponse.json({ success: true, message });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
