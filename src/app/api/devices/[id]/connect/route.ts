import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const tenantId = (session as any).tenantId;
    const { id: deviceId } = await params;

    const device = await prisma.device.findUnique({ where: { id: deviceId, tenantId } });
    if (!device) return NextResponse.json({ error: "Device not found" }, { status: 404 });

    await prisma.device.update({
      where: { id: device.id },
      data: { status: "connecting" }
    });

    // Call worker to start session
    try {
      const res = await fetch("http://127.0.0.1:4010/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId: device.id, tenantId, action: "start" }),
      });
      if (!res.ok) {
        console.error("[NextJS] Worker returned", res.status, await res.text());
        throw new Error("Worker returned " + res.status);
      }
    } catch (e) {
      console.error("[NextJS] Failed to call worker action", e);
      return NextResponse.json({ success: false, error: "Worker is currently starting up, please try again in a few seconds." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Connection process started" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
