import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string, dataId: string }> }
) {
  try {
    const { id, dataId } = await params;
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

    await prisma.aiData.delete({
      where: { 
        id: dataId,
        deviceId: device.id // ensure it belongs to this device
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete AI Data:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
