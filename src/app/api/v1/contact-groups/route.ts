import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const tenantId = (session as any)?.tenantId;
    if (!tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const groups = await prisma.contactGroup.findMany({
      where: { tenantId },
      include: {
        _count: {
          select: { contacts: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(groups);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const tenantId = (session as any)?.tenantId;
    if (!tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, contactIds } = await req.json();
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const group = await prisma.contactGroup.create({
      data: {
        tenantId,
        name,
        contacts: contactIds ? {
          connect: contactIds.map((id: string) => ({ id }))
        } : undefined
      }
    });

    return NextResponse.json(group);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
