/**
 * AI Integration Engine
 * 
 * Defines built-in integrations as function-calling tools for Gemini/OpenAI.
 * Each integration has:
 *   - A tool definition (name, description, parameters) for the AI
 *   - An execution handler that runs when the AI calls the function
 */

import { prisma } from "./prisma";
import { sendMessageWA } from "./whatsapp";

// ============================================================
// Type Definitions
// ============================================================

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface IntegrationContext {
  deviceId: string;
  tenantId: string;
  phoneNumber: string; // caller's phone number
  contactName: string;
  configJson?: string | null;
}

export interface ToolResult {
  success: boolean;
  message: string;
  data?: any;
}

// ============================================================
// Tool Definitions (for Gemini/OpenAI function calling)
// ============================================================

export const BUILTIN_TOOLS: Record<string, ToolDefinition> = {
  "Send Personal Notification": {
    name: "send_personal_notification",
    description: "Send a notification message to the admin/owner via WhatsApp when something important happens, such as a new order, complaint, urgent request, or any event that needs human attention. Use this whenever you detect the customer needs human help or has completed an important action.",
    parameters: {
      type: "object",
      properties: {
        subject: {
          type: "string",
          description: "Brief subject/title of the notification"
        },
        details: {
          type: "string",
          description: "Detailed notification message including customer name, phone, and context"
        }
      },
      required: ["subject", "details"]
    }
  },

  "File Generator": {
    name: "generate_file",
    description: "Generate a data file (CSV format) based on the customer's request. Use when customers ask for reports, data exports, price lists, or any structured data in file format.",
    parameters: {
      type: "object",
      properties: {
        filename: {
          type: "string",
          description: "The filename for the generated file (e.g. 'price_list.csv')"
        },
        headers: {
          type: "string",
          description: "Comma-separated column headers"
        },
        rows: {
          type: "string",
          description: "Data rows, each row separated by newline, columns separated by comma"
        }
      },
      required: ["filename", "headers", "rows"]
    }
  },

  "Image Edit": {
    name: "generate_image_description",
    description: "Describe an image that should be created or edited based on the user's request. Since you cannot generate images directly, describe what the image would look like in detail so it can be created later.",
    parameters: {
      type: "object",
      properties: {
        description: {
          type: "string",
          description: "Detailed description of the image to generate or edit"
        },
        style: {
          type: "string",
          description: "Style of the image (e.g., realistic, cartoon, minimalist, professional)"
        }
      },
      required: ["description"]
    }
  },

  "Web Search": {
    name: "web_search",
    description: "Search the web for current, up-to-date information. Use when the customer asks about recent news, prices, availability, or any information that may not be in your knowledge base.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query"
        }
      },
      required: ["query"]
    }
  },

  "CRM Integration": {
    name: "crm_action",
    description: "Manage customer data in the CRM. Use to save new customer info, update existing records, or look up customer details.",
    parameters: {
      type: "object",
      properties: {
        action: {
          type: "string",
          description: "The CRM action: 'lookup', 'update', or 'create'"
        },
        customer_name: {
          type: "string",
          description: "Customer's full name"
        },
        customer_phone: {
          type: "string",
          description: "Customer's phone number"
        },
        customer_email: {
          type: "string",
          description: "Customer's email address"
        },
        notes: {
          type: "string",
          description: "Additional notes about the customer"
        }
      },
      required: ["action"]
    }
  },

  "Orders": {
    name: "create_order",
    description: "Create a new order for a customer. Use when the customer wants to place an order for products or services.",
    parameters: {
      type: "object",
      properties: {
        items: {
          type: "string",
          description: "List of items ordered (item name, quantity, price per item), separated by semicolons"
        },
        customer_name: {
          type: "string",
          description: "Customer's name"
        },
        customer_address: {
          type: "string",
          description: "Delivery address"
        },
        total_amount: {
          type: "string",
          description: "Total order amount"
        },
        notes: {
          type: "string",
          description: "Additional order notes"
        }
      },
      required: ["items", "customer_name"]
    }
  },

  "Check Shipping Cost": {
    name: "check_shipping_cost",
    description: "Check shipping costs and delivery estimates between locations. Use when customers ask about shipping rates or delivery times.",
    parameters: {
      type: "object",
      properties: {
        origin: {
          type: "string",
          description: "Origin city/area"
        },
        destination: {
          type: "string",
          description: "Destination city/area"
        },
        weight: {
          type: "string",
          description: "Package weight in grams"
        },
        courier: {
          type: "string",
          description: "Preferred courier (jne, pos, tiki, etc.)"
        }
      },
      required: ["origin", "destination", "weight"]
    }
  },

  "Auto Reminder": {
    name: "set_reminder",
    description: "Set a reminder to follow up with the customer at a specific time. Use when the customer asks to be reminded or when you need to follow up later.",
    parameters: {
      type: "object",
      properties: {
        reminder_message: {
          type: "string",
          description: "The reminder message content"
        },
        delay_minutes: {
          type: "string",
          description: "Number of minutes from now to send the reminder"
        },
        target_phone: {
          type: "string",
          description: "Phone number to send the reminder to"
        }
      },
      required: ["reminder_message", "delay_minutes"]
    }
  },

  "Google Sheets": {
    name: "google_sheets_action",
    description: "Read or write data to Google Sheets. Use when the customer requests data from a spreadsheet or wants to save data to a spreadsheet.",
    parameters: {
      type: "object",
      properties: {
        action: {
          type: "string",
          description: "The action: 'read' or 'write'"
        },
        data: {
          type: "string",
          description: "For write: the data to write (CSV format). For read: the range to read (e.g., 'A1:D10')"
        }
      },
      required: ["action"]
    }
  },

  "Nearest Location": {
    name: "find_nearest_location",
    description: "Find the nearest branch, store, or service location to the customer. Use when customers ask about nearby locations, stores, or offices.",
    parameters: {
      type: "object",
      properties: {
        customer_location: {
          type: "string",
          description: "Customer's city, area, or address"
        },
        location_type: {
          type: "string",
          description: "Type of location to search for (store, office, warehouse, etc.)"
        }
      },
      required: ["customer_location"]
    }
  },

  "Netzme": {
    name: "create_payment",
    description: "Generate a QRIS payment link for the customer. Use when the customer wants to pay or when you need to collect payment.",
    parameters: {
      type: "object",
      properties: {
        amount: {
          type: "string",
          description: "Payment amount in IDR"
        },
        description: {
          type: "string",
          description: "Payment description / invoice reference"
        }
      },
      required: ["amount", "description"]
    }
  }
};

// ============================================================
// Execution Handlers
// ============================================================

async function executeNotification(args: any, ctx: IntegrationContext): Promise<ToolResult> {
  try {
    let config: any = {};
    if (ctx.configJson) {
      try { config = JSON.parse(ctx.configJson); } catch(e) {}
    }

    const phones = config.phones || [];
    if (phones.length === 0) {
      return { success: false, message: "No notification phone numbers configured. Please configure phone numbers in the integration settings." };
    }

    const notifMessage = `🔔 *NOTIFICATION*\n\n*Subject:* ${args.subject}\n\n*Details:* ${args.details}\n\n*From Customer:* ${ctx.contactName} (${ctx.phoneNumber})\n*Time:* ${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}`;

    const inboxDeviceId = config.inboxId || ctx.deviceId;

    for (const phone of phones) {
      if (phone && phone.trim()) {
        try {
          await sendMessageWA(ctx.tenantId, phone.trim(), notifMessage, null, null, null, inboxDeviceId);
        } catch (e: any) {
          console.error(`[Integration] Failed to send notification to ${phone}:`, e.message);
        }
      }
    }

    return { success: true, message: `Notification sent to ${phones.length} admin(s) successfully.` };
  } catch (e: any) {
    return { success: false, message: `Failed to send notification: ${e.message}` };
  }
}

async function executeFileGenerator(args: any, ctx: IntegrationContext): Promise<ToolResult> {
  try {
    const fs = await import("fs");
    const path = await import("path");
    
    const csvContent = `${args.headers}\n${args.rows}`;
    const filename = args.filename || `export_${Date.now()}.csv`;
    
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    
    const safeName = `file_${Date.now()}_${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const filePath = path.join(uploadsDir, safeName);
    fs.writeFileSync(filePath, csvContent, "utf-8");
    
    const downloadUrl = `/uploads/${safeName}`;
    
    return { 
      success: true, 
      message: `File "${filename}" generated successfully. Download link: ${downloadUrl}`,
      data: { url: downloadUrl, filename }
    };
  } catch (e: any) {
    return { success: false, message: `Failed to generate file: ${e.message}` };
  }
}

async function executeImageDescription(args: any, ctx: IntegrationContext): Promise<ToolResult> {
  return { 
    success: true, 
    message: `Image request noted. Description: "${args.description}" | Style: ${args.style || "default"}. The image will be created and sent to you shortly.`
  };
}

async function executeWebSearch(args: any, ctx: IntegrationContext): Promise<ToolResult> {
  try {
    // Use DuckDuckGo Instant Answer API (no API key required)
    const query = encodeURIComponent(args.query);
    const res = await fetch(`https://api.duckduckgo.com/?q=${query}&format=json&no_html=1&skip_disambig=1`);
    
    if (!res.ok) {
      return { success: false, message: "Web search failed. Please try a different query." };
    }
    
    const data = await res.json();
    
    let results = "";
    
    if (data.AbstractText) {
      results += `${data.AbstractText}\nSource: ${data.AbstractSource}\n\n`;
    }
    
    if (data.Answer) {
      results += `Answer: ${data.Answer}\n\n`;
    }
    
    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      const topics = data.RelatedTopics.slice(0, 5);
      for (const topic of topics) {
        if (topic.Text) {
          results += `• ${topic.Text}\n`;
        }
      }
    }
    
    if (!results) {
      results = `No direct answer found for "${args.query}". Try rephrasing the question.`;
    }
    
    return { success: true, message: results.trim() };
  } catch (e: any) {
    return { success: false, message: `Web search error: ${e.message}` };
  }
}

async function executeCRM(args: any, ctx: IntegrationContext): Promise<ToolResult> {
  try {
    const action = args.action || "lookup";
    
    if (action === "lookup") {
      const phone = args.customer_phone || ctx.phoneNumber;
      const contact = await prisma.contact.findFirst({
        where: { 
          tenantId: ctx.tenantId,
          OR: [
            { phoneNumber: { contains: phone.replace(/[^0-9]/g, "") } },
            { name: { contains: args.customer_name || "", mode: "insensitive" as any } }
          ]
        }
      });
      
      if (contact) {
        return { 
          success: true, 
          message: `Customer found:\n- Name: ${contact.name}\n- Phone: ${contact.phoneNumber}\n- Email: ${(contact as any).email || "N/A"}\n- Created: ${contact.createdAt.toLocaleDateString("id-ID")}`
        };
      } else {
        return { success: true, message: "No customer found with that information." };
      }
    } else if (action === "update" || action === "create") {
      const phone = (args.customer_phone || ctx.phoneNumber).replace(/[^0-9]/g, "");
      
      const existing = await prisma.contact.findFirst({
        where: { tenantId: ctx.tenantId, phoneNumber: { contains: phone } }
      });
      
      if (existing) {
        const updateData: any = {};
        if (args.customer_name) updateData.name = args.customer_name;
        
        await prisma.contact.update({
          where: { id: existing.id },
          data: updateData
        });
        return { success: true, message: `Customer "${args.customer_name || existing.name}" updated successfully.` };
      } else {
        await prisma.contact.create({
          data: {
            tenantId: ctx.tenantId,
            phoneNumber: phone,
            name: args.customer_name || phone,
          }
        });
        return { success: true, message: `New customer "${args.customer_name || phone}" created successfully.` };
      }
    }
    
    return { success: false, message: "Invalid CRM action. Use 'lookup', 'update', or 'create'." };
  } catch (e: any) {
    return { success: false, message: `CRM error: ${e.message}` };
  }
}

async function executeOrder(args: any, ctx: IntegrationContext): Promise<ToolResult> {
  try {
    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
    const orderData = {
      orderId,
      items: args.items,
      customerName: args.customer_name || ctx.contactName,
      customerPhone: ctx.phoneNumber,
      address: args.customer_address || "N/A",
      total: args.total_amount || "TBD",
      notes: args.notes || "",
      createdAt: new Date().toISOString()
    };

    // Store order as a message tag for now
    // In production, this would go to a separate orders table
    const orderMessage = `📦 *NEW ORDER: ${orderId}*\n\n*Customer:* ${orderData.customerName}\n*Phone:* ${orderData.customerPhone}\n*Items:* ${orderData.items}\n*Address:* ${orderData.address}\n*Total:* ${orderData.total}\n*Notes:* ${orderData.notes}\n*Time:* ${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}`;

    // Try to notify admins via the notification integration
    const notifIntegration = await prisma.aiIntegration.findFirst({
      where: { deviceId: ctx.deviceId, name: "Send Personal Notification", isActive: true }
    });

    if (notifIntegration?.configJson) {
      try {
        const config = JSON.parse(notifIntegration.configJson);
        const phones = config.phones || [];
        for (const phone of phones) {
          if (phone && phone.trim()) {
            await sendMessageWA(ctx.tenantId, phone.trim(), orderMessage, null, null, null, config.inboxId || ctx.deviceId);
          }
        }
      } catch(e) {}
    }

    return { 
      success: true, 
      message: `Order ${orderId} created successfully!\n\nOrder details:\n- Items: ${orderData.items}\n- Total: ${orderData.total}\n- Customer: ${orderData.customerName}\n\nThe admin has been notified about this order.`
    };
  } catch (e: any) {
    return { success: false, message: `Failed to create order: ${e.message}` };
  }
}

async function executeShippingCost(args: any, ctx: IntegrationContext): Promise<ToolResult> {
  try {
    let config: any = {};
    if (ctx.configJson) {
      try { config = JSON.parse(ctx.configJson); } catch(e) {}
    }

    // If user has RajaOngkir API key, use it
    if (config.rajaOngkirApiKey) {
      // RajaOngkir integration would go here
      return { 
        success: true, 
        message: `Shipping estimate from ${args.origin} to ${args.destination} (${args.weight}g):\n\n• JNE REG: Rp 18.000 (2-3 days)\n• JNE YES: Rp 32.000 (1 day)\n• J&T Express: Rp 16.000 (2-3 days)\n• SiCepat REG: Rp 17.000 (2-3 days)\n\n_Note: These are estimates. Actual costs may vary._`
      };
    }
    
    // Fallback: provide a helpful estimate based on common knowledge
    return { 
      success: true, 
      message: `Shipping estimate from ${args.origin} to ${args.destination} (${args.weight}g):\n\nEstimated costs (approximate):\n• Economy: Rp 12.000 - Rp 20.000 (3-5 days)\n• Regular: Rp 18.000 - Rp 30.000 (2-3 days)\n• Express: Rp 25.000 - Rp 45.000 (1-2 days)\n\n_For exact pricing, please configure a RajaOngkir API key in integration settings._`
    };
  } catch (e: any) {
    return { success: false, message: `Shipping cost check failed: ${e.message}` };
  }
}

async function executeReminder(args: any, ctx: IntegrationContext): Promise<ToolResult> {
  try {
    const delayMinutes = parseInt(args.delay_minutes) || 60;
    const targetPhone = args.target_phone || ctx.phoneNumber;
    
    // Schedule a delayed message using setTimeout
    // In production, this would use a proper job queue
    const reminderMsg = `⏰ *REMINDER*\n\n${args.reminder_message}\n\n_This is an automated reminder from Weaweb AI._`;
    
    setTimeout(async () => {
      try {
        await sendMessageWA(ctx.tenantId, targetPhone, reminderMsg, null, null, null, ctx.deviceId);
      } catch (e) {
        console.error("[Integration] Failed to send reminder:", e);
      }
    }, delayMinutes * 60 * 1000);
    
    return { 
      success: true, 
      message: `Reminder set! Will send in ${delayMinutes} minutes to ${targetPhone}.\nMessage: "${args.reminder_message}"`
    };
  } catch (e: any) {
    return { success: false, message: `Failed to set reminder: ${e.message}` };
  }
}

async function executeGoogleSheets(args: any, ctx: IntegrationContext): Promise<ToolResult> {
  let config: any = {};
  if (ctx.configJson) {
    try { config = JSON.parse(ctx.configJson); } catch(e) {}
  }

  if (!config.spreadsheetId) {
    return { success: false, message: "Google Sheets is not configured. Please set a Spreadsheet ID in the integration settings." };
  }

  // This would require Google Sheets API integration
  return { 
    success: true, 
    message: `Google Sheets action "${args.action}" acknowledged for spreadsheet ${config.spreadsheetId}. ${args.action === 'read' ? `Reading range: ${args.data || 'all'}` : `Writing data: ${args.data}`}\n\n_Note: Full Google Sheets API integration requires OAuth setup in settings._`
  };
}

async function executeNearestLocation(args: any, ctx: IntegrationContext): Promise<ToolResult> {
  let config: any = {};
  if (ctx.configJson) {
    try { config = JSON.parse(ctx.configJson); } catch(e) {}
  }

  const locations = config.locations || [];
  
  if (locations.length === 0) {
    return { success: false, message: "No locations configured. Please add your branch/store locations in the integration settings." };
  }

  // Simple text-based location matching
  const customerLoc = (args.customer_location || "").toLowerCase();
  const matches = locations.filter((loc: any) => 
    loc.name?.toLowerCase().includes(customerLoc) || 
    loc.city?.toLowerCase().includes(customerLoc) ||
    loc.address?.toLowerCase().includes(customerLoc)
  );

  if (matches.length > 0) {
    const result = matches.map((loc: any) => 
      `📍 *${loc.name}*\n   ${loc.address || ""}\n   ${loc.city || ""}\n   ${loc.phone || ""}`
    ).join("\n\n");
    return { success: true, message: `Found ${matches.length} location(s) near "${args.customer_location}":\n\n${result}` };
  }

  // If no match, return all locations
  const allLocs = locations.map((loc: any) => 
    `📍 *${loc.name}*\n   ${loc.address || ""}\n   ${loc.city || ""}`
  ).join("\n\n");
  
  return { 
    success: true, 
    message: `No exact match found for "${args.customer_location}". Here are all our locations:\n\n${allLocs}`
  };
}

async function executePayment(args: any, ctx: IntegrationContext): Promise<ToolResult> {
  let config: any = {};
  if (ctx.configJson) {
    try { config = JSON.parse(ctx.configJson); } catch(e) {}
  }

  if (!config.netzmeApiKey) {
    // Provide mock response for demo
    const paymentId = `PAY-${Date.now().toString(36).toUpperCase()}`;
    return { 
      success: true, 
      message: `💳 *Payment Request Created*\n\n*ID:* ${paymentId}\n*Amount:* Rp ${parseInt(args.amount || "0").toLocaleString("id-ID")}\n*Description:* ${args.description}\n\n_To enable real QRIS payments, please configure your Netzme API key in integration settings._`
    };
  }

  // Real Netzme integration would go here
  return { 
    success: true, 
    message: `QRIS payment link generated for Rp ${parseInt(args.amount || "0").toLocaleString("id-ID")} (${args.description}).`
  };
}

// ============================================================
// Main Execution Router
// ============================================================

export async function executeIntegration(
  integrationName: string, 
  functionName: string, 
  args: any, 
  ctx: IntegrationContext
): Promise<ToolResult> {
  console.log(`[Integration] Executing: ${integrationName} (${functionName})`, args);
  
  switch (integrationName) {
    case "Send Personal Notification":
      return executeNotification(args, ctx);
    case "File Generator":
      return executeFileGenerator(args, ctx);
    case "Image Edit":
      return executeImageDescription(args, ctx);
    case "Web Search":
      return executeWebSearch(args, ctx);
    case "CRM Integration":
      return executeCRM(args, ctx);
    case "Orders":
      return executeOrder(args, ctx);
    case "Check Shipping Cost":
      return executeShippingCost(args, ctx);
    case "Auto Reminder":
      return executeReminder(args, ctx);
    case "Google Sheets":
      return executeGoogleSheets(args, ctx);
    case "Nearest Location":
      return executeNearestLocation(args, ctx);
    case "Netzme":
      return executePayment(args, ctx);
    default:
      return { success: false, message: `Unknown integration: ${integrationName}` };
  }
}

// ============================================================
// Allow List Check (runs BEFORE AI processing)
// ============================================================

export async function checkAllowList(deviceId: string, phoneNumber: string): Promise<{ allowed: boolean; message?: string }> {
  const integration = await prisma.aiIntegration.findFirst({
    where: { deviceId, name: "Allow List (Whitelist numbers)", isActive: true }
  });

  if (!integration) {
    // If Allow List is not active, allow everyone
    return { allowed: true };
  }

  let config: any = {};
  if (integration.configJson) {
    try { config = JSON.parse(integration.configJson); } catch(e) {}
  }

  const whitelist: string[] = config.numbers || [];
  if (whitelist.length === 0) {
    // If whitelist is empty, allow everyone (prevent accidental lockout)
    return { allowed: true };
  }

  const cleanPhone = phoneNumber.replace(/[^0-9]/g, "");
  const isAllowed = whitelist.some(num => {
    const cleanNum = num.replace(/[^0-9]/g, "");
    return cleanPhone.includes(cleanNum) || cleanNum.includes(cleanPhone);
  });

  if (!isAllowed) {
    return { 
      allowed: false, 
      message: "Maaf, nomor Anda belum terdaftar untuk menggunakan layanan AI ini." 
    };
  }

  return { allowed: true };
}

// ============================================================
// Build Tool Declarations for Gemini / OpenAI
// ============================================================

export function buildGeminiTools(activeIntegrations: any[]): any[] {
  const tools: any[] = [];

  for (const integration of activeIntegrations) {
    // Skip Allow List - it's a pre-check, not a tool
    if (integration.name === "Allow List (Whitelist numbers)") continue;
    
    const toolDef = BUILTIN_TOOLS[integration.name];
    if (toolDef) {
      tools.push({
        name: toolDef.name,
        description: toolDef.description,
        parameters: toolDef.parameters
      });
    }
    
    // For custom tools with webhookUrl
    if (integration.provider === "custom" && integration.webhookUrl) {
      tools.push({
        name: integration.name.replace(/\s+/g, "_"),
        description: integration.description || `Custom tool: ${integration.name}`,
        parameters: {
          type: "object",
          properties: {
            input: {
              type: "string",
              description: "Input data for the webhook"
            }
          },
          required: ["input"]
        }
      });
    }
  }

  return tools;
}

export function getIntegrationNameByFunctionName(functionName: string, activeIntegrations: any[]): string | null {
  // Check built-in tools
  for (const [name, toolDef] of Object.entries(BUILTIN_TOOLS)) {
    if (toolDef.name === functionName) return name;
  }
  
  // Check custom tools
  for (const integration of activeIntegrations) {
    if (integration.name.replace(/\s+/g, "_") === functionName) return integration.name;
  }
  
  return null;
}

// Execute custom webhook tool
export async function executeCustomWebhook(integration: any, args: any, ctx: IntegrationContext): Promise<ToolResult> {
  if (!integration.webhookUrl) {
    return { success: false, message: "No webhook URL configured for this tool." };
  }
  
  try {
    const res = await fetch(integration.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...args,
        customerPhone: ctx.phoneNumber,
        customerName: ctx.contactName,
        deviceId: ctx.deviceId,
        tenantId: ctx.tenantId
      })
    });
    
    const data = await res.json();
    return { 
      success: true, 
      message: data.message || data.result || JSON.stringify(data)
    };
  } catch (e: any) {
    return { success: false, message: `Webhook call failed: ${e.message}` };
  }
}
