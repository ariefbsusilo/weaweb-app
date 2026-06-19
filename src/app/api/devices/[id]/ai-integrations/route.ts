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

    // Return ALL integrations (built-in + custom)
    const integrations = await prisma.aiIntegration.findMany({
      where: { deviceId: device.id },
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
    const { name, description, webhookUrl, isActive, configJson } = body

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Check if integration already exists (upsert by name)
    const existing = await prisma.aiIntegration.findFirst({
      where: { deviceId: device.id, name }
    })

    let integration;
    if (existing) {
      // Update existing integration
      const updateData: any = {};
      if (isActive !== undefined) updateData.isActive = isActive;
      if (description !== undefined) updateData.description = description;
      if (webhookUrl !== undefined) updateData.webhookUrl = webhookUrl;
      if (configJson !== undefined) updateData.configJson = typeof configJson === "string" ? configJson : JSON.stringify(configJson);
      
      integration = await prisma.aiIntegration.update({
        where: { id: existing.id },
        data: updateData
      })
    } else {
      // Create new integration
      integration = await prisma.aiIntegration.create({
        data: {
          deviceId: device.id,
          name,
          description: description || "",
          webhookUrl: webhookUrl || null,
          provider: webhookUrl ? "custom" : "builtin",
          configJson: configJson ? (typeof configJson === "string" ? configJson : JSON.stringify(configJson)) : null,
          isActive: isActive !== undefined ? isActive : true
        }
      })
    }

    return NextResponse.json(integration)
  } catch (error) {
    console.error("Failed to create/update AI Integration:", error)
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
