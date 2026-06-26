"use client";

import { useState } from "react";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Check, ChevronRight, Zap, MessageCircle, Bot, Globe, BarChart, Database, ArrowRight, Star, Users, TrendingUp, Shield, Clock, Sparkles, Play, Menu, X } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';

const content = {
  en: {
    nav: { login: "Login", signup: "Sign Up Free", features: "Features", pricing: "Pricing", about: "About" },
    badge: "🚀 Now with GPT-4o & Gemini AI",
    hero: {
      title1: "Automate WhatsApp.",
      title2: "10x Your Business.",
      subtitle: "The most powerful WhatsApp automation platform in Southeast Asia. Send bulk messages, deploy AI chatbots, and manage all your customer conversations — all in one dashboard.",
      cta1: "Start Free Trial",
      cta2: "See How It Works",
      note: "No credit card required · 7-day free trial",
    },
    stats: [
      { num: "10,000+", label: "Active Businesses" },
      { num: "500M+", label: "Messages Sent" },
      { num: "99.9%", label: "Uptime SLA" },
      { num: "24/7", label: "AI Support" },
    ],
    featuresTitle: "Everything you need to dominate WhatsApp",
    featuresSubtitle: "From bulk blasting to AI-powered customer service — we have you covered.",
    features: [
      { icon: Globe, title: "Bulk Broadcasting", desc: "Send personalized messages to 50,000+ contacts in seconds using our Excel import feature. Schedule campaigns effortlessly.", badge: "Most Used" },
      { icon: Bot, title: "AI Chatbot 24/7", desc: "Deploy ChatGPT or Gemini AI to handle customer inquiries automatically. Train on your product data with PDF uploads.", badge: "Trending" },
      { icon: MessageCircle, title: "Team Inbox", desc: "Unified dashboard for your entire team. Assign, reply, and resolve customer chats from multiple WhatsApp numbers.", badge: "" },
      { icon: Zap, title: "Smart Auto-Responder", desc: "Set keyword triggers, schedule away messages, and create complex reply flows without writing a single line of code.", badge: "" },
      { icon: Database, title: "Contact Management", desc: "Organize unlimited contacts with custom labels, groups, and tags. Import via Excel or sync from your CRM.", badge: "" },
      { icon: BarChart, title: "Deep Analytics", desc: "Real-time tracking of delivery rates, read rates, AI chat scores, and campaign performance in beautiful dashboards.", badge: "New" },
    ],
    social: {
      title: "Trusted by thousands of businesses across Indonesia",
      items: [
        { name: "Ahmad Fauzi", role: "Owner, Toko Online Jakarta", stars: 5, text: "After using Weaweb, our sales increased by 3x in just 2 months! The AI chatbot handles 80% of customer inquiries automatically." },
        { name: "Siti Rahayu", role: "Marketing Manager, PT Maju Bersama", stars: 5, text: "We send 10,000 messages with just one click. The campaign scheduler is a game changer for our team." },
        { name: "Budi Santoso", role: "CEO, Startup Teknologi", stars: 5, text: "The best WhatsApp automation tool we've ever used. Simple, powerful, and the support team is incredibly responsive." },
      ]
    },
    pricingTitle: "Simple, Transparent Pricing",
    pricingSubtitle: "Start small, scale big. No hidden fees. Cancel anytime.",
    plans: [
      { name: "Starter", desc: "Perfect for small businesses", price: "Rp 299k", originalPrice: "Rp 399k", features: ["1 WhatsApp Device", "Unlimited Broadcasts", "Basic Auto-Responder", "Contact Management", "Standard Support"], cta: "Get Started", href: "/register?plan=Starter", highlight: false },
      { name: "Business", desc: "Scale your marketing machine", price: "Rp 499k", originalPrice: "Rp 699k", features: ["3 WhatsApp Devices", "Unlimited Broadcasts", "Excel Import Campaigns", "Advanced Auto-Responder", "Priority Support"], cta: "Get Started", href: "/register?plan=Business", highlight: false },
      { name: "AI Automation", desc: "Full autopilot with AI power", price: "Rp 999k", originalPrice: "Rp 1.500k", features: ["5 WhatsApp Devices", "Unlimited Broadcasts", "10,000 AI Messages/mo", "ChatGPT & Gemini AI", "PDF Knowledge Base", "AI Chat Analytics"], cta: "Start Automating", href: "/register?plan=AI Automation", highlight: true, badge: "Most Popular" },
      { name: "Enterprise", desc: "Custom for high-volume teams", price: "Custom", originalPrice: "", features: ["Unlimited Devices", "Unlimited AI Messages", "Dedicated Server", "Custom API Access", "Dedicated Account Manager", "SLA 99.9%"], cta: "Contact Sales", href: "mailto:admin@weaweb.com", highlight: false },
    ],
    ctaBanner: {
      title: "Ready to automate your WhatsApp?",
      subtitle: "Join 10,000+ businesses already growing with Weaweb.",
      cta: "Start Your Free Trial Now",
    },
    footer: "© 2026 Weaweb. Built with ❤️ for Indonesian businesses.",
  },
  id: {
    nav: { login: "Masuk", signup: "Daftar Gratis", features: "Fitur", pricing: "Harga", about: "Tentang" },
    badge: "🚀 Kini dengan AI GPT-4o & Gemini",
    hero: {
      title1: "Otomatiskan WhatsApp.",
      title2: "Bisnis 10x Lebih Cepat.",
      subtitle: "Platform otomasi WhatsApp paling canggih di Asia Tenggara. Kirim pesan massal, pasang AI chatbot, dan kelola semua chat pelanggan — dalam satu dashboard.",
      cta1: "Coba Gratis Sekarang",
      cta2: "Lihat Cara Kerjanya",
      note: "Tanpa kartu kredit · Gratis 7 hari",
    },
    stats: [
      { num: "10.000+", label: "Bisnis Aktif" },
      { num: "500 Juta+", label: "Pesan Terkirim" },
      { num: "99,9%", label: "Uptime SLA" },
      { num: "24/7", label: "Dukungan AI" },
    ],
    featuresTitle: "Semua yang kamu butuhkan untuk menguasai WhatsApp",
    featuresSubtitle: "Dari broadcast massal hingga layanan pelanggan berbasis AI — kami siapkan segalanya.",
    features: [
      { icon: Globe, title: "Broadcast Massal", desc: "Kirim pesan personal ke 50.000+ kontak dalam hitungan detik menggunakan fitur import Excel. Jadwalkan kampanye dengan mudah.", badge: "Paling Populer" },
      { icon: Bot, title: "AI Chatbot 24/7", desc: "Pasang AI ChatGPT atau Gemini untuk menangani pertanyaan pelanggan secara otomatis. Latih dengan data produk dari file PDF.", badge: "Trending" },
      { icon: MessageCircle, title: "Inbox Tim Terpadu", desc: "Dashboard bersama untuk seluruh tim. Assign, balas, dan selesaikan chat pelanggan dari berbagai nomor WhatsApp.", badge: "" },
      { icon: Zap, title: "Auto-Responder Cerdas", desc: "Atur trigger kata kunci, jadwalkan pesan otomatis, dan buat alur balasan kompleks tanpa menulis kode sama sekali.", badge: "" },
      { icon: Database, title: "Manajemen Kontak", desc: "Kelola kontak tak terbatas dengan label, grup, dan tag kustom. Import via Excel atau sinkronkan dari CRM Anda.", badge: "" },
      { icon: BarChart, title: "Analitik Mendalam", desc: "Pantau tingkat pengiriman, baca, skor AI chat, dan kinerja kampanye secara real-time di dashboard yang indah.", badge: "Baru" },
    ],
    social: {
      title: "Dipercaya ribuan bisnis di seluruh Indonesia",
      items: [
        { name: "Ahmad Fauzi", role: "Pemilik, Toko Online Jakarta", stars: 5, text: "Setelah pakai Weaweb, penjualan kami naik 3x hanya dalam 2 bulan! AI chatbot menangani 80% pertanyaan pelanggan secara otomatis." },
        { name: "Siti Rahayu", role: "Marketing Manager, PT Maju Bersama", stars: 5, text: "Kami kirim 10.000 pesan hanya dengan satu klik. Fitur scheduler kampanye benar-benar mengubah cara kerja tim kami." },
        { name: "Budi Santoso", role: "CEO, Startup Teknologi", stars: 5, text: "Tool otomasi WhatsApp terbaik yang pernah kami gunakan. Simpel, powerful, dan tim supportnya luar biasa responsif." },
      ]
    },
    pricingTitle: "Harga Sederhana & Transparan",
    pricingSubtitle: "Mulai kecil, berkembang besar. Tanpa biaya tersembunyi. Bisa batal kapan saja.",
    plans: [
      { name: "Starter", desc: "Cocok untuk bisnis kecil", price: "Rp 299k", originalPrice: "Rp 399k", features: ["1 Perangkat WhatsApp", "Broadcast Tak Terbatas", "Auto-Responder Dasar", "Manajemen Kontak", "Dukungan Standar"], cta: "Mulai Sekarang", href: "/register?plan=Starter", highlight: false },
      { name: "Business", desc: "Skalakan mesin marketing Anda", price: "Rp 499k", originalPrice: "Rp 699k", features: ["3 Perangkat WhatsApp", "Broadcast Tak Terbatas", "Import Kampanye Excel", "Auto-Responder Lanjutan", "Dukungan Prioritas"], cta: "Mulai Sekarang", href: "/register?plan=Business", highlight: false },
      { name: "AI Automation", desc: "Autopilot penuh dengan kekuatan AI", price: "Rp 999k", originalPrice: "Rp 1.500k", features: ["5 Perangkat WhatsApp", "Broadcast Tak Terbatas", "10.000 Pesan AI/bln", "ChatGPT & Gemini AI", "Knowledge Base PDF", "Analitik AI Chat"], cta: "Mulai Automasi", href: "/register?plan=AI Automation", highlight: true, badge: "Paling Populer" },
      { name: "Enterprise", desc: "Kustom untuk tim volume tinggi", price: "Kustom", originalPrice: "", features: ["Perangkat Tak Terbatas", "Pesan AI Tak Terbatas", "Server Dedicated", "Akses API Kustom", "Account Manager Khusus", "SLA 99,9%"], cta: "Hubungi Sales", href: "mailto:admin@weaweb.com", highlight: false },
    ],
    ctaBanner: {
      title: "Siap otomatiskan WhatsApp bisnis Anda?",
      subtitle: "Bergabung dengan 10.000+ bisnis yang sudah berkembang bersama Weaweb.",
      cta: "Mulai Uji Coba Gratis Sekarang",
    },
    footer: "© 2026 Weaweb. Dibuat dengan ❤️ untuk bisnis Indonesia.",
  }
};

export default function Home() {
  const [lang, setLang] = useState<"en" | "id">("id");
  const [menuOpen, setMenuOpen] = useState(false);
  const t = content[lang];

  const scrollToPricing = () => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  const scrollToFeatures = () => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-50 selection:bg-primary/20 overflow-x-hidden font-sans">

      {/* ── NAV ── */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-emerald-400 rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight">Weaweb</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600 dark:text-slate-400">
              <button onClick={scrollToFeatures} className="hover:text-primary transition-colors">{t.nav.features}</button>
              <button onClick={scrollToPricing} className="hover:text-primary transition-colors">{t.nav.pricing}</button>
            </div>

            <div className="flex items-center gap-2">
              {/* Language Toggle */}
              <button
                onClick={() => setLang(lang === "en" ? "id" : "en")}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-primary/10 hover:border-primary/50 transition-all text-slate-600 dark:text-slate-300"
              >
                {lang === "en" ? "🇮🇩 ID" : "🇺🇸 EN"}
              </button>
              <ThemeToggle />
              <Link href="/login">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-slate-600 dark:text-slate-300 font-semibold">
                  {t.nav.login}
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-white rounded-full px-5 shadow-lg shadow-primary/25 font-bold transition-all hover:-translate-y-0.5">
                  {t.nav.signup}
                </Button>
              </Link>
              {/* Mobile Hamburger */}
              <button className="md:hidden ml-1" onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pb-4 flex flex-col gap-3 pt-3"
            >
              <button onClick={() => { scrollToFeatures(); setMenuOpen(false); }} className="text-left text-sm font-semibold hover:text-primary">{t.nav.features}</button>
              <button onClick={() => { scrollToPricing(); setMenuOpen(false); }} className="text-left text-sm font-semibold hover:text-primary">{t.nav.pricing}</button>
              <Link href="/login" className="text-sm font-semibold hover:text-primary">{t.nav.login}</Link>
              <Link href="/register">
                <Button size="sm" className="w-full bg-primary text-white rounded-full font-bold">{t.nav.signup}</Button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-36 pb-20 md:pt-52 md:pb-32 px-4 relative overflow-hidden">
        {/* Animated BG */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:30px_30px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_60%,transparent_100%)] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)]" />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-emerald-400/10 blur-[100px] pointer-events-none"
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-5xl mx-auto text-center relative z-10"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mb-8"
          >
            <Sparkles className="w-4 h-4" /> {t.badge}
          </motion.div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 leading-[1.05]">
            {t.hero.title1} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-teal-400">
              {t.hero.title2}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t.hero.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white rounded-full px-10 h-14 text-lg font-bold shadow-[0_0_50px_rgba(16,185,129,0.35)] hover:shadow-[0_0_70px_rgba(16,185,129,0.5)] transition-all hover:-translate-y-1 gap-2">
                {t.hero.cta1} <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <button onClick={scrollToFeatures} className="group flex items-center gap-2 text-slate-600 dark:text-slate-300 font-semibold hover:text-primary transition-colors">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <Play className="w-4 h-4 ml-0.5" />
              </div>
              {t.hero.cta2}
            </button>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-500 font-medium">{t.hero.note}</p>
        </motion.div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
        <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {t.stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-3xl md:text-4xl font-black text-primary mb-1">{s.num}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-28 px-4 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-black mb-4">{t.featuresTitle}</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto">{t.featuresSubtitle}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="relative p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all"
              >
                {f.badge && (
                  <span className="absolute top-5 right-5 text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{f.badge}</span>
                )}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-emerald-400/10 flex items-center justify-center mb-5 border border-primary/10">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF / TESTIMONIALS ── */}
      <section className="py-24 px-4 bg-white dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <div className="flex items-center justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
              <span className="ml-2 text-sm font-bold text-slate-600 dark:text-slate-400">4.9/5 dari 2,000+ ulasan</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black">{t.social.title}</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {t.social.items.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(item.stars)].map((_, j) => <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-5">"{item.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-white font-bold text-sm">
                    {item.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-sm">{item.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{item.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-28 px-4 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-black mb-4">{t.pricingTitle}</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">{t.pricingSubtitle}</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            {t.plans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: plan.highlight ? -8 : -4, transition: { duration: 0.2 } }}
                className={`relative flex flex-col p-7 rounded-3xl border-2 transition-all ${
                  plan.highlight
                    ? "bg-slate-900 dark:bg-slate-800 border-primary shadow-2xl shadow-primary/25 lg:-translate-y-4"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-primary/30 hover:shadow-lg"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-5 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/40">
                    {plan.badge}
                  </div>
                )}
                <div className="mb-6">
                  <h3 className={`text-xl font-black mb-1 ${plan.highlight ? "text-white" : ""}`}>{plan.name}</h3>
                  <p className={`text-sm ${plan.highlight ? "text-slate-400" : "text-slate-500 dark:text-slate-400"}`}>{plan.desc}</p>
                </div>
                <div className="mb-7">
                  {plan.originalPrice && <span className={`text-sm line-through ${plan.highlight ? "text-slate-500" : "text-slate-400"}`}>{plan.originalPrice}</span>}
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className={`text-4xl font-black ${plan.highlight ? "text-white" : ""}`}>{plan.price}</span>
                    {plan.price !== "Custom" && plan.price !== "Kustom" && <span className={`text-sm ${plan.highlight ? "text-slate-400" : "text-slate-500 dark:text-slate-400"}`}>/mo</span>}
                  </div>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${plan.highlight ? "bg-primary/20" : "bg-primary/10"}`}>
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className={plan.highlight ? "text-slate-300" : "text-slate-700 dark:text-slate-300"}>{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} className="w-full">
                  {plan.highlight ? (
                    <Button className="w-full rounded-full bg-primary hover:bg-primary/90 text-white font-bold h-12 shadow-lg shadow-primary/30 text-base">
                      {plan.cta} <ArrowRight className="ml-1 w-4 h-4" />
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full rounded-full border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold h-12">
                      {plan.cta}
                    </Button>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-24 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto bg-gradient-to-br from-primary via-emerald-500 to-teal-500 rounded-3xl p-12 text-center relative overflow-hidden shadow-2xl shadow-primary/30"
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:30px_30px]" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">{t.ctaBanner.title}</h2>
            <p className="text-emerald-100 text-lg mb-8">{t.ctaBanner.subtitle}</p>
            <Link href="/register">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 rounded-full px-10 h-14 text-lg font-black shadow-xl transition-all hover:-translate-y-1 gap-2">
                {t.ctaBanner.cta} <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-7 h-7 bg-gradient-to-br from-primary to-emerald-400 rounded-lg flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <span className="font-black">Weaweb</span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-500">{t.footer}</p>
      </footer>
    </div>
  );
}
