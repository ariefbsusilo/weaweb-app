import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string, sourceId: string }> }
) {
  try {
    const { id, sourceId } = await params;
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

    // Verify source belongs to this device
    const source = await prisma.aiKnowledgeSource.findFirst({
      where: { 
        id: sourceId,
        deviceId: device.id
      }
    })

    if (!source) {
      return NextResponse.json({ error: "Source not found" }, { status: 404 })
    }

    await prisma.aiKnowledgeSource.delete({
      where: { id: sourceId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete AI Knowledge Source:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
