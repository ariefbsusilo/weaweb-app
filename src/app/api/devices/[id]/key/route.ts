import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Generate a secure API Key
    const apiKey = "wa_" + crypto.randomBytes(24).toString("hex")

    const updatedDevice = await prisma.device.update({
      where: { id },
      data: { apiKey }
    })

    return NextResponse.json({ success: true, apiKey: updatedDevice.apiKey })
  } catch (error) {
    console.error("Error generating API key:", error)
    return NextResponse.json({ success: false, error: "Failed to generate API Key" }, { status: 500 })
  }
}
