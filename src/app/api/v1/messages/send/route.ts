import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid API Key" }, { status: 401 })
    }

    const apiKeyStr = authHeader.split(" ")[1]
    
    // Find Tenant by API Key
    const apiKeyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKeyStr },
      include: { tenant: true }
    })

    if (!apiKeyRecord) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { target, content, mediaUrl, mediaType, location } = body

    if (!target || !content) {
      return NextResponse.json({ error: "Missing 'target' or 'content'" }, { status: 400 })
    }

    // Format target correctly
    // If it's a group, it already contains @g.us
    // If it's a standard number, the worker will append @s.whatsapp.net automatically
    let phoneNumber = target;
    if (target.includes('@g.us')) {
      phoneNumber = target;
    } else if (target.includes('@s.whatsapp.net')) {
      phoneNumber = target;
    } else {
      // Clean standard numbers
      phoneNumber = target.replace(/[^0-9]/g, '');
    }

    // Upsert contact so we have a record
    const contact = await prisma.contact.upsert({
      where: { tenantId_phoneNumber: { tenantId: apiKeyRecord.tenantId, phoneNumber } },
      update: {},
      create: {
        tenantId: apiKeyRecord.tenantId,
        phoneNumber,
        name: phoneNumber.includes('@g.us') ? "API Group" : "API Contact"
      }
    });

    let wamid = `mock-wa-id-${Date.now()}`;
    let status = "sent";
    
    // Send via local worker
    try {
      console.log(`[API Send] Forwarding message to worker for tenant ${apiKeyRecord.tenantId} to ${phoneNumber}`);
      const res = await fetch("http://127.0.0.1:4010/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          tenantId: apiKeyRecord.tenantId, 
          phoneNumber, 
          content,
          mediaUrl,
          mediaType,
          location
        })
      });
      
      const resData = await res.json();
      if (!res.ok || !resData.success) {
         throw new Error(resData.error || "Worker failed to send message");
      }
      wamid = `wa-sent-${Date.now()}`;
    } catch (e: any) {
      console.error("[API Send] Failed to send message via worker", e);
      status = "failed";
    }

    // Create Message Record
    const message = await prisma.message.create({
      data: {
        tenantId: apiKeyRecord.tenantId,
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
    
    const apiKeyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKeyStr },
      include: { tenant: true }
    })

    if (!apiKeyRecord) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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
      where: { tenantId_phoneNumber: { tenantId: apiKeyRecord.tenantId, phoneNumber } },
      update: {},
      create: {
        tenantId: apiKeyRecord.tenantId,
        phoneNumber,
        name: phoneNumber.includes('@g.us') ? "API Group" : "API Contact"
      }
    });

    let wamid = `mock-wa-id-${Date.now()}`;
    let status = "sent";
    
    try {
      const res = await fetch("http://127.0.0.1:4010/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          tenantId: apiKeyRecord.tenantId, 
          phoneNumber, 
          content,
          mediaUrl,
          mediaType,
          location
        })
      });
      
      const resData = await res.json();
      if (!res.ok || !resData.success) {
         throw new Error(resData.error || "Worker failed to send message");
      }
      wamid = `wa-sent-${Date.now()}`;
    } catch (e: any) {
      status = "failed";
    }

    const message = await prisma.message.create({
      data: {
        tenantId: apiKeyRecord.tenantId,
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
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
