import { NextResponse } from "next/server";
import { authenticateApiKey } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const apiKey = await authenticateApiKey(req);
    if (!apiKey) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const messageId = searchParams.get("id");

    if (!messageId) return NextResponse.json({ error: "Missing message 'id' parameter" }, { status: 400 });

    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!message || message.tenantId !== apiKey.tenantId) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      status: message.status,
      whatsappId: message.whatsappId
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
