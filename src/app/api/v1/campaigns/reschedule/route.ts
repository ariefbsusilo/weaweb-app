import { NextResponse } from "next/server";
import { authenticateApiKey } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const apiKey = await authenticateApiKey(req);
    if (!apiKey) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { campaignMessageId, scheduledAt } = body;

    if (!campaignMessageId || !scheduledAt) {
      return NextResponse.json({ error: "Missing 'campaignMessageId' or 'scheduledAt'" }, { status: 400 });
    }

    const campaignMessage = await prisma.campaignMessage.findUnique({
      where: { id: campaignMessageId },
      include: { campaign: true }
    });

    if (!campaignMessage || campaignMessage.campaign.tenantId !== apiKey.tenantId) {
      return NextResponse.json({ error: "Campaign message not found" }, { status: 404 });
    }
    
    if (campaignMessage.status !== "pending") {
      return NextResponse.json({ error: `Cannot reschedule message with status: ${campaignMessage.status}` }, { status: 400 });
    }

    const newDate = new Date(scheduledAt);

    await prisma.campaignMessage.update({
      where: { id: campaignMessageId },
      data: { scheduledAt: newDate }
    });

    return NextResponse.json({ success: true, newDate });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
