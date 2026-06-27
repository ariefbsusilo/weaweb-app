"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Logo from "@/components/Logo"
import { motion, AnimatePresence } from "framer-motion"
import {
  Check, ArrowRight, Sparkles, Shield, Loader2
} from "lucide-react"

declare global {
  interface Window {
    snap: any;
  }
}

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

type Step = "select" | "done"

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("select")
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    // Load Midtrans Snap script dynamically
    const snapScript = process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL || "https://app.sandbox.midtrans.com/snap/snap.js";
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "";
    
    if (!document.querySelector(`script[src="${snapScript}"]`)) {
      const script = document.createElement("script");
      script.src = snapScript;
      script.setAttribute("data-client-key", clientKey);
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleSelectPlan = async (plan: typeof plans[0]) => {
    setSelectedPlan(plan)
    setUploading(true)
    setError("")

    try {
      if ((plan as any).isFree) {
        // Free trial bypasses Snap
        const res = await fetch("/api/v1/payment/snap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planName: plan.id, amount: 0 }),
        })
        if (!res.ok) throw new Error("Gagal mengaktifkan trial.");
        setStep("done")
        setUploading(false)
        return
      }

      // Paid plans: Fetch snap token
      const res = await fetch("/api/v1/payment/snap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planName: plan.id, amount: plan.amount }),
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Gagal membuat transaksi.");
      if (!data.token) throw new Error("Snap token tidak ditemukan dari server.");

      // Open Midtrans Snap Popup
      if (window.snap) {
        window.snap.pay(data.token, {
          onSuccess: function (result: any) {
            console.log("Payment success:", result);
            setStep("done");
          },
          onPending: function (result: any) {
            console.log("Payment pending:", result);
            setStep("done"); // Or handle pending differently (redirect to a waiting page)
          },
          onError: function (result: any) {
            console.error("Payment error:", result);
            setError("Pembayaran gagal atau dibatalkan.");
          },
          onClose: function () {
            // User closed the popup without paying
            setError("Anda menutup jendela pembayaran.");
          }
        });
      } else {
        throw new Error("Snap.js belum terload sempurna. Silakan refresh halaman.");
      }

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
          <Logo size={32} />
          <span className="font-black text-white text-lg">Weaweb</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-white/30">
          <div className={`flex items-center gap-1.5 ${step === "select" ? "text-emerald-400" : "text-white/25"}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${step === "select" ? "bg-emerald-500 text-white" : "bg-emerald-500/20 text-emerald-400"}`}>
              {step === "done" ? <Check className="w-3 h-3" /> : "1"}
            </div>
            Pilih Paket
          </div>
          <div className="w-8 h-px bg-white/10" />
          <div className={`flex items-center gap-1.5 ${step === "done" ? "text-emerald-400" : "text-white/25"}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${step === "done" ? "bg-emerald-500 text-white" : "bg-white/10"}`}>2</div>
            Selesai
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
                  Satu langkah lagi sebelum dashboard Anda aktif. Pilih paket dan lakukan pembayaran otomatis (Midtrans) untuk mulai.
                </p>
                {error && (
                  <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 max-w-md mx-auto">
                    <p className="text-red-400 text-sm font-medium">{error}</p>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                {plans.map((plan, i) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`relative flex flex-col p-7 rounded-2xl border-2 transition-all duration-200 ${
                      plan.highlighted
                        ? "border-emerald-500/50 bg-emerald-500/5"
                        : plan.id === "Business"
                        ? "border-purple-500/20 bg-white/[0.02]"
                        : "border-blue-500/20 bg-white/[0.02]"
                    }`}
                  >
                    {plan.badge && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-5 py-1 rounded-full text-[11px] font-black shadow-lg shadow-emerald-500/30 whitespace-nowrap">
                        {plan.badge}
                      </div>
                    )}

                    <div className="mb-5">
                      <h3 className="font-black text-lg text-white mb-1">{plan.name}</h3>
                      <p className="text-white/30 text-sm">{plan.tagline}</p>
                    </div>

                    <div className="mb-7">
                      <div className="text-xs text-white/20 line-through mb-1">{plan.originalPrice || "\u00A0"}</div>
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

                    <button 
                      onClick={() => handleSelectPlan(plan)}
                      disabled={uploading}
                      className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                        plan.highlighted
                          ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/25"
                          : "bg-white/5 hover:bg-white/10 text-white border border-white/8"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {uploading && selectedPlan?.id === plan.id ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
                      ) : (
                        <>Pilih {plan.name} <ArrowRight className="w-4 h-4" /></>
                      )}
                    </button>
                  </motion.div>
                ))}
              </div>
              
              <p className="text-center text-white/20 text-xs mt-8 flex items-center justify-center gap-2">
                <Shield className="w-3.5 h-3.5" />
                Pembayaran aman didukung oleh Midtrans (Gopay, OVO, Virtual Account, dll)
              </p>
            </motion.div>
          )}

          {/* ── STEP 2: DONE ── */}
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

              <h2 className="text-3xl font-black mb-3">Pesanan Diproses! 🎉</h2>
              <p className="text-white/40 mb-2 leading-relaxed">
                Terima kasih! Transaksi Anda untuk paket <strong className="text-white">{selectedPlan?.name}</strong> telah tercatat.
              </p>
              <p className="text-white/30 text-sm mb-8">
                Jika Anda sudah menyelesaikan pembayaran, sistem akan otomatis memverifikasi dan mengaktifkan akun Anda.
              </p>

              <div className="flex flex-col gap-3">
                <a href="/dashboard" className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-sm transition-all flex items-center justify-center gap-2">
                  Masuk ke Dashboard <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
