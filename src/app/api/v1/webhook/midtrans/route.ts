import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Verify signature
    const signatureKey = crypto
      .createHash("sha512")
      .update(
        `${body.order_id}${body.status_code}${body.gross_amount}${process.env.MIDTRANS_SERVER_KEY}`
      )
      .digest("hex");

    if (signatureKey !== body.signature_key) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    const { order_id, transaction_status, payment_type } = body;

    // Find the order
    const order = await prisma.order.findUnique({
      where: { transactionId: order_id },
      include: { tenant: true }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Midtrans transaction status handling
    let newStatus = order.status;
    let newPlanName = order.tenant.planName;
    let newExpiresAt = order.tenant.planExpiresAt;

    if (transaction_status === "capture" || transaction_status === "settlement") {
      newStatus = "paid";
      newPlanName = order.planName; // Upgrade to the purchased plan
      
      // Add 30 days to the expiration date
      if (newExpiresAt) {
        newExpiresAt.setDate(newExpiresAt.getDate() + 30);
      } else {
        newExpiresAt = new Date();
        newExpiresAt.setDate(newExpiresAt.getDate() + 30);
      }
    } else if (transaction_status === "deny" || transaction_status === "cancel" || transaction_status === "expire") {
      newStatus = "rejected";
    }

    // Update order
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: newStatus,
        paymentType: payment_type,
      },
    });

    // Update tenant plan if paid
    if (newStatus === "paid") {
      await prisma.tenant.update({
        where: { id: order.tenantId },
        data: {
          planName: newPlanName,
          planExpiresAt: newExpiresAt,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Midtrans Webhook Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
