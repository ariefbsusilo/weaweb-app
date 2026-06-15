import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const device = await prisma.device.findFirst({
      where: { 
        id: id,
        tenant: { users: { some: { userId: session.user.id } } }
      }
    });

    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    const evals = await prisma.aiEvaluationLog.findMany({
      where: { deviceId: device.id },
      orderBy: { createdAt: "desc" }
    });

    const contactIds = evals.map(e => e.contactId);
    const contacts = await prisma.contact.findMany({
      where: { id: { in: contactIds } }
    });

    const enrichedEvals = evals.map(e => {
      const contact = contacts.find(c => c.id === e.contactId);
      return {
        ...e,
        contactName: contact?.name && contact.name !== "Unknown" ? contact.name : (contact?.phoneNumber || "Unknown")
      };
    });

    return NextResponse.json(enrichedEvals);
  } catch (error) {
    console.error("Failed to fetch evaluations:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const evalId = url.searchParams.get("evalId");

    if (!evalId) {
      return NextResponse.json({ error: "Missing evalId" }, { status: 400 });
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const device = await prisma.device.findFirst({
      where: { 
        id: id,
        tenant: { users: { some: { userId: session.user.id } } }
      }
    });

    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    await prisma.aiEvaluationLog.delete({
      where: { id: evalId, deviceId: device.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete evaluation:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
