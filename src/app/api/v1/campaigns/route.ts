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
    const { name, content, targetTags, scheduledAt, mediaUrl, mediaType, mode, excelRows } = body;

    if (!name) {
      return NextResponse.json({ error: "Campaign name is required" }, { status: 400 });
    }

    if (mode === "excel") {
      if (!excelRows || excelRows.length === 0) {
        return NextResponse.json({ error: "Excel rows are required for Excel mode" }, { status: 400 });
      }

      // Create Campaign (without content since each has custom content)
      const campaign = await prisma.campaign.create({
        data: {
          tenantId,
          name,
          content: "Excel Import Campaign", // Fallback
          status: "pending",
        }
      });

      const createdMessages = [];
      for (const row of excelRows) {
        let phoneNumber = row.Phone.trim();
        if (phoneNumber.startsWith("0")) {
          phoneNumber = "62" + phoneNumber.substring(1);
        } else if (phoneNumber.startsWith("+")) {
          phoneNumber = phoneNumber.substring(1);
        }

        // Upsert contact
        const contact = await prisma.contact.upsert({
          where: { tenantId_phoneNumber: { tenantId, phoneNumber } },
          update: { name: row.Name },
          create: { tenantId, phoneNumber, name: row.Name }
        });

        // Parse Date & Time to Date object
        let parsedScheduledAt = null;
        if (row.Date && row.Time) {
           const dateTimeStr = `${row.Date}T${row.Time}`;
           const parsed = new Date(dateTimeStr);
           if (!isNaN(parsed.getTime())) {
             parsedScheduledAt = parsed;
           }
        }

        // Create CampaignMessage
        const cm = await prisma.campaignMessage.create({
          data: {
            campaignId: campaign.id,
            contactId: contact.id,
            status: "pending",
            customContent: row.Message,
            scheduledAt: parsedScheduledAt
          }
        });
        createdMessages.push(cm);
      }

      return NextResponse.json({ 
          success: true, 
          campaign, 
          messagesQueued: createdMessages.length 
      });

    } else {
      // Standard Mode
      if (!content) {
        return NextResponse.json({ error: "Content is required for standard campaign" }, { status: 400 });
      }

      // 1. Fetch matching contacts
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
      const campaignMessagesData = contacts.map(c => ({
          campaignId: campaign.id,
          contactId: c.id,
          status: "pending",
          scheduledAt: scheduledAt ? new Date(scheduledAt) : null
      }));

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
    }

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
