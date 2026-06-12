import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const tenantId = (session as any).tenantId;
    const { contacts } = await req.json();

    if (!Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json({ error: "Invalid data format or empty" }, { status: 400 });
    }

    let successCount = 0;
    let failCount = 0;

    for (const row of contacts) {
      try {
        const phoneNumber = row.phoneNumber?.replace(/\D/g, "");
        if (!phoneNumber) {
          failCount++;
          continue;
        }

        const name = row.name || "Unknown";
        const tags = row.tags || null;
        
        // Everything else goes to customFields
        const customData = { ...row };
        delete customData.phoneNumber;
        delete customData.name;
        delete customData.tags;
        
        const customFields = Object.keys(customData).length > 0 ? JSON.stringify(customData) : null;

        await prisma.contact.upsert({
          where: { tenantId_phoneNumber: { tenantId, phoneNumber } },
          update: { name, tags, customFields },
          create: { tenantId, phoneNumber, name, tags, customFields }
        });

        successCount++;
      } catch (err) {
        failCount++;
      }
    }

    return NextResponse.json({ success: true, successCount, failCount });
  } catch (error: any) {
    console.error("Import Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
