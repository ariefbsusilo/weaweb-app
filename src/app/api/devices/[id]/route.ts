import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logoutWA } from "@/lib/whatsapp";
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

    return NextResponse.json(device);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const tenantId = (session as any)?.tenantId;
    if (!tenantId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { id: deviceId } = await params;
    
    // First, ensure the device belongs to the tenant
    const device = await prisma.device.findUnique({ where: { id: deviceId } });
    if (!device || device.tenantId !== tenantId) {
      return NextResponse.json({ success: false, error: "Device not found" }, { status: 404 });
    }

    // Logout and destroy session if exists
    await logoutWA(deviceId);

    // Delete from DB
    await prisma.device.delete({
      where: { id: deviceId }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const tenantId = (session as any)?.tenantId;
    if (!tenantId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { id: deviceId } = await params;

    const device = await prisma.device.findUnique({ where: { id: deviceId } });
    if (!device || device.tenantId !== tenantId) {
      return NextResponse.json({ success: false, error: "Device not found" }, { status: 404 });
    }

    const body = await req.json();
    const { name, officialToken, officialPhoneId, officialWabaId } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (officialToken !== undefined && officialToken !== null && officialToken !== "") updateData.officialToken = officialToken;
    if (officialPhoneId !== undefined) updateData.officialPhoneId = officialPhoneId;
    if (officialWabaId !== undefined) updateData.officialWabaId = officialWabaId;

    const updated = await prisma.device.update({
      where: { id: deviceId },
      data: updateData
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
