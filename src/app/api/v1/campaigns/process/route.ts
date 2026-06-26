import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMessageWA } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export async function GET() {
  const trace: any[] = [];
  try {
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
      take: 10
    });

    trace.push(`Found ${pendingMessages.length} pending messages`);

    for (const msg of pendingMessages) {
      const msgTrace: any = { id: msg.id, campaignId: msg.campaignId, phone: msg.contact.phoneNumber };
      
      const tenant = await prisma.tenant.findUnique({ where: { id: msg.campaign.tenantId } });
      if (!tenant) {
        msgTrace.skipReason = "Tenant not found";
        trace.push(msgTrace);
        continue;
      }
      
      let targetDeviceId = msg.campaign.deviceId;
      if (targetDeviceId) {
         msgTrace.targetDeviceId = targetDeviceId;
         const targetDevice = await prisma.device.findUnique({ where: { id: targetDeviceId } });
         if (!targetDevice) {
            msgTrace.skipReason = "Target device not found in DB";
            trace.push(msgTrace);
            continue;
         }
         msgTrace.deviceStatus = targetDevice.status;
         if (targetDevice.status !== "connect") {
            msgTrace.skipReason = `Device status is ${targetDevice.status} (expected 'connect')`;
            trace.push(msgTrace);
            continue;
         }
      } else {
         msgTrace.fallback = true;
         const tenantWithDevices = await prisma.tenant.findUnique({ where: { id: msg.campaign.tenantId }, include: { devices: true } });
         const hasOfficialDevice = tenantWithDevices?.devices?.some((d: any) => d.provider === "official");
         const hasBaileysConnected = tenantWithDevices?.whatsappStatus === "connected";
         msgTrace.hasOfficialDevice = hasOfficialDevice;
         msgTrace.hasBaileysConnected = hasBaileysConnected;
         if (!hasOfficialDevice && !hasBaileysConnected) {
            msgTrace.skipReason = "No official device and no connected baileys device";
            trace.push(msgTrace);
            continue;
         }
      }

      msgTrace.action = "WOULD_PROCESS";
      // To really debug, let's process it
      let finalContent = msg.customContent || msg.campaign.content;
      if (msg.contact.name) {
        finalContent = finalContent.replace(/{{name}}/g, msg.contact.name);
      }
      let templateOpts: any = null;
      if (msg.campaign.metaTemplateName) {
         // ... parse template ...
         templateOpts = { name: msg.campaign.metaTemplateName };
      }
      
      msgTrace.finalContent = finalContent;
      msgTrace.templateOpts = templateOpts;
      
      trace.push(msgTrace);
      
      // Let's actually execute one
      try {
        await sendMessageWA(
          tenant.id, 
          msg.contact.phoneNumber, 
          finalContent, 
          msg.campaign.mediaUrl, 
          msg.campaign.mediaType,
          null, 
          targetDeviceId || undefined, 
          templateOpts
        );
        msgTrace.sendResult = "SUCCESS";
        await prisma.campaignMessage.update({ where: { id: msg.id }, data: { status: "sent" }});
      } catch (e: any) {
        msgTrace.sendResult = "FAILED: " + e.message;
        await prisma.campaignMessage.update({ where: { id: msg.id }, data: { status: "failed" }});
      }
    }

    return NextResponse.json({ success: true, trace });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, trace });
  }
}
