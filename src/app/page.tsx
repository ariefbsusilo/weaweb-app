"use client";

import { useState, useEffect, useRef } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Check, ChevronRight, Zap, MessageCircle, Bot, Globe, BarChart, Database, ArrowRight, Star, TrendingUp, Shield, Clock, Sparkles, Play, Menu, X, Send, Users, Cpu, Lock } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

// ── CONTENT ──────────────────────────────────────────────────────────────────
const content = {
  en: {
    nav: { login: "Sign In", signup: "Get Started Free", features: "Features", pricing: "Pricing" },
    badge: "AI-Powered WhatsApp Platform",
    hero: {
      line1: "The Smartest Way to",
      line2: "Scale WhatsApp.",
      subtitle: "Send millions of messages, deploy AI agents, and manage every customer conversation — all from one powerful dashboard. Trusted by 10,000+ businesses across Southeast Asia.",
      cta1: "Start Free — No Card Needed",
      cta2: "Watch Demo",
      note: "Free 7-day trial · Cancel anytime",
    },
    stats: [
      { num: "10K+", label: "Active Businesses" },
      { num: "500M+", label: "Messages Delivered" },
      { num: "99.9%", label: "Uptime SLA" },
      { num: "< 2s", label: "Avg. Response Time" },
    ],
    howTitle: "How Weaweb Works",
    howSteps: [
      { step: "01", title: "Connect Your WhatsApp", desc: "Scan a QR code or plug in your official WhatsApp Business API token. Up and running in under 3 minutes." },
      { step: "02", title: "Import & Segment Contacts", desc: "Upload your Excel list or sync from your CRM. Tag, label, and group contacts however you need." },
      { step: "03", title: "Launch Campaigns & AI", desc: "Schedule bulk broadcasts or activate your AI chatbot. Sit back and watch the results roll in." },
    ],
    featuresTitle: "Built for businesses that move fast",
    featuresSubtitle: "Every tool you need to turn WhatsApp into your highest-converting sales channel.",
    features: [
      { icon: Globe, title: "Bulk Broadcasting", desc: "Send personalized messages to 50,000+ contacts in one click. Excel import, schedule, and track delivery in real-time.", badge: "Most Used" },
      { icon: Bot, title: "AI Chatbot Engine", desc: "Deploy GPT-4o or Gemini AI trained on your product PDFs. Handles FAQs, orders, and support — 24/7, automatically.", badge: "🔥 Hot" },
      { icon: MessageCircle, title: "Shared Team Inbox", desc: "Every agent on your team handles conversations from one unified view. Assign, label, resolve — lightning fast.", badge: "" },
      { icon: Zap, title: "Smart Auto-Responders", desc: "Keyword triggers, welcome flows, away messages, and complex drip sequences — built visually, zero code required.", badge: "" },
      { icon: Database, title: "Contact Management", desc: "Unlimited contacts. Rich custom fields, segments, and tags. Import via Excel or real-time webhook sync.", badge: "" },
      { icon: BarChart, title: "Analytics Dashboard", desc: "Live delivery rates, AI chat scores, agent performance, and campaign ROI. Export everything to CSV.", badge: "New" },
    ],
    social: {
      title: "Loved by businesses across Indonesia",
      rating: "4.9/5 from 2,000+ verified reviews",
      items: [
        { name: "Ahmad Fauzi", role: "Owner · Toko Online Jakarta", stars: 5, text: "Revenue jumped 3x in 2 months. The AI chatbot now handles 80% of inquiries without any human touching it." },
        { name: "Siti Rahayu", role: "Marketing Manager · PT Maju Bersama", stars: 5, text: "We blast 10,000 messages with one click. The campaign scheduler completely changed how our team operates." },
        { name: "Budi Santoso", role: "CEO · SaaS Startup", stars: 5, text: "Best WhatsApp tool we've ever used — period. Clean, fast, and the support team actually replies within minutes." },
      ]
    },
    pricingTitle: "Pricing that scales with you",
    pricingSubtitle: "No hidden fees. No long-term contracts. Start free.",
    plans: [
      { name: "Starter", desc: "Perfect for small teams", price: "Rp 299k", originalPrice: "Rp 399k", period: "/mo", features: ["1 WhatsApp Device", "Unlimited Broadcasts", "Basic Auto-Responder", "Contact Management", "Email Support"], cta: "Get Started", href: "/register?plan=Starter", highlight: false, badge: "" },
      { name: "Business", desc: "For scaling marketing teams", price: "Rp 499k", originalPrice: "Rp 699k", period: "/mo", features: ["3 WhatsApp Devices", "Unlimited Broadcasts", "Excel Import Campaigns", "Advanced Auto-Responder", "Priority Support"], cta: "Get Started", href: "/register?plan=Business", highlight: false, badge: "" },
      { name: "AI Automation", desc: "Full AI autopilot mode", price: "Rp 999k", originalPrice: "Rp 1.500k", period: "/mo", features: ["5 WhatsApp Devices", "Unlimited Broadcasts", "10,000 AI Messages/mo", "ChatGPT & Gemini AI", "PDF Knowledge Base", "AI Chat Analytics"], cta: "Start Automating", href: "/register?plan=AI Automation", highlight: true, badge: "Most Popular" },
      { name: "Enterprise", desc: "For high-volume operations", price: "Custom", originalPrice: "", period: "", features: ["Unlimited Devices", "Unlimited AI Messages", "Dedicated Server", "Custom API Access", "Account Manager", "SLA 99.9%"], cta: "Talk to Sales", href: "mailto:admin@weaweb.com", highlight: false, badge: "" },
    ],
    ctaBanner: { title: "Ready to put WhatsApp on autopilot?", subtitle: "Join 10,000+ businesses already growing with Weaweb. Start free today.", cta: "Start Your Free Trial" },
    footer: "© 2026 Weaweb · Built with ❤️ for Indonesian businesses",
  },
  id: {
    nav: { login: "Masuk", signup: "Mulai Gratis", features: "Fitur", pricing: "Harga" },
    badge: "Platform WhatsApp Bertenaga AI",
    hero: {
      line1: "Cara Paling Cerdas untuk",
      line2: "Skalakan WhatsApp.",
      subtitle: "Kirim jutaan pesan, pasang agen AI, dan kelola setiap percakapan pelanggan — dari satu dashboard yang powerful. Dipercaya 10.000+ bisnis di Asia Tenggara.",
      cta1: "Mulai Gratis — Tanpa Kartu Kredit",
      cta2: "Lihat Demo",
      note: "Gratis 7 hari · Batal kapan saja",
    },
    stats: [
      { num: "10RB+", label: "Bisnis Aktif" },
      { num: "500JT+", label: "Pesan Terkirim" },
      { num: "99,9%", label: "Uptime SLA" },
      { num: "< 2dtk", label: "Waktu Respons" },
    ],
    howTitle: "Cara Kerja Weaweb",
    howSteps: [
      { step: "01", title: "Hubungkan WhatsApp Anda", desc: "Scan QR code atau masukkan token WhatsApp Business API resmi. Langsung jalan dalam kurang dari 3 menit." },
      { step: "02", title: "Import & Segmentasi Kontak", desc: "Upload file Excel atau sync dari CRM Anda. Beri tag, label, dan kelompokkan kontak sesuai kebutuhan." },
      { step: "03", title: "Jalankan Kampanye & AI", desc: "Jadwalkan broadcast massal atau aktifkan chatbot AI. Tinggal duduk santai dan lihat hasilnya mengalir." },
    ],
    featuresTitle: "Dibangun untuk bisnis yang bergerak cepat",
    featuresSubtitle: "Semua alat yang Anda butuhkan untuk mengubah WhatsApp menjadi channel penjualan terbaik.",
    features: [
      { icon: Globe, title: "Broadcast Massal", desc: "Kirim pesan personal ke 50.000+ kontak dalam satu klik. Import Excel, jadwalkan, dan pantau pengiriman real-time.", badge: "Paling Populer" },
      { icon: Bot, title: "Mesin Chatbot AI", desc: "Pasang AI GPT-4o atau Gemini yang dilatih dari PDF produk Anda. Menangani FAQ, pesanan, dan support — 24/7 otomatis.", badge: "🔥 Trending" },
      { icon: MessageCircle, title: "Inbox Tim Terpadu", desc: "Setiap agen tim menangani percakapan dari satu tampilan terpusat. Assign, label, selesaikan — super cepat.", badge: "" },
      { icon: Zap, title: "Auto-Responder Cerdas", desc: "Trigger kata kunci, alur selamat datang, pesan away, dan drip sequence kompleks — dibuat visual, tanpa kode.", badge: "" },
      { icon: Database, title: "Manajemen Kontak", desc: "Kontak tak terbatas. Field kustom, segmen, dan tag yang kaya. Import via Excel atau sync webhook real-time.", badge: "" },
      { icon: BarChart, title: "Dashboard Analitik", desc: "Tingkat pengiriman live, skor AI chat, performa agen, dan ROI kampanye. Export semuanya ke CSV.", badge: "Baru" },
    ],
    social: {
      title: "Dicintai bisnis di seluruh Indonesia",
      rating: "4,9/5 dari 2.000+ ulasan terverifikasi",
      items: [
        { name: "Ahmad Fauzi", role: "Pemilik · Toko Online Jakarta", stars: 5, text: "Revenue naik 3x dalam 2 bulan. Chatbot AI sekarang menangani 80% pertanyaan tanpa sentuhan manusia." },
        { name: "Siti Rahayu", role: "Marketing Manager · PT Maju Bersama", stars: 5, text: "Kami blast 10.000 pesan dengan satu klik. Fitur campaign scheduler benar-benar mengubah cara kerja tim kami." },
        { name: "Budi Santoso", role: "CEO · Startup SaaS", stars: 5, text: "Tool WhatsApp terbaik yang pernah kami gunakan — titik. Bersih, cepat, dan tim support-nya balas dalam hitungan menit." },
      ]
    },
    pricingTitle: "Harga yang tumbuh bersama bisnis Anda",
    pricingSubtitle: "Tanpa biaya tersembunyi. Tanpa kontrak jangka panjang. Mulai gratis.",
    plans: [
      { name: "Starter", desc: "Cocok untuk tim kecil", price: "Rp 299k", originalPrice: "Rp 399k", period: "/bln", features: ["1 Perangkat WhatsApp", "Broadcast Tak Terbatas", "Auto-Responder Dasar", "Manajemen Kontak", "Dukungan Email"], cta: "Mulai Sekarang", href: "/register?plan=Starter", highlight: false, badge: "" },
      { name: "Business", desc: "Untuk tim marketing berkembang", price: "Rp 499k", originalPrice: "Rp 699k", period: "/bln", features: ["3 Perangkat WhatsApp", "Broadcast Tak Terbatas", "Kampanye Import Excel", "Auto-Responder Lanjutan", "Dukungan Prioritas"], cta: "Mulai Sekarang", href: "/register?plan=Business", highlight: false, badge: "" },
      { name: "AI Automation", desc: "Mode autopilot penuh dengan AI", price: "Rp 999k", originalPrice: "Rp 1.500k", period: "/bln", features: ["5 Perangkat WhatsApp", "Broadcast Tak Terbatas", "10.000 Pesan AI/bln", "ChatGPT & Gemini AI", "Knowledge Base PDF", "Analitik AI Chat"], cta: "Mulai Automasi", href: "/register?plan=AI Automation", highlight: true, badge: "Paling Populer" },
      { name: "Enterprise", desc: "Untuk operasi volume tinggi", price: "Kustom", originalPrice: "", period: "", features: ["Perangkat Tak Terbatas", "Pesan AI Tak Terbatas", "Server Dedicated", "Akses API Kustom", "Account Manager", "SLA 99,9%"], cta: "Hubungi Sales", href: "mailto:admin@weaweb.com", highlight: false, badge: "" },
    ],
    ctaBanner: { title: "Siap pasang WhatsApp pada mode autopilot?", subtitle: "Bergabung dengan 10.000+ bisnis yang sudah tumbuh bersama Weaweb. Mulai gratis hari ini.", cta: "Mulai Uji Coba Gratis" },
    footer: "© 2026 Weaweb · Dibuat dengan ❤️ untuk bisnis Indonesia",
  }
};

// ── PARTICLE BG COMPONENT ─────────────────────────────────────────────────────
function ParticleField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(60)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-[1px] h-[1px] bg-emerald-400/40 rounded-full"
          style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
          animate={{ opacity: [0, 0.8, 0], scale: [0, 1.5, 0] }}
          transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 5, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ── GRID LINES COMPONENT ──────────────────────────────────────────────────────
function GridLines() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.04]">
      <div className="w-full h-full" style={{
        backgroundImage: `linear-gradient(to right, #10b981 1px, transparent 1px), linear-gradient(to bottom, #10b981 1px, transparent 1px)`,
        backgroundSize: '80px 80px'
      }} />
    </div>
  );
}

// ── MOCK DASHBOARD COMPONENT ──────────────────────────────────────────────────
function MockDashboard() {
  const msgs = [
    { name: "Andi S.", msg: "Halo, ada promo hari ini?", time: "09:41", unread: true },
    { name: "Dewi R.", msg: "Terima kasih! Pesanan sudah diterima", time: "09:38", unread: false },
    { name: "Budi M.", msg: "Kapan barangnya sampai?", time: "09:35", unread: true },
  ];
  return (
    <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#0a0f1a]/80 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/50 text-xs">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white/60 font-semibold text-[10px] uppercase tracking-wider">AI Inbox · Live</span>
        </div>
        <span className="text-emerald-400 font-bold text-[10px]">3 unread</span>
      </div>
      {/* Messages */}
      {msgs.map((m, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 + i * 0.2 }}
          className={`flex items-center gap-3 px-4 py-3 border-b border-white/5 ${m.unread ? 'bg-emerald-500/5' : ''}`}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center font-bold text-[10px] text-white shrink-0">
            {m.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-0.5">
              <span className="font-bold text-white/80 text-[11px]">{m.name}</span>
              <span className="text-white/30 text-[9px]">{m.time}</span>
            </div>
            <span className="text-white/40 text-[10px] truncate block">{m.msg}</span>
          </div>
          {m.unread && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />}
        </motion.div>
      ))}
      {/* AI Reply bar */}
      <div className="px-4 py-3 bg-emerald-500/5 border-t border-emerald-500/10">
        <div className="flex items-center gap-2">
          <Bot className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <motion.span
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-emerald-400 text-[10px] font-mono"
          >
            AI sedang membalas Andi S...
          </motion.span>
        </div>
      </div>
      {/* Stats bar */}
      <div className="grid grid-cols-3 divide-x divide-white/5 border-t border-white/5">
        {[["1,247", "Sent"], ["98.2%", "Delivered"], ["43%", "Read"]].map(([val, lab], i) => (
          <div key={i} className="px-3 py-2 text-center">
            <div className="font-black text-white/80 text-sm">{val}</div>
            <div className="text-white/30 text-[9px] uppercase tracking-wider">{lab}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [lang, setLang] = useState<"en" | "id">("id");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const t = content[lang];

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollTo = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMenuOpen(false); };

  return (
    <div className="min-h-screen bg-[#040810] text-white selection:bg-emerald-500/30 overflow-x-hidden" style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#040810]/90 backdrop-blur-xl border-b border-white/5 shadow-xl shadow-black/20' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <Image src="/logo.png" alt="Weaweb" width={36} height={36} className="rounded-xl group-hover:scale-105 transition-transform" />
              <span className="text-xl font-black tracking-tight text-white">Weaweb</span>
            </Link>

            {/* Center nav */}
            <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-full px-2 py-1 border border-white/8">
              <button onClick={() => scrollTo('how')} className="px-4 py-1.5 rounded-full text-sm font-semibold text-white/60 hover:text-white hover:bg-white/10 transition-all">{t.nav.features}</button>
              <button onClick={() => scrollTo('pricing')} className="px-4 py-1.5 rounded-full text-sm font-semibold text-white/60 hover:text-white hover:bg-white/10 transition-all">{t.nav.pricing}</button>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLang(lang === "en" ? "id" : "en")}
                className="px-3 py-1.5 rounded-full border border-white/10 text-xs font-bold text-white/50 hover:text-white hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all"
              >
                {lang === "en" ? "🇮🇩 ID" : "🇺🇸 EN"}
              </button>
              <Link href="/login">
                <button className="hidden sm:block px-4 py-1.5 text-sm font-semibold text-white/60 hover:text-white transition-colors">{t.nav.login}</button>
              </Link>
              <Link href="/register">
                <button className="px-5 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/30">
                  {t.nav.signup}
                </button>
              </Link>
              <button className="md:hidden text-white/60" onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/5 bg-[#040810] px-5 pb-5 pt-3 flex flex-col gap-3">
              <button onClick={() => scrollTo('how')} className="text-left text-white/60 font-semibold hover:text-white py-2">{t.nav.features}</button>
              <button onClick={() => scrollTo('pricing')} className="text-left text-white/60 font-semibold hover:text-white py-2">{t.nav.pricing}</button>
              <Link href="/login" className="text-white/60 font-semibold hover:text-white py-2">{t.nav.login}</Link>
              <Link href="/register"><button className="w-full py-3 rounded-full bg-emerald-500 text-white font-bold">{t.nav.signup}</button></Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        <GridLines />
        <ParticleField />

        {/* Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-emerald-400/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8 py-24 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Copy */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 text-xs font-bold mb-8 uppercase tracking-widest"
            >
              <Sparkles className="w-3.5 h-3.5" /> {t.badge}
            </motion.div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] mb-6 tracking-tight">
              <span className="text-white/80">{t.hero.line1}</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                {t.hero.line2}
              </span>
            </h1>

            <p className="text-lg text-white/50 max-w-lg mb-10 leading-relaxed">
              {t.hero.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link href="/register">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-black text-base shadow-2xl shadow-emerald-500/30 transition-colors"
                >
                  {t.hero.cta1} <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
              <button onClick={() => scrollTo('how')} className="group flex items-center justify-center gap-3 px-8 py-4 rounded-full border border-white/10 hover:border-white/25 bg-white/3 hover:bg-white/6 text-white/60 hover:text-white font-bold text-base transition-all">
                <div className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                  <Play className="w-3.5 h-3.5 ml-0.5" />
                </div>
                {t.hero.cta2}
              </button>
            </div>

            <div className="flex items-center gap-3 text-white/30 text-sm">
              <Shield className="w-4 h-4 text-emerald-500/60" />
              <span>{t.hero.note}</span>
            </div>

            {/* Trust logos placeholder */}
            <div className="mt-10 flex items-center gap-4 flex-wrap">
              <span className="text-white/20 text-xs font-semibold uppercase tracking-wider">Trusted by teams at</span>
              {["Tokopedia", "Gojek Partners", "UMKM Digital", "iSeller"].map((b, i) => (
                <span key={i} className="text-white/25 text-sm font-bold">{b}</span>
              ))}
            </div>
          </motion.div>

          {/* Right: Mock Dashboard */}
          <motion.div
            initial={{ opacity: 0, x: 60, rotateY: -15 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative flex justify-center lg:justify-end"
            style={{ perspective: "1000px" }}
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              {/* Glow ring behind card */}
              <div className="absolute inset-0 bg-emerald-500/15 rounded-2xl blur-2xl scale-110 -z-10" />
              <MockDashboard />

              {/* Floating badges */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -left-12 top-12 bg-[#0a1520] border border-emerald-500/20 rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-xl"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white/70 text-xs font-bold">AI Active</span>
              </motion.div>

              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -right-10 bottom-16 bg-[#0a1520] border border-emerald-500/20 rounded-xl px-4 py-2.5 shadow-xl"
              >
                <div className="text-emerald-400 font-black text-base">↑ 312%</div>
                <div className="text-white/40 text-[10px]">Conversions</div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto px-5 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {t.stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <div className="text-4xl font-black text-emerald-400 mb-1">{s.num}</div>
              <div className="text-sm text-white/30 font-medium">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="py-32 px-5 scroll-mt-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/3 to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black mb-4">{t.howTitle}</h2>
          </motion.div>

          <div className="relative">
            {/* connecting line */}
            <div className="hidden md:block absolute left-1/2 top-8 bottom-8 w-px bg-gradient-to-b from-emerald-500/30 via-teal-500/20 to-transparent -translate-x-1/2" />

            <div className="space-y-12">
              {t.howSteps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  className={`flex items-center gap-8 ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
                >
                  <div className={`flex-1 ${i % 2 === 1 ? 'md:text-right' : ''} bg-white/3 border border-white/8 rounded-2xl p-8 hover:border-emerald-500/20 transition-colors`}>
                    <div className="text-emerald-500/40 text-sm font-black mb-3 uppercase tracking-widest">{step.step}</div>
                    <h3 className="text-xl font-black mb-3 text-white">{step.title}</h3>
                    <p className="text-white/40 leading-relaxed">{step.desc}</p>
                  </div>
                  <div className="shrink-0 w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <span className="text-emerald-400 font-black text-sm">{step.step}</span>
                  </div>
                  <div className="flex-1 hidden md:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-32 px-5 scroll-mt-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black mb-4">{t.featuresTitle}</h2>
            <p className="text-lg text-white/40 max-w-2xl mx-auto">{t.featuresSubtitle}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {t.features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="relative group p-7 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-emerald-500/25 hover:bg-white/[0.05] transition-all"
              >
                {f.badge && (
                  <span className="absolute top-5 right-5 text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">{f.badge}</span>
                )}
                {/* Icon */}
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5 group-hover:bg-emerald-500/15 transition-colors">
                  <f.icon className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-base font-black mb-2 text-white">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
                {/* Hover glow line */}
                <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-emerald-500/0 to-transparent group-hover:via-emerald-500/40 transition-all duration-500" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-32 px-5 border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/3 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto relative">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="flex items-center justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
              <span className="ml-2 text-white/30 text-sm font-semibold">{t.social.rating}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black">{t.social.title}</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {t.social.items.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-7 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-white/12 transition-colors"
              >
                <div className="flex gap-1 mb-5">
                  {[...Array(item.stars)].map((_, j) => <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-white/60 text-sm leading-relaxed mb-6">"{item.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-black text-sm">
                    {item.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">{item.name}</div>
                    <div className="text-white/30 text-xs">{item.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-32 px-5 scroll-mt-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black mb-4">{t.pricingTitle}</h2>
            <p className="text-lg text-white/40">{t.pricingSubtitle}</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">
            {t.plans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: plan.highlight ? -8 : -4, transition: { duration: 0.2 } }}
                className={`relative flex flex-col rounded-2xl border transition-all ${plan.highlight
                  ? 'bg-gradient-to-b from-emerald-500/10 to-emerald-500/3 border-emerald-500/40 lg:-translate-y-4 shadow-2xl shadow-emerald-500/10'
                  : 'bg-white/[0.03] border-white/8 hover:border-white/15'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-5 py-1 rounded-full text-[11px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/40">
                    {plan.badge}
                  </div>
                )}

                <div className="p-7 flex-1 flex flex-col">
                  <div className="mb-7">
                    <div className="text-sm font-black text-white/50 mb-1 uppercase tracking-wider">{plan.name}</div>
                    <div className="text-xs text-white/30">{plan.desc}</div>
                  </div>

                  <div className="mb-8">
                    {plan.originalPrice && <div className="text-xs text-white/20 line-through mb-1">{plan.originalPrice}</div>}
                    <div className="flex items-baseline gap-1">
                      <span className={`font-black ${plan.price === "Custom" || plan.price === "Kustom" ? "text-3xl text-white" : "text-4xl text-white"}`}>{plan.price}</span>
                      {plan.period && <span className="text-white/30 text-sm">{plan.period}</span>}
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feat, j) => (
                      <li key={j} className="flex items-center gap-2.5 text-sm">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${plan.highlight ? 'bg-emerald-500/20' : 'bg-white/8'}`}>
                          <Check className={`w-2.5 h-2.5 ${plan.highlight ? 'text-emerald-400' : 'text-white/40'}`} />
                        </div>
                        <span className="text-white/50">{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href={plan.href}>
                    <button className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${plan.highlight
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/25'
                      : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/8 hover:border-white/15'
                    }`}>
                      {plan.cta}
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-32 px-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto relative rounded-3xl overflow-hidden"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500" />
          <GridLines />
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-black/10 rounded-full blur-2xl" />

          <div className="relative z-10 text-center py-20 px-8">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-5">{t.ctaBanner.title}</h2>
            <p className="text-emerald-100/80 text-lg mb-10 max-w-lg mx-auto">{t.ctaBanner.subtitle}</p>
            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="px-10 py-4 rounded-full bg-white text-emerald-600 font-black text-lg shadow-2xl shadow-black/20 hover:shadow-black/30 transition-shadow"
              >
                {t.ctaBanner.cta} <ArrowRight className="inline-block ml-2 w-5 h-5" />
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-10 px-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Weaweb" width={28} height={28} className="rounded-lg" />
            <span className="font-black text-white/80">Weaweb</span>
          </Link>
          <p className="text-sm text-white/20">{t.footer}</p>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm text-white/30 hover:text-white transition-colors">{t.nav.login}</Link>
            <Link href="/register" className="text-sm text-white/30 hover:text-white transition-colors">{t.nav.signup}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
