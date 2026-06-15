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

    const sources = await prisma.aiKnowledgeSource.findMany({
      where: { deviceId: device.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(sources)
  } catch (error) {
    console.error("Failed to fetch AI Knowledge Sources:", error)
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
    const { title, type, content } = body

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
    }

    const source = await prisma.aiKnowledgeSource.create({
      data: {
        deviceId: device.id,
        title,
        type: type || 'file',
        content
      }
    })

    return NextResponse.json(source)
  } catch (error) {
    console.error("Failed to create AI Knowledge Source:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
