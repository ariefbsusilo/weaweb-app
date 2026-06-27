import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { WaitingClient } from "./WaitingClient"

export default async function WaitingPage() {
  const session = await auth()
  if (!session?.user || !(session as any).tenantId) redirect("/login")

  const tenantId = (session as any).tenantId
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { orders: { orderBy: { createdAt: "desc" }, take: 1 } }
  })

  if (!tenant) redirect("/login")

  const latestOrder = tenant.orders[0]
  const isPaid = ["Starter", "Business", "AI Automation", "Enterprise"].includes(tenant.planName)

  // Already paid → go to dashboard
  if (isPaid) redirect("/dashboard")

  // No order → go to onboarding
  if (!latestOrder) redirect("/onboarding")

  // Rejected → back to onboarding  
  if (latestOrder.status === "rejected") redirect("/onboarding?retry=1")

  return (
    <WaitingClient
      planName={latestOrder.planName}
      amount={latestOrder.amount}
      submittedAt={latestOrder.createdAt.toISOString()}
    />
  )
}
