import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const isSuperAdmin = session?.user?.email === "ariefbsusilo@gmail.com" || session?.user?.email === "admin@weaweb.com" || (session?.user as any)?.role === "SUPERADMIN";

    if (!session?.user || !isSuperAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, action } = await req.json();

    if (!orderId || !action) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const newStatus = action === "approve" ? "paid" : "rejected";

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus }
    });

    if (action === "approve") {
      // Grant the subscription to the tenant
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days subscription

      await prisma.tenant.update({
        where: { id: order.tenantId },
        data: {
          planName: order.planName,
          planExpiresAt: expiresAt
        }
      });
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error("Admin Order API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
