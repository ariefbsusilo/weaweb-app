"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import {
  ShieldCheck, Users, Building2, MonitorSmartphone, MessageSquare,
  TrendingUp, DollarSign, Clock, CheckCircle2, XCircle, Eye, Check, X,
  Loader2, Search, Filter, BarChart3, Activity, Wifi, WifiOff, Globe,
  ChevronDown, RefreshCw, ArrowUpRight, Package, Bell, Settings
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

type Tab = "overview" | "orders" | "users" | "devices"

function StatCard({ icon: Icon, label, value, sub, color, trend }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0d1117] border border-white/8 rounded-2xl p-5 flex flex-col gap-3 hover:border-white/15 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-bold flex items-center gap-1 ${trend >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            <ArrowUpRight className="w-3 h-3" /> {trend}%
          </span>
        )}
      </div>
      <div>
        <div className="text-2xl font-black text-white">{value}</div>
        <div className="text-xs text-white/40 font-medium mt-0.5">{label}</div>
        {sub && <div className="text-xs text-white/25 mt-0.5">{sub}</div>}
      </div>
    </motion.div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    rejected: "bg-red-500/10 text-red-400 border-red-500/20",
    free: "bg-white/5 text-white/40 border-white/10",
    Starter: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Business: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    "AI Automation": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Enterprise: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    connect: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    disconnect: "bg-white/5 text-white/30 border-white/8",
  }
  const cls = map[status] || "bg-white/5 text-white/40 border-white/10"
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${cls}`}>
      {status}
    </span>
  )
}

export function AdminDashboardClient({ stats, orders: initialOrders, tenants: initialTenants }: {
  stats: any
  orders: any[]
  tenants: any[]
}) {
  const [tab, setTab] = useState<Tab>("overview")
  const [orders, setOrders] = useState(initialOrders)
  const [tenants, setTenants] = useState(initialTenants)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [planFilter, setPlanFilter] = useState("all")
  
  const [editingPlanTenantId, setEditingPlanTenantId] = useState<string | null>(null)
  const [editPlanState, setEditPlanState] = useState({ planName: "", planExpiresAt: "" })
  const [savingPlan, setSavingPlan] = useState(false)

  const handleSavePlan = async (tenantId: string) => {
    setSavingPlan(true)
    try {
      const res = await fetch("/api/admin/tenants/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          planName: editPlanState.planName,
          planExpiresAt: editPlanState.planExpiresAt || null,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setTenants(prev => prev.map(t => t.id === tenantId ? { ...t, planName: data.tenant.planName, planExpiresAt: data.tenant.planExpiresAt } : t))
      }
    } finally {
      setSavingPlan(false)
      setEditingPlanTenantId(null)
    }
  }

  const handleAction = async (orderId: string, action: "approve" | "reject") => {
    setLoadingId(orderId)
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action }),
      })
      if (res.ok) {
        const data = await res.json()
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: data.order.status } : o))
      }
    } finally {
      setLoadingId(null)
    }
  }

  const filteredOrders = useMemo(() =>
    orders.filter(o => {
      const matchSearch = o.tenant?.name?.toLowerCase().includes(search.toLowerCase()) ||
        o.planName?.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === "all" || o.status === statusFilter
      return matchSearch && matchStatus
    }), [orders, search, statusFilter])

  const filteredTenants = useMemo(() =>
    tenants.filter(t => {
      const matchSearch = t.name?.toLowerCase().includes(search.toLowerCase()) ||
        t.users[0]?.user?.email?.toLowerCase().includes(search.toLowerCase())
      const matchPlan = planFilter === "all" || t.planName === planFilter
      return matchSearch && matchPlan
    }), [tenants, search, planFilter])

  const TABS = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "orders", label: "Orders", icon: Package, badge: stats.pendingOrders || 0 },
    { id: "users", label: "Workspaces", icon: Building2 },
    { id: "devices", label: "Devices", icon: MonitorSmartphone },
  ] as const

  const allDevices = tenants.flatMap(t =>
    t.devices.map((d: any) => ({ ...d, tenantName: t.name, planName: t.planName }))
  )
  const filteredDevices = allDevices.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.phoneNumber?.includes(search) ||
    d.tenantName?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#040810] text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="border-b border-white/5 bg-[#040810]/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Weaweb" width={32} height={32} className="rounded-xl" />
            <div>
              <div className="font-black text-white text-sm">Weaweb SuperAdmin</div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider">Control Center</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {stats.pendingOrders > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                <Bell className="w-3.5 h-3.5" />
                {stats.pendingOrders} pending
              </div>
            )}
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white/30">Live</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 py-8">
        {/* Tab Navigation */}
        <div className="flex items-center gap-1 mb-8 bg-white/3 rounded-xl p-1 border border-white/8 w-fit">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id as Tab); setSearch(""); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${tab === t.id
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
              {(t as any).badge > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">
                  {(t as any).badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {tab === "overview" && (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={DollarSign} label="Total Revenue" value={`Rp ${(stats.totalRevenue / 1000).toFixed(0)}K`} sub="from paid orders" color="bg-emerald-500/10 text-emerald-400" trend={12} />
              <StatCard icon={Building2} label="Total Workspaces" value={stats.totalTenants} sub={`${stats.totalUsers} users total`} color="bg-blue-500/10 text-blue-400" trend={8} />
              <StatCard icon={MonitorSmartphone} label="Active Devices" value={stats.connectedDevices} sub={`of ${stats.totalDevices} total`} color="bg-purple-500/10 text-purple-400" />
              <StatCard icon={Clock} label="Pending Orders" value={stats.pendingOrders} sub="awaiting verification" color="bg-amber-500/10 text-amber-400" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={MessageSquare} label="Total Messages" value={stats.totalMessages.toLocaleString()} color="bg-cyan-500/10 text-cyan-400" />
              <StatCard icon={TrendingUp} label="Campaigns" value={stats.totalCampaigns} color="bg-pink-500/10 text-pink-400" />
              <StatCard icon={Users} label="Contacts" value={stats.totalContacts.toLocaleString()} color="bg-orange-500/10 text-orange-400" />
              <StatCard icon={CheckCircle2} label="Paid Orders" value={orders.filter((o: any) => o.status === "paid").length} color="bg-teal-500/10 text-teal-400" />
            </div>

            {/* Recent Orders Preview */}
            <div className="bg-[#0d1117] border border-white/8 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
                <h3 className="font-black text-white">Recent Orders</h3>
                <button onClick={() => setTab("orders")} className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1">
                  View all <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
              <div className="divide-y divide-white/5">
                {orders.slice(0, 5).map(o => (
                  <div key={o.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/2 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-xs font-black text-white">
                        {o.tenant?.name?.[0] || "?"}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white/80">{o.tenant?.name}</div>
                        <div className="text-xs text-white/30">{o.planName}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-mono text-white/60">Rp {o.amount.toLocaleString("id-ID")}</span>
                      <StatusBadge status={o.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Plan distribution */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-[#0d1117] border border-white/8 rounded-2xl p-6">
                <h3 className="font-black text-white mb-5">Plan Distribution</h3>
                <div className="space-y-3">
                  {["free", "Starter", "Business", "AI Automation"].map(plan => {
                    const count = tenants.filter(t => t.planName === plan).length
                    const pct = tenants.length > 0 ? Math.round((count / tenants.length) * 100) : 0
                    return (
                      <div key={plan}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-white/50 font-medium">{plan}</span>
                          <span className="text-white/30">{count} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="h-full bg-emerald-500 rounded-full"
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="bg-[#0d1117] border border-white/8 rounded-2xl p-6">
                <h3 className="font-black text-white mb-5">Revenue Breakdown</h3>
                <div className="space-y-3">
                  {[
                    { plan: "Starter", price: 299000, color: "bg-blue-500" },
                    { plan: "Business", price: 499000, color: "bg-purple-500" },
                    { plan: "AI Automation", price: 999000, color: "bg-emerald-500" },
                  ].map(({ plan, price, color }) => {
                    const planOrders = orders.filter(o => o.planName === plan && o.status === "paid")
                    const rev = planOrders.length * price
                    return (
                      <div key={plan} className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${color} shrink-0`} />
                        <div className="flex-1 flex justify-between">
                          <span className="text-white/50 text-sm">{plan}</span>
                          <span className="text-white/60 text-sm font-mono font-bold">Rp {rev.toLocaleString("id-ID")}</span>
                        </div>
                      </div>
                    )
                  })}
                  <div className="pt-3 border-t border-white/5 flex justify-between">
                    <span className="text-white/50 text-sm font-bold">Total</span>
                    <span className="text-emerald-400 text-sm font-black">Rp {stats.totalRevenue.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── ORDERS TAB ── */}
        {tab === "orders" && (
          <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            {/* Filter bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search workspace or plan..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/3 border border-white/8 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-white/3 border border-white/8 text-sm text-white/60 focus:outline-none focus:border-emerald-500/50">
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="bg-[#0d1117] border border-white/8 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      {["Date", "Workspace", "Plan", "Amount", "Status", "Proof", "Actions"].map(h => (
                        <th key={h} className="px-5 py-4 text-left text-[11px] font-black text-white/25 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(o => (
                      <tr key={o.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                        <td className="px-5 py-4 text-white/30 text-xs whitespace-nowrap">
                          {new Date(o.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                          <div className="text-white/15 text-[10px]">{new Date(o.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                              {o.tenant?.name?.[0] || "?"}
                            </div>
                            <div>
                              <div className="font-bold text-white/80 text-xs">{o.tenant?.name}</div>
                              <div className="text-white/25 text-[10px]">{o.tenant?.planName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4"><StatusBadge status={o.planName} /></td>
                        <td className="px-5 py-4 font-mono text-white/60 font-bold whitespace-nowrap">
                          Rp {o.amount.toLocaleString("id-ID")}
                        </td>
                        <td className="px-5 py-4"><StatusBadge status={o.status} /></td>
                        <td className="px-5 py-4">
                          {o.proofUrl ? (
                            <button onClick={() => setPreviewImage(o.proofUrl)} className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-xs font-bold">
                              <Eye className="w-3.5 h-3.5" /> View
                            </button>
                          ) : <span className="text-white/15">—</span>}
                        </td>
                        <td className="px-5 py-4">
                          {o.status === "pending" && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAction(o.id, "approve")}
                                disabled={loadingId === o.id}
                                className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                              >
                                {loadingId === o.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={() => handleAction(o.id, "reject")}
                                disabled={loadingId === o.id}
                                className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredOrders.length === 0 && (
                      <tr><td colSpan={7} className="px-5 py-12 text-center text-white/20 text-sm">No orders found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── USERS / WORKSPACES TAB ── */}
        {tab === "users" && (
          <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search workspace or email..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/3 border border-white/8 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <select value={planFilter} onChange={e => setPlanFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-white/3 border border-white/8 text-sm text-white/60 focus:outline-none focus:border-emerald-500/50">
                <option value="all">All Plans</option>
                <option value="free">Free</option>
                <option value="Starter">Starter</option>
                <option value="Business">Business</option>
                <option value="AI Automation">AI Automation</option>
              </select>
            </div>

            <div className="grid gap-4">
              {filteredTenants.map(t => {
                const adminUser = t.users.find((u: any) => u.role === "ADMIN")
                const connectedDevs = t.devices.filter((d: any) => d.status === "connect").length
                const lastOrder = t.orders[0]
                const isExpired = t.planExpiresAt && new Date(t.planExpiresAt) < new Date()
                return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0d1117] border border-white/8 rounded-2xl p-6 hover:border-white/15 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-5">
                      {/* Workspace info */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/20 flex items-center justify-center font-black text-emerald-400 text-base shrink-0">
                          {t.name[0]}
                        </div>
                        <div className="min-w-0">
                          <div className="font-black text-white text-sm">{t.name}</div>
                          <div className="text-white/30 text-xs truncate">{adminUser?.user?.email || "—"}</div>
                          <div className="text-white/20 text-[10px]">
                            Joined {new Date(t.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                          </div>
                        </div>
                      </div>

                      {/* Plan */}
                      <div className="flex flex-col items-start gap-1">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={t.planName} />
                          <button
                            onClick={() => {
                              setEditingPlanTenantId(t.id)
                              setEditPlanState({
                                planName: t.planName,
                                planExpiresAt: t.planExpiresAt ? new Date(t.planExpiresAt).toISOString().split('T')[0] : ""
                              })
                            }}
                            className="text-[10px] bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded text-white/50 transition-colors"
                          >
                            Edit
                          </button>
                        </div>
                        {t.planExpiresAt && (
                          <span className={`text-[10px] font-medium ${isExpired ? "text-red-400" : "text-white/25"}`}>
                            {isExpired ? "⚠ Expired" : `Expires ${new Date(t.planExpiresAt).toLocaleDateString("id-ID")}`}
                          </span>
                        )}
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-3 gap-4 text-center">
                        {[
                          { val: t.devices.length, label: "Devices", icon: MonitorSmartphone },
                          { val: t._count.contacts, label: "Contacts", icon: Users },
                          { val: t._count.messages, label: "Messages", icon: MessageSquare },
                        ].map((m, i) => (
                          <div key={i} className="flex flex-col items-center">
                            <m.icon className="w-3.5 h-3.5 text-white/20 mb-1" />
                            <div className="font-black text-white/70 text-sm">{m.val.toLocaleString()}</div>
                            <div className="text-[10px] text-white/25">{m.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Device dots */}
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex gap-1">
                          {t.devices.slice(0, 5).map((d: any) => (
                            <div key={d.id} className={`w-2.5 h-2.5 rounded-full ${d.status === "connect" ? "bg-emerald-400" : "bg-white/10"}`} title={d.name} />
                          ))}
                        </div>
                        <span className="text-[10px] text-white/25">{connectedDevs}/{t.devices.length} connected</span>
                      </div>

                      {/* Last order */}
                      {lastOrder && (
                        <div className="text-right">
                          <div className="text-xs font-bold text-white/50">Last Order</div>
                          <StatusBadge status={lastOrder.status} />
                        </div>
                      )}
                    </div>

                    {/* Devices list expanded */}
                    {t.devices.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-2">
                        {t.devices.map((d: any) => (
                          <div key={d.id} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/3 border border-white/8 text-xs text-white/40">
                            <div className={`w-1.5 h-1.5 rounded-full ${d.status === "connect" ? "bg-emerald-400" : "bg-white/20"}`} />
                            {d.name} · {d.phoneNumber}
                            <span className={`text-[10px] font-bold ${d.provider === "official" ? "text-purple-400" : "text-white/20"}`}>
                              {d.provider === "official" ? "META" : "QR"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )
              })}
              {filteredTenants.length === 0 && (
                <div className="text-center py-16 text-white/20">No workspaces found</div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── DEVICES TAB ── */}
        {tab === "devices" && (
          <motion.div key="devices" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search device name, phone, or workspace..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/3 border border-white/8 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <div className="flex items-center gap-3 text-sm text-white/40">
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-400" /> {stats.connectedDevices} Connected</span>
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-white/15" /> {stats.totalDevices - stats.connectedDevices} Offline</span>
              </div>
            </div>

            <div className="bg-[#0d1117] border border-white/8 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      {["Device", "Phone", "Workspace", "Plan", "Provider", "Status"].map(h => (
                        <th key={h} className="px-5 py-4 text-left text-[11px] font-black text-white/25 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDevices.map((d: any) => (
                      <tr key={d.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-2 h-2 rounded-full shrink-0 ${d.status === "connect" ? "bg-emerald-400" : "bg-white/15"}`} />
                            <span className="font-bold text-white/70 text-xs">{d.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-mono text-white/40 text-xs">{d.phoneNumber}</td>
                        <td className="px-5 py-4 text-white/50 text-xs">{d.tenantName}</td>
                        <td className="px-5 py-4"><StatusBadge status={d.planName} /></td>
                        <td className="px-5 py-4">
                          <span className={`text-xs font-bold ${d.provider === "official" ? "text-purple-400" : "text-white/30"}`}>
                            {d.provider === "official" ? "WhatsApp API" : "QR (Baileys)"}
                          </span>
                        </td>
                        <td className="px-5 py-4"><StatusBadge status={d.status} /></td>
                      </tr>
                    ))}
                    {filteredDevices.length === 0 && (
                      <tr><td colSpan={6} className="px-5 py-12 text-center text-white/20 text-sm">No devices found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="relative max-w-2xl w-full bg-[#0d1117] rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
                <span className="font-black text-white text-sm">Payment Proof</span>
                <button onClick={() => setPreviewImage(null)} className="text-white/30 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 bg-black/20 flex justify-center">
                <img src={previewImage} alt="Proof" className="max-w-full max-h-[70vh] object-contain rounded-xl" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Plan Modal */}
      <AnimatePresence>
        {editingPlanTenantId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative max-w-sm w-full bg-[#0d1117] rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
            >
              <div className="px-5 py-4 border-b border-white/8">
                <h3 className="font-black text-white">Edit Plan</h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/50">Plan Name</label>
                  <select
                    value={editPlanState.planName}
                    onChange={e => setEditPlanState({ ...editPlanState, planName: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="free">Free</option>
                    <option value="Starter">Starter</option>
                    <option value="Business">Business</option>
                    <option value="AI Automation">AI Automation</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/50">Expiration Date (Optional)</label>
                  <input
                    type="date"
                    value={editPlanState.planExpiresAt}
                    onChange={e => setEditPlanState({ ...editPlanState, planExpiresAt: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500/50 [color-scheme:dark]"
                  />
                </div>
              </div>
              <div className="p-4 bg-white/3 border-t border-white/8 flex gap-3 justify-end">
                <button
                  onClick={() => setEditingPlanTenantId(null)}
                  disabled={savingPlan}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white/50 hover:text-white transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSavePlan(editingPlanTenantId)}
                  disabled={savingPlan}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-400 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {savingPlan && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
