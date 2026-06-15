import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const device = await prisma.device.findFirst({
      where: { 
        id: id,
        tenant: { users: { some: { userId: session.user.id } } }
      }
    })

    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 })
    }

    const integrations = await prisma.aiIntegration.findMany({
      where: { deviceId: device.id, provider: "custom" },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(integrations)
  } catch (error) {
    console.error("Failed to fetch AI Integrations:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const device = await prisma.device.findFirst({
      where: { 
        id: id,
        tenant: { users: { some: { userId: session.user.id } } }
      }
    })

    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 })
    }

    const body = await req.json()
    const { name, description, webhookUrl } = body

    if (!name || !webhookUrl) {
      return NextResponse.json({ error: "Name and Webhook URL are required" }, { status: 400 })
    }

    const integration = await prisma.aiIntegration.create({
      data: {
        deviceId: device.id,
        name,
        description,
        webhookUrl,
        provider: "custom",
        isActive: true
      }
    })

    return NextResponse.json(integration)
  } catch (error) {
    console.error("Failed to create Custom AI Tool:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const toolId = url.searchParams.get("toolId");

    if (!toolId) {
       return NextResponse.json({ error: "Tool ID is required" }, { status: 400 });
    }

    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const device = await prisma.device.findFirst({
      where: { 
        id: id,
        tenant: { users: { some: { userId: session.user.id } } }
      }
    })

    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 })
    }

    await prisma.aiIntegration.delete({
      where: { id: toolId, deviceId: device.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete AI Tool:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
