import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || !(session as any).tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = (session as any).tenantId;
    const body = await req.json();
    const { planName, amount, proofUrl } = body;

    if (!planName || !amount || !proofUrl) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const order = await prisma.order.create({
      data: {
        tenantId,
        planName,
        amount,
        proofUrl,
        status: "pending"
      }
    });

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("Order API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
