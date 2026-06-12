import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

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

    let qr = null;
    try {
      const res = await fetch(`http://127.0.0.1:4000/qr/${deviceId}`);
      const data = await res.json();
      qr = data.qr;
    } catch (e) {
      console.error("[NextJS] Failed to fetch QR from worker", e);
    }

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
