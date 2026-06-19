import { NextResponse } from "next/server";
import { authenticateApiKey } from "@/lib/api-auth";

export async function POST(req: Request) {
  try {
    const apiKey = await authenticateApiKey(req);
    if (!apiKey) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { target } = body;
    if (!target) return NextResponse.json({ error: "Missing 'target'" }, { status: 400 });

    const res = await fetch(`${process.env.WORKER_URL || "http://127.0.0.1:4010"}/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId: apiKey.tenantId, phoneNumber: target })
    });
    const data = await res.json();
    
    if (!res.ok) throw new Error(data.error);

    return NextResponse.json({ 
      success: true, 
      registered: data.data?.exists || false,
      jid: data.data?.jid 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
