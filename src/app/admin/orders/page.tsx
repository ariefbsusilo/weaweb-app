import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AdminOrdersClient } from "./AdminOrdersClient"
import { ShieldCheck } from "lucide-react"

export default async function AdminOrdersPage() {
  const session = await auth()
  
  // Hardcoded super admin check or use role
  const isSuperAdmin = session?.user?.email === "ariefbsusilo@gmail.com" || session?.user?.email === "admin@weaweb.com" || (session?.user as any)?.role === "SUPERADMIN"
  
  if (!session?.user || !isSuperAdmin) {
    redirect("/dashboard")
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      tenant: {
        select: { name: true, planName: true }
      }
    }
  })

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Super Admin</h1>
            <p className="text-muted-foreground">Order & Payment Verification</p>
          </div>
        </div>

        <AdminOrdersClient initialOrders={orders} />
      </div>
    </div>
  )
}
