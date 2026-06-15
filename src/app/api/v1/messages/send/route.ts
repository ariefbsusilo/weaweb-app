import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sessions } from "@/lib/whatsapp"

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid API Key" }, { status: 401 })
    }

    const apiKeyStr = authHeader.split(" ")[1]
    
    // Find Device by API Key
    const device = await prisma.device.findUnique({
      where: { apiKey: apiKeyStr },
      include: { tenant: true }
    })

    if (!device) {
      return NextResponse.json({ error: "Unauthorized: Invalid Device API Key" }, { status: 401 })
    }

    if (device.status !== "connect") {
      return NextResponse.json({ error: "Device is disconnected. Please scan QR first." }, { status: 400 })
    }

    const body = await req.json()
    const { target, content, mediaUrl, mediaType, location } = body

    if (!target || !content) {
      return NextResponse.json({ error: "Missing 'target' or 'content'" }, { status: 400 })
    }

    let phoneNumber = target;
    if (target.includes('@g.us')) {
      phoneNumber = target;
    } else if (target.includes('@s.whatsapp.net')) {
      phoneNumber = target;
    } else {
      phoneNumber = target.replace(/[^0-9]/g, '');
    }

    const contact = await prisma.contact.upsert({
      where: { tenantId_phoneNumber: { tenantId: device.tenantId, phoneNumber } },
      update: {},
      create: {
        tenantId: device.tenantId,
        phoneNumber,
        name: phoneNumber.includes('@g.us') ? "API Group" : "API Contact"
      }
    });

    let wamid = `mock-wa-id-${Date.now()}`;
    let status = "sent";

    const sock = sessions.get(device.id);
    if (!sock) {
      return NextResponse.json({ success: false, error: "WhatsApp session is not active." }, { status: 400 });
    }

    // Send via direct Baileys sock
    try {
      console.log(`[API Send] Sending message directly for tenant ${device.tenantId} to ${phoneNumber}`);
      
      const finalContent = content + "\n\n> _Sent via Weaweb _";
      let msg: any = { text: finalContent };

      if (mediaUrl) {
        if (mediaType === "image") msg = { image: { url: mediaUrl }, caption: finalContent };
        else if (mediaType === "video") msg = { video: { url: mediaUrl }, caption: finalContent };
        else if (mediaType === "audio") msg = { audio: { url: mediaUrl }, ptt: true };
        else if (mediaType === "document") msg = { document: { url: mediaUrl }, caption: finalContent, mimetype: "application/pdf", fileName: "Document.pdf" };
      } else if (location) {
        const [lat, lng] = location.split(",").map(Number);
        if (!isNaN(lat) && !isNaN(lng)) {
          msg = { location: { degreesLatitude: lat, degreesLongitude: lng } };
        }
      }

      await sock.sendMessage(phoneNumber, msg);
      wamid = `wa-sent-${Date.now()}`;
    } catch (e: any) {
      console.error("[API Send] Failed to send message directly", e);
      status = "failed";
    }

    // Create Message Record
    const message = await prisma.message.create({
      data: {
        tenantId: device.tenantId,
        contactId: contact.id,
        content,
        mediaUrl,
        mediaType,
        status,
        direction: "outbound",
        whatsappId: wamid
      }
    })

    return NextResponse.json({ 
      success: status === "sent", 
      messageId: message.id,
      whatsappId: wamid,
      status
    })

  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid API Key" }, { status: 401 })
    }

    const apiKeyStr = authHeader.split(" ")[1]
    
    const device = await prisma.device.findUnique({
      where: { apiKey: apiKeyStr },
      include: { tenant: true }
    })

    if (!device) {
      return NextResponse.json({ error: "Unauthorized: Invalid Device API Key" }, { status: 401 })
    }

    if (device.status !== "connect") {
      return NextResponse.json({ error: "Device is disconnected. Please scan QR first." }, { status: 400 })
    }

    const { searchParams } = new URL(req.url)
    const target = searchParams.get("target") || searchParams.get("phone") || searchParams.get("to")
    const content = searchParams.get("content") || searchParams.get("text")
    const mediaUrl = searchParams.get("mediaUrl") || searchParams.get("url")
    const mediaType = searchParams.get("mediaType") || searchParams.get("type")
    
    // Parse location if provided
    let location = null;
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    if (lat && lng) {
      location = {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        name: searchParams.get("locName"),
        address: searchParams.get("locAddress")
      };
    }

    if (!target || !content) {
      return NextResponse.json({ error: "Missing 'target' or 'content' in query parameters" }, { status: 400 })
    }

    let phoneNumber = target;
    if (target.includes('@g.us')) {
      phoneNumber = target;
    } else if (target.includes('@s.whatsapp.net')) {
      phoneNumber = target;
    } else {
      phoneNumber = target.replace(/[^0-9]/g, '');
    }

    const contact = await prisma.contact.upsert({
      where: { tenantId_phoneNumber: { tenantId: device.tenantId, phoneNumber } },
      update: {},
      create: {
        tenantId: device.tenantId,
        phoneNumber,
        name: phoneNumber.includes('@g.us') ? "API Group" : "API Contact"
      }
    });

    const sock = sessions.get(device.id);
    if (!sock) {
      return NextResponse.json({ success: false, error: "WhatsApp session is not active." }, { status: 400 });
    }

    let wamid = `mock-wa-id-${Date.now()}`;
    let status = "sent";
    
    // Send via direct Baileys sock
    try {
      console.log(`[API Send] Sending message directly for tenant ${device.tenantId} to ${phoneNumber}`);
      
      const finalContent = content + "\n\n> _Sent via Weaweb _";
      let msg: any = { text: finalContent };

      if (mediaUrl) {
        if (mediaType === "image") msg = { image: { url: mediaUrl }, caption: finalContent };
        else if (mediaType === "video") msg = { video: { url: mediaUrl }, caption: finalContent };
        else if (mediaType === "audio") msg = { audio: { url: mediaUrl }, ptt: true };
        else if (mediaType === "document") msg = { document: { url: mediaUrl }, caption: finalContent, mimetype: "application/pdf", fileName: "Document.pdf" };
      } else if (location) {
        msg = { location: { degreesLatitude: location.latitude, degreesLongitude: location.longitude, name: location.name, address: location.address } };
      }

      await sock.sendMessage(phoneNumber, msg);
      wamid = `wa-sent-${Date.now()}`;
    } catch (e: any) {
      console.error("[API Send] Failed to send message directly", e);
      status = "failed";
    }

    const message = await prisma.message.create({
      data: {
        tenantId: device.tenantId,
        contactId: contact.id,
        content,
        mediaUrl,
        mediaType,
        status,
        direction: "outbound",
        whatsappId: wamid
      }
    })

    return NextResponse.json({ 
      success: status === "sent", 
      messageId: message.id,
      whatsappId: wamid,
      status
    })

  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
