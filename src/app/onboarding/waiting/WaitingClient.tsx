"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Clock, CheckCircle2, Shield, Bell, LogOut } from "lucide-react"

export function WaitingClient({ planName, amount, submittedAt }: {
  planName: string
  amount: number
  submittedAt: string
}) {
  const submitted = new Date(submittedAt)

  return (
    <div className="min-h-screen bg-[#040810] text-white flex flex-col items-center justify-center px-4" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Weaweb" width={32} height={32} className="rounded-xl" />
          <span className="font-black text-white">Weaweb</span>
        </div>
        <Link href="/api/auth/signout" className="flex items-center gap-1.5 text-xs text-white/20 hover:text-white/40 transition-colors">
          <LogOut className="w-3.5 h-3.5" /> Keluar
        </Link>
      </div>

      <div className="max-w-md w-full text-center">
        {/* Animated waiting icon */}
        <div className="relative mx-auto w-24 h-24 mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-500 border-r-emerald-500/30"
          />
          <div className="absolute inset-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Clock className="w-8 h-8 text-emerald-400" />
          </div>
        </div>

        <h1 className="text-3xl font-black mb-3">Sedang Diverifikasi</h1>
        <p className="text-white/40 mb-8 leading-relaxed">
          Pembayaran Anda sedang dalam proses verifikasi oleh tim kami. Biasanya selesai dalam <strong className="text-amber-400">1×24 jam</strong>.
        </p>

        {/* Order summary */}
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 mb-6 text-left space-y-3">
          <div className="text-xs text-white/25 uppercase tracking-widest font-bold mb-4">Ringkasan Pesanan</div>
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-white/40 text-sm">Paket</span>
            <span className="font-black text-white">{planName}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-white/40 text-sm">Nominal</span>
            <span className="font-black text-emerald-400">Rp {amount.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-white/40 text-sm">Dikirim</span>
            <span className="text-white/60 text-sm">
              {submitted.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })},&nbsp;
              {submitted.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>

        {/* Progress steps */}
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 mb-8 space-y-4">
          {[
            { icon: CheckCircle2, text: "Bukti transfer diterima", done: true, color: "text-emerald-400" },
            { icon: Clock, text: "Verifikasi oleh admin", done: false, active: true, color: "text-amber-400" },
            { icon: Shield, text: "Akses dashboard diaktifkan", done: false, color: "text-white/20" },
          ].map((s, i) => (
            <div key={i} className={`flex items-center gap-3 text-sm ${s.done ? "text-white/70" : s.active ? "text-amber-400" : "text-white/20"}`}>
              <s.icon className={`w-4 h-4 shrink-0 ${s.color}`} />
              <span>{s.text}</span>
              {s.done && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto" />}
              {s.active && (
                <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="ml-auto w-2 h-2 rounded-full bg-amber-400" />
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-sm hover:bg-emerald-500/15 transition-all flex items-center justify-center gap-2"
          >
            <Bell className="w-4 h-4" /> Cek Status Terbaru
          </button>
          <Link href="/onboarding" className="text-white/20 hover:text-white/40 text-xs transition-colors">
            Ganti paket atau kirim ulang bukti
          </Link>
        </div>
      </div>
    </div>
  )
}
