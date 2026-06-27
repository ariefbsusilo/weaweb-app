import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import midtransClient from "midtrans-client";

// Initialize Snap API client
let snap: any;
if (process.env.MIDTRANS_SERVER_KEY) {
  snap = new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
  });
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || !(session as any).tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = (session as any).tenantId;
    const { planName, amount } = await req.json();

    if (!planName || !amount) {
      return NextResponse.json({ error: "Missing planName or amount" }, { status: 400 });
    }

    // For Free Trial: auto-approve immediately
    const isFree = planName === "Free Trial" || amount === 0;
    if (isFree) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 3);

      const [order] = await prisma.$transaction([
        prisma.order.create({
          data: {
            tenantId,
            planName: "Free Trial",
            amount: 0,
            status: "paid",
          },
        }),
        prisma.tenant.update({
          where: { id: tenantId },
          data: {
            planName: "Starter",
            planExpiresAt: expiresAt,
          },
        }),
      ]);
      return NextResponse.json({ success: true, order, autoApproved: true });
    }

    // If Midtrans is not configured, fallback or throw error
    if (!snap) {
      return NextResponse.json({ error: "Midtrans is not configured on this server." }, { status: 500 });
    }

    // Generate a unique order ID
    const orderId = `ORDER-${tenantId}-${Date.now()}`;

    // First, save the order to DB as pending
    const newOrder = await prisma.order.create({
      data: {
        tenantId,
        planName,
        amount,
        status: "pending",
        transactionId: orderId, // We use our generated ID as the Midtrans transaction ID
      },
    });

    // Create Snap transaction
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      customer_details: {
        first_name: session.user.name || "Customer",
        email: session.user.email || "",
      },
      item_details: [
        {
          id: planName.replace(/\s+/g, '-').toLowerCase(),
          price: amount,
          quantity: 1,
          name: `Whatzapp ${planName} Plan`,
        }
      ]
    };

    const transaction = await snap.createTransaction(parameter);
    const snapToken = transaction.token;

    // Update the order with the snapToken
    await prisma.order.update({
      where: { id: newOrder.id },
      data: { snapToken },
    });

    return NextResponse.json({ success: true, token: snapToken, order: newOrder });
  } catch (error: any) {
    console.error("Payment API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
