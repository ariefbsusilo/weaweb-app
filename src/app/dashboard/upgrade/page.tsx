import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { UpgradeForm } from "./UpgradeForm"
import { CreditCard, CheckCircle2 } from "lucide-react"

export default async function UpgradePage({ searchParams }: { searchParams: { plan?: string } }) {
  const session = await auth()
  if (!session?.user || !(session as any).tenantId) redirect("/login")

  const tenantId = (session as any).tenantId
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { orders: { orderBy: { createdAt: "desc" }, take: 1 } }
  })

  if (!tenant) redirect("/login")

  const latestOrder = tenant.orders[0]
  const isPending = latestOrder?.status === "pending"

  let planName = searchParams.plan || "AI Automation"
  let amount = 999000
  let description = "Unlock unlimited AI messages, multiple devices, and priority support."

  if (planName === "Starter") {
    amount = 299000
    description = "For small businesses. Get 1 WhatsApp device and unlimited broadcasts."
  } else if (planName === "Business") {
    amount = 499000
    description = "Scale your marketing with 3 WhatsApp devices and advanced auto-responder."
  } else {
    planName = "AI Automation"
    amount = 999000
    description = "Full autopilot with AI. 5 WhatsApp Devices, ChatGPT & Gemini, PDF Knowledge Base."
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-card border border-border p-8 rounded-xl shadow-sm text-center">
        <h1 className="text-3xl font-extrabold mb-2">Upgrade to {planName}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      {isPending ? (
        <div className="bg-amber-500/10 border border-amber-500/20 p-8 rounded-xl text-center space-y-4">
          <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-amber-600">Verification in Progress</h2>
          <p className="text-amber-600/80">We have received your payment proof for <strong>Rp {latestOrder.amount.toLocaleString("id-ID")}</strong>.</p>
          <p className="text-amber-600/80">Our team is reviewing your transaction. Your plan will be activated shortly.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-primary/10 border border-primary/20 p-6 rounded-xl space-y-4">
              <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Instructions
              </h3>
              <div className="space-y-2 text-sm">
                <p>Transfer exactly <strong>Rp {amount.toLocaleString("id-ID")}</strong> to:</p>
                <div className="bg-background p-4 rounded border border-border font-mono text-lg font-bold">
                  BCA - 1234567890<br/>
                  A/N PT Weaweb
                </div>
                <p className="text-muted-foreground pt-2">After transferring, please upload a screenshot of your payment receipt.</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-bold mb-4">Upload Payment Proof</h3>
            <UpgradeForm planName={planName} amount={amount} />
          </div>
        </div>
      )}
    </div>
  )
}
