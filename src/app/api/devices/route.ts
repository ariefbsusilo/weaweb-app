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

    const { name, phoneNumber, provider, officialToken, officialPhoneId, officialWabaId } = await req.json();
    
    if (!name || !phoneNumber) {
      return NextResponse.json({ success: false, error: "Name and phone number are required" }, { status: 400 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { _count: { select: { devices: true } } }
    });

    if (!tenant) return NextResponse.json({ success: false, error: "Tenant not found" }, { status: 404 });

    const deviceCount = tenant._count.devices;
    const planName = tenant.planName || "free";

    let maxDevices = 0;
    if (planName === "Starter") maxDevices = 1;
    else if (planName === "Business") maxDevices = 3;
    else if (planName === "AI Automation" || planName === "Custom") maxDevices = 5; // Custom can be unlimited, assuming 5 for now

    if (deviceCount >= maxDevices) {
      return NextResponse.json({ 
        success: false, 
        error: `Device limit reached. Your ${planName} plan allows up to ${maxDevices} device(s). Please upgrade your plan.` 
      }, { status: 403 });
    }

    const device = await prisma.device.create({
      data: {
        tenantId,
        name,
        phoneNumber,
        status: provider === "official" ? "connect" : "disconnect", // Official is ready to use if credentials are provided
        provider: provider || "baileys",
        officialToken,
        officialPhoneId,
        officialWabaId
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
