import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const contactId = params.id;
    const body = await req.json();
    
    if (typeof body.aiEnabled !== 'boolean') {
      return NextResponse.json({ error: "Invalid aiEnabled value" }, { status: 400 });
    }

    const updatedContact = await prisma.contact.update({
      where: { id: contactId },
      data: { aiEnabled: body.aiEnabled }
    });

    return NextResponse.json({ success: true, contact: updatedContact });
  } catch (error: any) {
    console.error("Error updating contact:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
