import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    const tenantId = (session as any)?.tenantId;
    if (!tenantId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const devices = await prisma.device.findMany({
      where: { tenantId },
      include: { aiConfig: true },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ success: true, data: devices });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const tenantId = (session as any)?.tenantId;
    if (!tenantId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { name, phoneNumber } = await req.json();
    
    if (!name || !phoneNumber) {
      return NextResponse.json({ success: false, error: "Name and phone number are required" }, { status: 400 });
    }

    const device = await prisma.device.create({
      data: {
        tenantId,
        name,
        phoneNumber,
        status: "disconnect"
      }
    });

    return NextResponse.json({ success: true, data: device });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, error: "Device with this phone number already exists" }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
