import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const tenantId = (session as any)?.tenantId;

    if (!tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find a connected device for this tenant
    const device = await prisma.device.findFirst({
      where: { tenantId, status: "connect" }
    });

    if (!device) {
      return NextResponse.json({ error: "No connected WhatsApp device found. Please connect your device first." }, { status: 404 });
    }

    // Fetch groups from worker
    const workerRes = await fetch(`http://127.0.0.1:4000/groups/${device.id}`);
    const data = await workerRes.json();

    if (!workerRes.ok) {
      return NextResponse.json({ error: data.error || "Failed to fetch groups from worker" }, { status: workerRes.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[WA Groups API Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
