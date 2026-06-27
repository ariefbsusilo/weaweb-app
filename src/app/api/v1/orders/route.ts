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

    if (!planName) {
      return NextResponse.json({ error: "Missing planName" }, { status: 400 });
    }

    const isFree = planName === "Free Trial" || amount === 0;

    // For Free Trial: auto-approve immediately, no proof needed
    if (isFree) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 3); // 3-day trial

      const [order] = await prisma.$transaction([
        prisma.order.create({
          data: {
            tenantId,
            planName: "Free Trial",
            amount: 0,
            proofUrl: null,
            status: "paid",
          },
        }),
        prisma.tenant.update({
          where: { id: tenantId },
          data: {
            planName: "Starter", // Free trial gets Starter-level access
            planExpiresAt: expiresAt,
          },
        }),
      ]);
      return NextResponse.json({ success: true, order, autoApproved: true });
    }

    // Paid plans: require proof
    if (!proofUrl) {
      return NextResponse.json({ error: "Proof of payment required" }, { status: 400 });
    }

    const order = await prisma.order.create({
      data: {
        tenantId,
        planName,
        amount,
        proofUrl,
        status: "pending",
      },
    });

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("Order API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
