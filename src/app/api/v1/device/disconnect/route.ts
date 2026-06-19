import { NextResponse } from "next/server";
import { authenticateApiKey } from "@/lib/api-auth";

export async function POST(req: Request) {
  try {
    const apiKey = await authenticateApiKey(req);
    if (!apiKey) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const res = await fetch(`${process.env.WORKER_URL || "http://127.0.0.1:4010"}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId: apiKey.tenantId, action: "logout" })
    });
    const data = await res.json();
    
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
