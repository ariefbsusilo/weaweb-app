import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const tenantId = (session as any)?.tenantId;
    if (!tenantId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const deviceId = searchParams.get("deviceId");

    if (!deviceId) {
      return NextResponse.json({ success: false, error: "Missing deviceId" }, { status: 400 });
    }

    const device = await prisma.device.findUnique({
      where: { id: deviceId, tenantId }
    });

    if (!device) {
      return NextResponse.json({ success: false, error: "Device not found" }, { status: 404 });
    }

    if (device.provider !== "official" || !device.officialWabaId || !device.officialToken) {
      return NextResponse.json({ success: false, error: "Device is not configured for Official Meta API" }, { status: 400 });
    }

    // Fetch from Meta Graph API
    const response = await fetch(`https://graph.facebook.com/v17.0/${device.officialWabaId}/message_templates`, {
      headers: {
        'Authorization': `Bearer ${device.officialToken}`
      }
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ success: false, error: data.error.message }, { status: 400 });
    }

    // Filter only APPROVED templates (optional, but good UX)
    const approvedTemplates = data.data?.filter((t: any) => t.status === "APPROVED") || [];

    return NextResponse.json({ success: true, data: approvedTemplates });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
