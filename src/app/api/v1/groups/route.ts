import { NextResponse } from "next/server";
import { authenticateApiKey } from "@/lib/api-auth";

export async function GET(req: Request) {
  try {
    const apiKey = await authenticateApiKey(req);
    if (!apiKey) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const res = await fetch(`http://127.0.0.1:4010/groups/${apiKey.tenantId}`);
    const data = await res.json();
    
    if (!res.ok) throw new Error(data.error);

    return NextResponse.json({ 
      success: true, 
      groups: data.data 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
