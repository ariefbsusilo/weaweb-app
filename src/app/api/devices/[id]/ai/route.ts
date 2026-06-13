import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify device belongs to user's tenant
    const device = await prisma.device.findFirst({
      where: { 
        id: params.id,
        tenant: { users: { some: { userId: session.user.id } } }
      }
    })

    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 })
    }

    const aiConfig = await prisma.aiConfig.findUnique({
      where: { deviceId: device.id }
    })

    return NextResponse.json(aiConfig || { 
      deviceId: device.id, 
      isActive: false, 
      provider: "gemini", 
      apiKey: "", 
      prompt: "You are a helpful WhatsApp assistant." 
    })
  } catch (error) {
    console.error("Failed to fetch AI Config:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const device = await prisma.device.findFirst({
      where: { 
        id: params.id,
        tenant: { users: { some: { userId: session.user.id } } }
      }
    })

    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 })
    }

    const body = await req.json()
    const { isActive, provider, apiKey, prompt } = body

    const aiConfig = await prisma.aiConfig.upsert({
      where: { deviceId: device.id },
      update: {
        isActive,
        provider,
        apiKey,
        prompt
      },
      create: {
        deviceId: device.id,
        isActive,
        provider,
        apiKey,
        prompt
      }
    })

    return NextResponse.json(aiConfig)
  } catch (error) {
    console.error("Failed to save AI Config:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
