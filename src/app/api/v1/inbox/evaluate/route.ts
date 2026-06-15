import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const tenantId = (session as any)?.tenantId;
    if (!tenantId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { contactId, messageId, deviceId } = body;

    if (!contactId || !messageId || !deviceId) {
      return NextResponse.json({ success: false, error: "Missing contactId, messageId or deviceId" }, { status: 400 });
    }

    // Verify tenant owns the contact and device
    const contact = await prisma.contact.findFirst({
      where: { id: contactId, tenantId },
      include: { messages: { orderBy: { createdAt: 'asc' } } }
    });
    if (!contact) return NextResponse.json({ success: false, error: "Contact not found" }, { status: 404 });

    const device = await prisma.device.findFirst({
      where: { id: deviceId, tenantId },
      include: { aiConfig: true }
    });
    if (!device) return NextResponse.json({ success: false, error: "Device not found" }, { status: 404 });

    const aiConfig = device.aiConfig;
    if (!aiConfig || !aiConfig.isActive) {
      return NextResponse.json({ success: false, error: "AI is not enabled for this device" }, { status: 400 });
    }
    if (!aiConfig.apiKey) {
      return NextResponse.json({ success: false, error: "AI API Key is missing for this device" }, { status: 400 });
    }

    // Find the target message index
    const targetMsgIndex = contact.messages.findIndex(m => m.id === messageId);
    if (targetMsgIndex === -1) {
      return NextResponse.json({ success: false, error: "Message not found in contact history" }, { status: 404 });
    }

    // Prepare chat history (up to the target message, max 10 context messages)
    const contextMessages = contact.messages.slice(Math.max(0, targetMsgIndex - 10), targetMsgIndex + 1);
    
    const historyText = contextMessages.map(m => 
      `${m.id === messageId ? '>> [TARGET MESSAGE TO EVALUATE] ' : ''}${m.direction === 'inbound' ? 'Customer' : 'Bot/Agent'}: ${m.content}`
    ).join('\n');

    if (!historyText) {
      return NextResponse.json({ success: false, error: "No messages to evaluate" }, { status: 400 });
    }

    const evaluationPrompt = `
You are an AI Quality Assurance Evaluator for a WhatsApp Customer Service chatbot.
Please evaluate the specific [TARGET MESSAGE TO EVALUATE] sent by the Bot/Agent, based on the context of the conversation.
Provide a score from 1 to 10 on how well the Bot/Agent handled the interaction in that specific message.
Also provide a brief 1-2 sentence feedback.

Format your response exactly as JSON:
{
  "score": <number 1-10>,
  "feedback": "<short text feedback>"
}

Conversation Context:
${historyText}
`;

    let score = 0;
    let feedback = "";

    try {
      if (aiConfig.provider === 'gemini') {
        const genAI = new GoogleGenerativeAI(aiConfig.apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(evaluationPrompt);
        const responseText = result.response.text();
        // Parse JSON from text
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          score = parsed.score || 5;
          feedback = parsed.feedback || "Evaluation completed.";
        } else {
          score = 5;
          feedback = "Failed to parse AI evaluation format. Raw: " + responseText.substring(0, 50);
        }
      } else if (aiConfig.provider === 'openai') {
        const openai = new OpenAI({ apiKey: aiConfig.apiKey });
        const completion = await openai.chat.completions.create({
          messages: [{ role: "user", content: evaluationPrompt }],
          model: "gpt-4o-mini",
          response_format: { type: "json_object" }
        });
        const responseText = completion.choices[0].message.content || "{}";
        const parsed = JSON.parse(responseText);
        score = parsed.score || 5;
        feedback = parsed.feedback || "Evaluation completed.";
      }
    } catch (aiError: any) {
      console.error("AI Evaluation error:", aiError);
      return NextResponse.json({ success: false, error: "AI provider failed to evaluate: " + aiError.message }, { status: 500 });
    }

    // Save to DB
    const log = await prisma.aiEvaluationLog.create({
      data: {
        deviceId,
        contactId,
        score,
        feedback,
        logData: JSON.stringify(contextMessages.map(m => ({ dir: m.direction, msg: m.content, isTarget: m.id === messageId })))
      }
    });

    return NextResponse.json({ success: true, data: log });
  } catch (error: any) {
    console.error("Evaluation endpoint error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
