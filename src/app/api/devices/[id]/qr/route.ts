import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { qrStore } from "@/lib/whatsapp";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const tenantId = (session as any)?.tenantId;
    if (!tenantId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { id: deviceId } = await params;
    
    const device = await prisma.device.findUnique({ where: { id: deviceId } });
    if (!device || device.tenantId !== tenantId) {
      return NextResponse.json({ success: false, error: "Device not found" }, { status: 404 });
    }

    let qr = qrStore.get(deviceId) || null;

    return NextResponse.json({ 
      success: true, 
      data: {
        status: device.status, // "connect", "disconnect", "connecting"
        qr: qr
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
