"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, X, Eye, Loader2 } from "lucide-react"

export function AdminOrdersClient({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const handleAction = async (orderId: string, action: "approve" | "reject") => {
    setLoadingId(orderId)
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action })
      })
      if (res.ok) {
        const updated = await res.json()
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: updated.order.status } : o))
      } else {
        alert("Action failed")
      }
    } catch (err) {
      console.error(err)
      alert("Error processing order")
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <>
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary text-secondary-foreground">
              <tr>
                <th className="px-6 py-4 font-bold">Date</th>
                <th className="px-6 py-4 font-bold">Workspace</th>
                <th className="px-6 py-4 font-bold">Plan</th>
                <th className="px-6 py-4 font-bold">Amount</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Proof</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                  <td className="px-6 py-4 font-medium">{order.tenant.name}</td>
                  <td className="px-6 py-4">{order.planName}</td>
                  <td className="px-6 py-4 font-mono">Rp {order.amount.toLocaleString("id-ID")}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.status === "pending" ? "bg-amber-500/10 text-amber-500" :
                      order.status === "paid" ? "bg-emerald-500/10 text-emerald-500" :
                      "bg-destructive/10 text-destructive"
                    }`}>
                      {order.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {order.proofUrl ? (
                      <button 
                        onClick={() => setPreviewImage(order.proofUrl)}
                        className="text-primary hover:text-primary/80 flex items-center gap-1 text-xs font-bold"
                      >
                        <Eye className="w-4 h-4" /> View
                      </button>
                    ) : "-"}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {order.status === "pending" && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-emerald-500/50 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                          disabled={loadingId === order.id}
                          onClick={() => handleAction(order.id, "approve")}
                        >
                          {loadingId === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-destructive/50 text-destructive hover:bg-destructive hover:text-white"
                          disabled={loadingId === order.id}
                          onClick={() => handleAction(order.id, "reject")}
                        >
                          {loadingId === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-3xl w-full max-h-[90vh] flex flex-col bg-card rounded-xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-border flex justify-between items-center bg-secondary">
              <h3 className="font-bold">Payment Proof</h3>
              <button onClick={() => setPreviewImage(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 flex justify-center bg-black/5">
              <img src={previewImage} alt="Proof" className="max-w-full h-auto object-contain shadow-md" />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
