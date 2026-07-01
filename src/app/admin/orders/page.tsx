import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { AdminDashboardClient } from "./AdminDashboardClient"

export default async function AdminDashboardPage() {
  const session = await auth()
  const cookieStore = await cookies()
  const hasAdminCookie = cookieStore.get("weaweb_admin_session")?.value === "true"
  const isSuperAdmin =
    hasAdminCookie ||
    session?.user?.email === "ariefbsusilo@gmail.com" ||
    session?.user?.email === "admin@weaweb.com" ||
    (session?.user as any)?.role === "SUPERADMIN"

  if (!isSuperAdmin) redirect("/admin/login")

  // ── Aggregate Stats ──────────────────────────────────────────
  const [
    totalTenants,
    totalUsers,
    totalDevices,
    connectedDevices,
    totalMessages,
    totalCampaigns,
    totalContacts,
    orders,
    tenants,
  ] = await Promise.all([
    prisma.tenant.count(),
    prisma.user.count(),
    prisma.device.count(),
    prisma.device.count({ where: { status: "connect" } }),
    prisma.message.count(),
    prisma.campaign.count(),
    prisma.contact.count(),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { tenant: { select: { name: true, planName: true } } },
    }),
    prisma.tenant.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        users: { include: { user: { select: { email: true, createdAt: true } } } },
        devices: { select: { id: true, name: true, status: true, phoneNumber: true, provider: true } },
        orders: { orderBy: { createdAt: "desc" }, take: 1 },
        _count: { select: { contacts: true, campaigns: true, messages: true } },
      },
    }),
  ])

  const totalRevenue = orders.filter(o => o.status === "paid").reduce((s, o) => s + o.amount, 0)
  const pendingOrders = orders.filter(o => o.status === "pending").length

  const stats = {
    totalTenants,
    totalUsers,
    totalDevices,
    connectedDevices,
    totalMessages,
    totalCampaigns,
    totalContacts,
    totalRevenue,
    pendingOrders,
  }

  return (
    <AdminDashboardClient
      stats={stats}
      orders={orders}
      tenants={tenants}
    />
  )
}
