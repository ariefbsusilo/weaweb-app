import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { initWhatsApp } from "@/lib/whatsapp";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const tenantId = (session as any).tenantId;
    const { id: deviceId } = await params;

    const device = await prisma.device.findUnique({ where: { id: deviceId, tenantId } });
    if (!device) return NextResponse.json({ error: "Device not found" }, { status: 404 });

    await prisma.device.update({
      where: { id: device.id },
      data: { status: "connecting" }
    });

    try {
      console.log(`[NextJS] Starting WhatsApp session directly for device ${device.id}`);
      initWhatsApp(device.id, tenantId, true).catch(err => console.error(`[WA Start Error] ${err.message}`));
    } catch (e) {
      console.error("Failed to initialize WhatsApp:", e);
      return NextResponse.json({ success: false, error: "Failed to initialize WhatsApp." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Connection process started" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
