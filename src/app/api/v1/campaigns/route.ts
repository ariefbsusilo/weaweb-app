import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";


export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = (session as any).tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: "No tenant found" }, { status: 403 });
    }

    const body = await req.json();
    const { name, content, targetTags, scheduledAt, mediaUrl, mediaType } = body;

    if (!name || !content) {
      return NextResponse.json({ error: "Name and content are required" }, { status: 400 });
    }

    // 1. Fetch matching contacts
    // If targetTags is provided, filter by tag. Otherwise, select all contacts.
    let contacts = [];
    if (targetTags && targetTags.trim() !== "") {
        contacts = await prisma.contact.findMany({
            where: { 
                tenantId,
                tags: { contains: targetTags }
            }
        });
    } else {
        contacts = await prisma.contact.findMany({
            where: { tenantId }
        });
    }

    if (contacts.length === 0) {
        return NextResponse.json({ error: "No contacts found matching the criteria" }, { status: 400 });
    }

    // 2. Create Campaign
    const campaign = await prisma.campaign.create({
        data: {
            tenantId,
            name,
            content,
            targetTags,
            status: "pending",
            scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
            mediaUrl,
            mediaType
        }
    });

    // 3. Create CampaignMessages and Enqueue
    // In a real production app with millions of contacts, this should be done in batches
    // For MVP, we can insert and enqueue directly
    const campaignMessagesData = contacts.map(c => ({
        campaignId: campaign.id,
        contactId: c.id,
        status: "pending",
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null
    }));

    // Prisma doesn't return created IDs from createMany in SQLite easily, 
    // so we create them in a transaction individually or use a loop
    const createdMessages = [];
    for (const data of campaignMessagesData) {
        const cm = await prisma.campaignMessage.create({ data });
        createdMessages.push(cm);
    }

    return NextResponse.json({ 
        success: true, 
        campaign, 
        messagesQueued: createdMessages.length 
    });

  } catch (error: any) {
    console.error("Failed to create campaign:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
      
        const tenantId = (session as any).tenantId;
        if (!tenantId) {
            return NextResponse.json({ error: "No tenant found" }, { status: 403 });
        }

        const campaigns = await prisma.campaign.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { messages: true }
                }
            }
        });

        return NextResponse.json(campaigns);
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
