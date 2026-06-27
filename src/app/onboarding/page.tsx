"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Logo from "@/components/Logo"
import { motion, AnimatePresence } from "framer-motion"
import {
  Check, ArrowRight, Sparkles, Shield, Loader2, Zap
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
    color: "border-white/10 hover:border-emerald-400/50",
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
    color: "border-white/10 hover:border-blue-500/50",
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
    color: "border-white/10 hover:border-purple-500/50",
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
    color: "border-emerald-500/40 hover:border-emerald-400",
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
            setStep("done"); // Or handle pending differently
          },
          onError: function (result: any) {
            console.error("Payment error:", result);
            setError("Pembayaran gagal atau dibatalkan.");
          },
          onClose: function () {
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  return (
    <div className="min-h-screen bg-[#020611] text-white flex flex-col relative overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* Immersive Ambient Backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
      
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 px-6 py-4 flex items-center justify-between backdrop-blur-md bg-[#020611]/60">
        <div className="flex items-center gap-2.5">
          <Logo size={32} />
          <span className="font-black text-white text-lg tracking-tight">Weaweb</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-white/30">
          <div className={`flex items-center gap-1.5 ${step === "select" ? "text-emerald-400" : "text-white/25"}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${step === "select" ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "bg-emerald-500/20 text-emerald-400"}`}>
              {step === "done" ? <Check className="w-3 h-3" /> : "1"}
            </div>
            Pilih Paket
          </div>
          <div className="w-8 h-px bg-white/10" />
          <div className={`flex items-center gap-1.5 ${step === "done" ? "text-emerald-400" : "text-white/25"}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${step === "done" ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "bg-white/10"}`}>2</div>
            Selesai
          </div>
        </div>
        <Link href="/api/auth/signout" className="text-xs text-white/20 hover:text-white/50 transition-colors font-medium">Keluar</Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-16 relative z-10">
        <AnimatePresence mode="wait">
          {/* ── STEP 1: PILIH PAKET ── */}
          {step === "select" && (
            <motion.div key="select" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-6xl">
              <div className="text-center mb-16">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold mb-6 uppercase tracking-widest backdrop-blur-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Selamat Datang di Weaweb
                </motion.div>
                <motion.h1 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight"
                >
                  Pilih paket yang<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">tepat untuk Anda</span>
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="text-white/40 text-lg max-w-xl mx-auto"
                >
                  Satu langkah lagi sebelum dashboard Anda aktif. Pilih paket dan lakukan pembayaran otomatis untuk mulai menggunakan Weaweb.
                </motion.p>
                {error && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 max-w-md mx-auto backdrop-blur-md">
                    <p className="text-red-400 text-sm font-medium">{error}</p>
                  </motion.div>
                )}
              </div>

              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {plans.map((plan) => (
                  <motion.div
                    key={plan.id}
                    variants={itemVariants}
                    className={`relative flex flex-col p-8 rounded-3xl border transition-all duration-300 backdrop-blur-xl group ${
                      plan.highlighted
                        ? "bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-400 hover:shadow-[0_0_40px_rgba(16,185,129,0.2)] hover:-translate-y-2"
                        : `bg-white/[0.01] border-white/5 ${plan.color} hover:-translate-y-2 hover:shadow-2xl hover:bg-white/[0.03]`
                    }`}
                  >
                    {/* Glowing effect inside the card for highlighted plan */}
                    {plan.highlighted && (
                      <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none" />
                    )}

                    {plan.badge && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-400 text-white px-5 py-1.5 rounded-full text-xs font-black shadow-[0_0_20px_rgba(16,185,129,0.4)] whitespace-nowrap">
                        {plan.badge}
                      </div>
                    )}

                    <div className="mb-6 relative z-10">
                      <h3 className="font-black text-xl text-white mb-1.5">{plan.name}</h3>
                      <p className="text-white/40 text-sm">{plan.tagline}</p>
                    </div>

                    <div className="mb-8 relative z-10">
                      <div className="text-xs text-white/20 line-through mb-1 h-4">{plan.originalPrice}</div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-white tracking-tight">{plan.price}</span>
                        <span className="text-white/30 text-sm font-medium">{plan.period}</span>
                      </div>
                    </div>

                    <ul className="space-y-3.5 mb-10 flex-1 relative z-10">
                      {plan.features.map((f, j) => (
                        <li key={j} className="flex items-start gap-3 text-sm">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${plan.highlighted ? 'bg-emerald-500/20' : 'bg-white/5'}`}>
                            <Check className={`w-3 h-3 ${plan.highlighted ? 'text-emerald-400' : 'text-white/40'}`} />
                          </div>
                          <span className={plan.highlighted ? "text-white/80 font-medium" : "text-white/50"}>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <button 
                      onClick={() => handleSelectPlan(plan)}
                      disabled={uploading}
                      className={`relative z-10 w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                        plan.highlighted
                          ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
                          : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {uploading && selectedPlan?.id === plan.id ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
                      ) : (
                        <>
                          Pilih {plan.name} 
                          <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${plan.highlighted ? 'text-white' : 'text-white/50'}`} />
                        </>
                      )}
                    </button>
                  </motion.div>
                ))}
              </motion.div>
              
              <motion.p 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                className="text-center text-white/20 text-xs mt-12 flex items-center justify-center gap-2"
              >
                <Shield className="w-3.5 h-3.5" />
                Pembayaran super aman didukung oleh Midtrans (Gopay, OVO, QRIS, Virtual Account, dll)
              </motion.p>
            </motion.div>
          )}

          {/* ── STEP 2: DONE ── */}
          {step === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md text-center">
              <div className="absolute inset-0 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />
              
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(16,185,129,0.4)]"
              >
                <Check className="w-12 h-12 text-white" />
              </motion.div>

              <h2 className="text-4xl font-black mb-4 tracking-tight">Pesanan Diproses! 🎉</h2>
              <p className="text-white/50 mb-3 text-lg leading-relaxed">
                Terima kasih! Transaksi Anda untuk paket <strong className="text-white">{selectedPlan?.name}</strong> telah tercatat di sistem kami.
              </p>
              <p className="text-white/30 text-sm mb-10">
                Jika Anda sudah menyelesaikan pembayaran via Midtrans, sistem otomatis memverifikasi dan mengaktifkan fitur Anda detik ini juga.
              </p>

              <div className="flex flex-col gap-4 relative z-10">
                <a href="/dashboard" className="w-full py-4 rounded-2xl bg-white text-black hover:bg-white/90 font-black text-sm transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
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
