import { NextResponse } from "next/server";
import { authenticateApiKey } from "@/lib/api-auth";

export async function GET(req: Request) {
  try {
    const apiKey = await authenticateApiKey(req);
    if (!apiKey) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const res = await fetch(`http://127.0.0.1:4000/qr/${apiKey.tenantId}`);
    const data = await res.json();
    
    return NextResponse.json({ success: true, qr: data.qr });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
