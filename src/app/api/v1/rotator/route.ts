import { NextResponse } from "next/server";
import { authenticateApiKey } from "@/lib/api-auth";

export async function GET(req: Request) {
  try {
    const apiKey = await authenticateApiKey(req);
    if (!apiKey) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Since this SaaS currently only supports 1 device per tenant, we return the active tenant ID as the only "rotator"
    return NextResponse.json({ 
      success: true, 
      data: [
        {
          id: apiKey.tenantId,
          name: apiKey.tenant.name,
          status: apiKey.tenant.whatsappStatus
        }
      ]
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
