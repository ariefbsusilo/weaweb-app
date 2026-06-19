import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { GoogleGenerativeAI } from "@google/generative-ai"
import OpenAI from "openai"
import { buildGeminiTools, getIntegrationNameByFunctionName, executeIntegration, executeCustomWebhook, IntegrationContext } from "@/lib/integrations"

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

    // Get active integrations and build tools
    const activeIntegrations = await prisma.aiIntegration.findMany({
      where: { deviceId: device.id, isActive: true }
    });
    const toolDeclarations = buildGeminiTools(activeIntegrations);

    const integrationCtx: IntegrationContext = {
      deviceId: device.id,
      tenantId: device.tenantId,
      phoneNumber: "sandbox-test",
      contactName: "Sandbox User",
      configJson: null
    };

    let responseText = "";

    if (aiConfig.provider === "openai") {
      const openai = new OpenAI({ apiKey: aiConfig.apiKey });
      
      const formattedHistory = (history || []).map((msg: any) => ({
        role: msg.role === "model" ? "assistant" as const : "user" as const,
        content: msg.text
      }));

      const requestParams: any = {
        model: "gpt-4o-mini",
        messages: [
          { role: "system" as const, content: systemPrompt },
          ...formattedHistory,
          { role: "user" as const, content: message }
        ]
      };

      if (toolDeclarations.length > 0) {
        requestParams.tools = toolDeclarations.map(t => ({
          type: "function" as const,
          function: {
            name: t.name,
            description: t.description,
            parameters: t.parameters
          }
        }));
      }

      const completion = await openai.chat.completions.create(requestParams);
      const choice = completion.choices[0];

      if (choice?.message?.tool_calls && choice.message.tool_calls.length > 0) {
        const toolCall = choice.message.tool_calls[0];
        const fc = toolCall.function;
        let fcArgs: any = {};
        try { fcArgs = JSON.parse(fc.arguments); } catch(e) {}

        const integrationName = getIntegrationNameByFunctionName(fc.name, activeIntegrations);
        
        if (integrationName) {
          const intRecord = activeIntegrations.find(i => i.name === integrationName);
          integrationCtx.configJson = intRecord?.configJson || null;
          
          let toolResult;
          if (intRecord?.provider === "custom" && intRecord?.webhookUrl) {
            toolResult = await executeCustomWebhook(intRecord, fcArgs, integrationCtx);
          } else {
            toolResult = await executeIntegration(integrationName, fc.name, fcArgs, integrationCtx);
          }

          // Follow up with OpenAI
          const followUp = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              ...formattedHistory,
              { role: "user", content: message },
              choice.message as any,
              { role: "tool", tool_call_id: toolCall.id, content: toolResult.message }
            ]
          });
          responseText = followUp.choices[0]?.message?.content || toolResult.message;
        }
      } else {
        responseText = choice?.message?.content || "";
      }

    } else {
      // Default to Gemini
      const genAI = new GoogleGenerativeAI(aiConfig.apiKey);
      
      const modelConfig: any = { 
        model: "gemini-2.0-flash",
        systemInstruction: systemPrompt
      };

      if (toolDeclarations.length > 0) {
        modelConfig.tools = [{
          functionDeclarations: toolDeclarations
        }];
      }

      const model = genAI.getGenerativeModel(modelConfig);

      const formattedHistory = (history || []).map((msg: any) => ({
        role: msg.role === "assistant" ? "model" as const : "user" as const,
        parts: [{ text: msg.text }]
      }));

      const chat = model.startChat({
        history: formattedHistory,
      });

      const result = await chat.sendMessage(message);
      const response = result.response;
      
      // Check for function calls
      const functionCalls = response.functionCalls();
      
      if (functionCalls && functionCalls.length > 0) {
        const fc = functionCalls[0];
        console.log(`[Sandbox] AI called function: ${fc.name}`, fc.args);
        
        const integrationName = getIntegrationNameByFunctionName(fc.name, activeIntegrations);
        
        if (integrationName) {
          const intRecord = activeIntegrations.find(i => i.name === integrationName);
          integrationCtx.configJson = intRecord?.configJson || null;
          
          let toolResult;
          if (intRecord?.provider === "custom" && intRecord?.webhookUrl) {
            toolResult = await executeCustomWebhook(intRecord, fc.args, integrationCtx);
          } else {
            toolResult = await executeIntegration(integrationName, fc.name, fc.args as any, integrationCtx);
          }
          
          // Send function response back to the chat
          const followUp = await chat.sendMessage([{
            functionResponse: {
              name: fc.name,
              response: { result: toolResult.message }
            }
          }]);
          
          responseText = followUp.response.text();
        }
      } else {
        responseText = response.text();
      }
    }

    return NextResponse.json({ reply: responseText })
  } catch (error: any) {
    console.error("Failed to call AI API:", error)
    return NextResponse.json({ 
      error: error?.message || "Internal Server Error" 
    }, { status: 500 })
  }
}
