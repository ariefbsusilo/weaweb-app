import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { GoogleGenerativeAI } from "@google/generative-ai"

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
    const { message, history } = body

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Get AI Config
    const aiConfig = await prisma.aiConfig.findFirst({
      where: { deviceId: device.id }
    })

    if (!aiConfig?.apiKey) {
      return NextResponse.json({ 
        error: "No API Key found. Please add your Gemini API Key in the General tab." 
      }, { status: 400 })
    }

    // Get Knowledge Sources
    const knowledgeSources = await prisma.aiKnowledgeSource.findMany({
      where: { deviceId: device.id }
    })

    let knowledgeContext = "";
    if (knowledgeSources.length > 0) {
      knowledgeContext = "\n\n=== RELEVANT CONTEXT (KNOWLEDGE BASE) ===\n";
      knowledgeContext += "You must use the following context to answer questions if relevant:\n";
      knowledgeSources.forEach(source => {
        knowledgeContext += `\n[Source: ${source.title}]\n${source.content}\n`;
      });
      knowledgeContext += "\n=========================================\n";
    }

    const systemPrompt = (aiConfig.prompt || "You are a helpful WhatsApp assistant.") + knowledgeContext;

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(aiConfig.apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt
    });

    // Start Chat with history
    // Convert our history format to Gemini's format
    const formattedHistory = (history || []).map((msg: any) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.text }]
    }));

    const chat = model.startChat({
      history: formattedHistory,
    });

    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    return NextResponse.json({ reply: responseText })
  } catch (error: any) {
    console.error("Failed to call Gemini API:", error)
    return NextResponse.json({ 
      error: error?.message || "Internal Server Error" 
    }, { status: 500 })
  }
}
