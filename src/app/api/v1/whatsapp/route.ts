import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const tenantId = (session as any).tenantId;
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    
    let qr = null;
    if (tenant?.whatsappStatus === "connecting") {
      try {
        const res = await fetch(`http://127.0.0.1:4010/qr/${tenantId}`);
        if (res.ok) {
          const data = await res.json();
          qr = data.qr;
        }
      } catch (e) {
        console.error("Failed to fetch QR from Worker:", e);
      }
    }

    return NextResponse.json({ 
      status: tenant?.whatsappStatus || "unconnected",
      qr
    });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const tenantId = (session as any).tenantId;
    const { action } = await req.json();

    if (action === "connect") {
      await prisma.tenant.update({
        where: { id: tenantId },
        data: { whatsappStatus: "connecting" }
      });
      
      // Tell worker to start session
      try {
        await fetch("http://127.0.0.1:4010/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tenantId, action: "start" })
        });
      } catch (e) {
         console.error("Failed to signal worker", e);
      }
    } else if (action === "logout") {
      try {
        await fetch("http://127.0.0.1:4010/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tenantId, action: "logout" })
        });
      } catch (e) {
         console.error("Failed to signal worker", e);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
