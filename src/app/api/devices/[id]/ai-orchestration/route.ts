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

    const nodes = await prisma.aiOrchestrationNode.findMany({
      where: { deviceId: device.id }
    })

    const edges = await prisma.aiOrchestrationEdge.findMany({
      where: { deviceId: device.id }
    })

    return NextResponse.json({ nodes, edges })
  } catch (error) {
    console.error("Failed to fetch AI Orchestration:", error)
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
    const { nodes, edges } = body

    if (!Array.isArray(nodes) || !Array.isArray(edges)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    // We use a transaction to clear old nodes/edges and insert new ones
    await prisma.$transaction(async (tx) => {
      // Delete existing edges and nodes
      await tx.aiOrchestrationEdge.deleteMany({
        where: { deviceId: device.id }
      })
      await tx.aiOrchestrationNode.deleteMany({
        where: { deviceId: device.id }
      })

      // Insert new nodes
      // React Flow node format: { id: '1', position: { x, y }, data: { label: '...' }, type: '...' }
      for (const n of nodes) {
        await tx.aiOrchestrationNode.create({
          data: {
            id: n.id, // preserve id to maintain edge references
            deviceId: device.id,
            name: n.data?.label || "Node",
            prompt: n.data?.prompt || "",
            positionX: n.position?.x || 0,
            positionY: n.position?.y || 0,
            isEntryNode: n.type === 'input'
          }
        })
      }

      // Insert new edges
      // React Flow edge format: { id: 'e1-2', source: '1', target: '2', label: '...' }
      for (const e of edges) {
        await tx.aiOrchestrationEdge.create({
          data: {
            id: e.id,
            deviceId: device.id,
            sourceId: e.source,
            targetId: e.target,
            condition: e.label || ""
          }
        })
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to save AI Orchestration:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
