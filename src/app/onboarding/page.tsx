"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  Check, ArrowRight, Sparkles, Zap, Bot, Globe,
  BarChart, Database, MessageCircle, Shield, Clock, Upload, Loader2, X
} from "lucide-react"

const plans = [
  {
    id: "Free Trial",
    name: "Free Trial",
    price: "Rp 0",
    originalPrice: "",
    period: "/3 hari",
    tagline: "Coba tanpa risiko, tanpa kartu kredit",
    badge: "✨ Gratis",
    color: "border-emerald-500/40 hover:border-emerald-400",
    activeColor: "border-emerald-500 bg-emerald-500/5",
    badgeColor: "bg-emerald-500/10 text-emerald-400",
    features: [
      "1 Perangkat WhatsApp",
      "100 Broadcast",
      "Auto-Responder Dasar",
      "Manajemen Kontak",
      "Dukungan Komunitas",
    ],
    amount: 0,
    isFree: true,
  },
  {
    id: "Starter",
    name: "Starter",
    price: "Rp 299.000",
    originalPrice: "Rp 399.000",
    period: "/bulan",
    tagline: "Cocok untuk bisnis kecil",
    color: "border-blue-500/30 hover:border-blue-500/60",
    activeColor: "border-blue-500 bg-blue-500/5",
    badgeColor: "bg-blue-500/10 text-blue-400",
    features: [
      "1 Perangkat WhatsApp",
      "Broadcast Tak Terbatas",
      "Auto-Responder Dasar",
      "Manajemen Kontak",
      "Dukungan Email",
    ],
    amount: 299000,
  },
  {
    id: "Business",
    name: "Business",
    price: "Rp 499.000",
    originalPrice: "Rp 699.000",
    period: "/bulan",
    tagline: "Skalakan marketing Anda",
    color: "border-purple-500/30 hover:border-purple-500/60",
    activeColor: "border-purple-500 bg-purple-500/5",
    badgeColor: "bg-purple-500/10 text-purple-400",
    features: [
      "3 Perangkat WhatsApp",
      "Broadcast Tak Terbatas",
      "Kampanye Import Excel",
      "Auto-Responder Lanjutan",
      "Dukungan Prioritas",
    ],
    amount: 499000,
  },
  {
    id: "AI Automation",
    name: "AI Automation",
    price: "Rp 999.000",
    originalPrice: "Rp 1.500.000",
    period: "/bulan",
    tagline: "Autopilot penuh dengan AI",
    badge: "🔥 Paling Populer",
    color: "border-emerald-500/30 hover:border-emerald-500/60",
    activeColor: "border-emerald-500 bg-emerald-500/5",
    badgeColor: "bg-emerald-500/10 text-emerald-400",
    features: [
      "5 Perangkat WhatsApp",
      "Broadcast Tak Terbatas",
      "10.000 Pesan AI/bulan",
      "ChatGPT & Gemini AI",
      "Knowledge Base PDF",
      "Analitik AI Chat",
    ],
    amount: 999000,
    highlighted: true,
  },
]

type Step = "select" | "payment" | "done"

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("select")
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [dragOver, setDragOver] = useState(false)

  const handleSelectPlan = async (plan: typeof plans[0]) => {
    setSelectedPlan(plan)
    // Free trial: create order with amount 0 and skip payment step
    if ((plan as any).isFree) {
      setUploading(true)
      try {
        await fetch("/api/v1/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planName: plan.id, amount: 0, proofUrl: null }),
        })
        setStep("done")
      } catch {
        setError("Gagal mengaktifkan trial. Coba lagi.")
      } finally {
        setUploading(false)
      }
      return
    }
    setStep("payment")
  }

  const handleFileChange = (f: File) => {
    if (f.size > 5 * 1024 * 1024) { setError("Ukuran file maksimal 5MB"); return }
    if (!f.type.startsWith("image/")) { setError("Hanya file gambar yang diizinkan"); return }
    setFile(f)
    setError("")
  }

  const handleSubmit = async () => {
    if (!file || !selectedPlan) return
    setUploading(true)
    setError("")

    try {
      // Upload the proof image
      const formData = new FormData()
      formData.append("file", file)
      const uploadRes = await fetch("/api/v1/upload", { method: "POST", body: formData })
      const uploadData = await uploadRes.json()
      if (!uploadData.url) throw new Error("Upload failed")

      // Create order
      const orderRes = await fetch("/api/v1/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planName: selectedPlan.id,
          amount: selectedPlan.amount,
          proofUrl: uploadData.url,
        }),
      })
      if (!orderRes.ok) throw new Error("Order creation failed")

      setStep("done")
    } catch (e: any) {
      setError(e.message || "Terjadi kesalahan. Coba lagi.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#040810] text-white flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Weaweb" width={32} height={32} className="rounded-xl" />
          <span className="font-black text-white text-lg">Weaweb</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-white/30">
          <div className={`flex items-center gap-1.5 ${step === "select" ? "text-emerald-400" : "text-white/25"}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${step === "select" ? "bg-emerald-500 text-white" : "bg-emerald-500/20 text-emerald-400"}`}>
              {step === "payment" || step === "done" ? <Check className="w-3 h-3" /> : "1"}
            </div>
            Pilih Paket
          </div>
          <div className="w-8 h-px bg-white/10" />
          <div className={`flex items-center gap-1.5 ${step === "payment" ? "text-emerald-400" : step === "done" ? "text-white/25" : "text-white/25"}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${step === "payment" ? "bg-emerald-500 text-white" : step === "done" ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10"}`}>
              {step === "done" ? <Check className="w-3 h-3" /> : "2"}
            </div>
            Pembayaran
          </div>
          <div className="w-8 h-px bg-white/10" />
          <div className={`flex items-center gap-1.5 ${step === "done" ? "text-emerald-400" : "text-white/25"}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${step === "done" ? "bg-emerald-500 text-white" : "bg-white/10"}`}>3</div>
            Verifikasi
          </div>
        </div>
        <Link href="/api/auth/signout" className="text-xs text-white/20 hover:text-white/40 transition-colors">Keluar</Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <AnimatePresence mode="wait">

          {/* ── STEP 1: PILIH PAKET ── */}
          {step === "select" && (
            <motion.div key="select" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-5xl">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-bold mb-6 uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5" /> Selamat Datang di Weaweb!
                </div>
                <h1 className="text-4xl md:text-5xl font-black mb-4">
                  Pilih paket yang<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">tepat untuk Anda</span>
                </h1>
                <p className="text-white/40 text-lg max-w-lg mx-auto">
                  Satu langkah lagi sebelum dashboard Anda aktif. Pilih paket dan lakukan pembayaran untuk mulai.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-5">
                {plans.map((plan, i) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => handleSelectPlan(plan)}
                    className={`relative flex flex-col p-7 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:-translate-y-1 ${
                      plan.highlighted
                        ? "border-emerald-500/50 bg-emerald-500/5 hover:border-emerald-400"
                        : plan.id === "Business"
                        ? "border-purple-500/20 bg-white/[0.02] hover:border-purple-500/50 hover:bg-purple-500/5"
                        : "border-blue-500/20 bg-white/[0.02] hover:border-blue-500/50 hover:bg-blue-500/5"
                    }`}
                  >
                    {plan.badge && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-5 py-1 rounded-full text-[11px] font-black shadow-lg shadow-emerald-500/30">
                        {plan.badge}
                      </div>
                    )}

                    <div className="mb-5">
                      <h3 className="font-black text-lg text-white mb-1">{plan.name}</h3>
                      <p className="text-white/30 text-sm">{plan.tagline}</p>
                    </div>

                    <div className="mb-7">
                      <div className="text-xs text-white/20 line-through mb-1">{plan.originalPrice}</div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-white">{plan.price}</span>
                        <span className="text-white/30 text-sm">{plan.period}</span>
                      </div>
                    </div>

                    <ul className="space-y-2.5 mb-8 flex-1">
                      {plan.features.map((f, j) => (
                        <li key={j} className="flex items-center gap-2.5 text-sm">
                          <div className="w-4 h-4 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 text-emerald-400" />
                          </div>
                          <span className="text-white/50">{f}</span>
                        </li>
                      ))}
                    </ul>

                    <button className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                      plan.highlighted
                        ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/25"
                        : "bg-white/5 hover:bg-white/10 text-white border border-white/8"
                    }`}>
                      Pilih {plan.name} <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>

              <p className="text-center text-white/20 text-xs mt-8 flex items-center justify-center gap-2">
                <Shield className="w-3.5 h-3.5" />
                Pembayaran melalui transfer bank · Diverifikasi manual dalam 1x24 jam
              </p>
            </motion.div>
          )}

          {/* ── STEP 2: PAYMENT ── */}
          {step === "payment" && selectedPlan && (
            <motion.div key="payment" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-2xl">
              <button onClick={() => { setStep("select"); setFile(null); setError(""); }} className="flex items-center gap-2 text-white/30 hover:text-white text-sm mb-8 transition-colors">
                ← Kembali pilih paket
              </button>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Bank Info */}
                <div className="space-y-4">
                  <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6">
                    <h3 className="font-black text-white mb-5 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                        <span className="text-emerald-400 text-xs font-black">Rp</span>
                      </div>
                      Instruksi Pembayaran
                    </h3>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-white/40">Paket</span>
                        <span className="font-bold text-white">{selectedPlan.name}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-white/40">Total Bayar</span>
                        <span className="font-black text-emerald-400 text-lg">{selectedPlan.price}</span>
                      </div>
                    </div>

                    <div className="mt-5 p-4 rounded-xl bg-black/30 border border-white/5">
                      <div className="text-xs text-white/30 mb-3 uppercase tracking-wider font-bold">Transfer ke rekening</div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-white/40 text-sm">Bank</span>
                          <span className="font-bold text-white text-sm">BCA</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/40 text-sm">No. Rekening</span>
                          <span className="font-black text-white font-mono text-base tracking-widest">1234567890</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/40 text-sm">Atas Nama</span>
                          <span className="font-bold text-white text-sm">PT Weaweb</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
                      <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-400/80 leading-relaxed">
                        Transfer nominal <strong>tepat</strong> sesuai harga paket. Upload bukti transfer setelah selesai membayar.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Upload Proof */}
                <div className="space-y-4">
                  <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6">
                    <h3 className="font-black text-white mb-5 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center">
                        <Upload className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                      Upload Bukti Transfer
                    </h3>

                    {/* Dropzone */}
                    <div
                      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFileChange(f) }}
                      onClick={() => document.getElementById("proof-upload")?.click()}
                      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                        dragOver ? "border-emerald-500 bg-emerald-500/5" :
                        file ? "border-emerald-500/40 bg-emerald-500/3" : "border-white/10 hover:border-white/25 hover:bg-white/2"
                      }`}
                    >
                      <input
                        id="proof-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleFileChange(f) }}
                      />
                      {file ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <Check className="w-5 h-5 text-emerald-400" />
                          </div>
                          <span className="text-emerald-400 font-bold text-sm">{file.name}</span>
                          <span className="text-white/25 text-xs">{(file.size / 1024).toFixed(0)} KB</span>
                          <button
                            onClick={e => { e.stopPropagation(); setFile(null) }}
                            className="text-white/20 hover:text-red-400 text-xs flex items-center gap-1 mt-1"
                          >
                            <X className="w-3 h-3" /> Hapus
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <Upload className="w-5 h-5 text-white/30" />
                          </div>
                          <div>
                            <p className="text-white/50 text-sm font-semibold">Klik atau drag & drop</p>
                            <p className="text-white/20 text-xs mt-1">PNG, JPG, JPEG — Maks 5MB</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {error && (
                      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                        <p className="text-red-400 text-xs font-medium">{error}</p>
                      </motion.div>
                    )}

                    <button
                      onClick={handleSubmit}
                      disabled={!file || uploading}
                      className="w-full mt-5 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black transition-all flex items-center justify-center gap-2"
                    >
                      {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Mengirim...</> : <>Kirim Bukti Pembayaran <ArrowRight className="w-4 h-4" /></>}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: DONE ── */}
          {step === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6"
              >
                <Check className="w-10 h-10 text-emerald-400" />
              </motion.div>

              <h2 className="text-3xl font-black mb-3">Pesanan Diterima! 🎉</h2>
              <p className="text-white/40 mb-2 leading-relaxed">
                Terima kasih! Bukti pembayaran Anda untuk paket <strong className="text-white">{selectedPlan?.name}</strong> sudah kami terima.
              </p>
              <p className="text-white/30 text-sm mb-8">
                Tim kami akan memverifikasi dalam <strong className="text-amber-400">1×24 jam</strong>. Anda akan mendapat akses penuh setelah disetujui.
              </p>

              <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 mb-8 text-left space-y-3">
                {[
                  { icon: "✅", text: "Bukti transfer diterima" },
                  { icon: "⏳", text: "Menunggu verifikasi admin" },
                  { icon: "🚀", text: "Akses dashboard aktif" },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center gap-3 text-sm ${i === 0 ? "text-white/60" : i === 1 ? "text-amber-400/60" : "text-white/20"}`}>
                    <span>{item.icon}</span>
                    <span>{item.text}</span>
                    {i === 0 && <Check className="w-3.5 h-3.5 text-emerald-400 ml-auto" />}
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3">
                <a href="/dashboard/upgrade" className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 font-bold text-sm transition-all">
                  Cek Status Pesanan
                </a>
                <a href="/login" className="text-white/20 hover:text-white/40 text-xs transition-colors">
                  Kembali ke halaman login
                </a>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
