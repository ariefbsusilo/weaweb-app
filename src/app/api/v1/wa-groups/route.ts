import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { sessions } from "@/lib/whatsapp";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const tenantId = (session as any)?.tenantId;

    if (!tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find a connected device for this tenant
    const device = await prisma.device.findFirst({
      where: { tenantId, status: "connect" }
    });

    if (!device) {
      return NextResponse.json({ error: "No connected WhatsApp device found. Please connect your device first." }, { status: 404 });
    }

    // Fetch groups directly from Baileys socket in memory
    const sock = sessions.get(device.id);
    if (!sock) {
      return NextResponse.json({ error: "WhatsApp session is not active. Please check your connection." }, { status: 400 });
    }

    const groupData = await sock.groupFetchAllParticipating();
    const groups = Object.values(groupData);

    return NextResponse.json({ groups });
  } catch (error: any) {
    console.error("[WA Groups API Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
