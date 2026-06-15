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
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const device = await prisma.device.findFirst({
      where: { id, tenant: { users: { some: { userId: session.user.id } } } }
    });
    if (!device) return NextResponse.json({ error: "Device not found" }, { status: 404 });

    const integration = await prisma.aiIntegration.findFirst({
      where: { deviceId: id, provider: "notification" }
    });

    if (integration) {
      return NextResponse.json(integration);
    } else {
      return NextResponse.json({ configJson: null });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const device = await prisma.device.findFirst({
      where: { id, tenant: { users: { some: { userId: session.user.id } } } }
    });
    if (!device) return NextResponse.json({ error: "Device not found" }, { status: 404 });

    const body = await req.json();
    const { configJson, isActive } = body;

    let integration = await prisma.aiIntegration.findFirst({
      where: { deviceId: id, provider: "notification" }
    });

    if (integration) {
      integration = await prisma.aiIntegration.update({
        where: { id: integration.id },
        data: {
          configJson: typeof configJson === "string" ? configJson : JSON.stringify(configJson),
          isActive: isActive !== undefined ? isActive : integration.isActive
        }
      });
    } else {
      integration = await prisma.aiIntegration.create({
        data: {
          deviceId: id,
          name: "Personal Notification",
          provider: "notification",
          configJson: typeof configJson === "string" ? configJson : JSON.stringify(configJson),
          isActive: isActive !== undefined ? isActive : true
        }
      });
    }

    return NextResponse.json({ success: true, data: integration });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
