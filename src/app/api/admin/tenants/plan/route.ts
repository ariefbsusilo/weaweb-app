import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const cookieStore = await cookies();
    const hasAdminCookie = cookieStore.get("weaweb_admin_session")?.value === "true";
    const isSuperAdmin = hasAdminCookie || session?.user?.email === "ariefbsusilo@gmail.com" || session?.user?.email === "admin@weaweb.com" || (session?.user as any)?.role === "SUPERADMIN";

    if (!isSuperAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tenantId, planName, planExpiresAt } = await req.json();

    if (!tenantId || !planName) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        planName,
        planExpiresAt: planExpiresAt ? new Date(planExpiresAt) : null,
      },
    });

    return NextResponse.json({ success: true, tenant: updatedTenant });
  } catch (error: any) {
    console.error("Admin Tenant Plan API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
