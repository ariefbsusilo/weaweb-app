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
      where: { deviceId: device.id }
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
    const { name, isActive, provider } = body

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Check if integration exists for this device
    const existing = await prisma.aiIntegration.findFirst({
      where: { deviceId: device.id, name }
    })

    let integration;
    if (existing) {
      integration = await prisma.aiIntegration.update({
        where: { id: existing.id },
        data: { isActive }
      })
    } else {
      integration = await prisma.aiIntegration.create({
        data: {
          deviceId: device.id,
          name,
          provider: provider || "custom",
          isActive
        }
      })
    }

    return NextResponse.json(integration)
  } catch (error) {
    console.error("Failed to toggle AI Integration:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
