"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import Logo from '@/components/Logo';
import { Check, Zap, MessageCircle, Bot, Globe, BarChart, Database, ArrowRight, Star, Shield, Clock, Sparkles, Play, Menu, X, Users, Cpu, Lock, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ── CONTENT ──────────────────────────────────────────────────────────────────
const content = {
  en: {
    nav: { login: "Sign In", signup: "Get Started Free", features: "Features", pricing: "Pricing" },
    badge: "AI-Powered WhatsApp Platform",
    hero: {
      line1: "The Smartest Way to",
      line2: "Scale WhatsApp.",
      subtitle: "Send millions of messages, deploy AI agents, and manage every customer conversation — all from one powerful dashboard. Trusted by 10,000+ businesses.",
      cta1: "Start Free — No Card Needed",
      cta2: "Watch Demo",
      note: "Free 3-day trial · Cancel anytime",
    },
    stats: [
      { num: "10K+", label: "Active Businesses" },
      { num: "500M+", label: "Messages Delivered" },
      { num: "99.9%", label: "Uptime SLA" },
      { num: "< 2s", label: "Avg. Response" },
    ],
    howPreTitle: "Start in 3 steps",
    howTitle: "How Weaweb Works",
    howSteps: [
      { step: "01", title: "Connect Your WhatsApp", desc: "Scan QR or plug in official WhatsApp Business API token. Running in under 3 minutes." },
      { step: "02", title: "Import & Segment Contacts", desc: "Upload Excel or sync from your CRM. Tag, label, and group contacts however you need." },
      { step: "03", title: "Launch Campaigns & AI", desc: "Schedule bulk broadcasts or activate AI chatbot. Sit back and watch results roll in." },
    ],
    featuresPreTitle: "Complete platform",
    featuresTitle: "Built for businesses that move fast",
    featuresSubtitle: "Every tool you need to turn WhatsApp into your highest-converting sales channel.",
    features: [
      { icon: Globe, title: "Bulk Broadcasting", desc: "Send personalized messages to 50,000+ contacts in one click. Excel import, schedule, and track real-time.", badge: "Most Used" },
      { icon: Bot, title: "AI Chatbot Engine", desc: "Deploy GPT-4o or Gemini AI trained on your product PDFs. Handles FAQs, orders, and support — 24/7.", badge: "🔥 Hot" },
      { icon: MessageCircle, title: "Shared Team Inbox", desc: "Every agent handles conversations from one unified view. Assign, label, resolve — lightning fast.", badge: "" },
      { icon: Zap, title: "Smart Auto-Responders", desc: "Keyword triggers, welcome flows, away messages, and drip sequences — visual builder, zero code.", badge: "" },
      { icon: Database, title: "Contact Management", desc: "Unlimited contacts. Rich custom fields, segments, and tags. Import via Excel or webhook sync.", badge: "" },
      { icon: BarChart, title: "Analytics Dashboard", desc: "Live delivery rates, AI chat scores, agent performance, and campaign ROI. Export to CSV.", badge: "New" },
    ],
    social: {
      title: "Loved by businesses worldwide",
      rating: "4.9/5 from 2,000+ verified reviews",
      items: [
        { name: "Ahmad Fauzi", role: "Owner · Toko Online Jakarta", stars: 5, text: "Revenue jumped 3x in 2 months. The AI chatbot now handles 80% of inquiries without any human touching it." },
        { name: "Siti Rahayu", role: "Marketing Manager · PT Maju Bersama", stars: 5, text: "We blast 10,000 messages with one click. The campaign scheduler completely changed how our team operates." },
        { name: "Budi Santoso", role: "CEO · SaaS Startup", stars: 5, text: "Best WhatsApp tool we've ever used — period. Clean, fast, and the support team actually replies within minutes." },
        { name: "Rina Wati", role: "Owner · Butik Fashion Surabaya", stars: 5, text: "The AI knows our catalog perfectly. Customers get instant answers 24/7 even while we sleep." },
        { name: "Hendra K.", role: "Digital Agency · Bandung", stars: 5, text: "Managing 10 client WhatsApps from one dashboard is a game changer. Highly recommended!" },
        { name: "Maya S.", role: "E-Commerce · Tokopedia Seller", stars: 5, text: "Order confirmation automation saved us 4 hours a day. Our team can focus on growing the business now." },
        { name: "Reza Pratama", role: "Founder · Dental Clinic", stars: 5, text: "The automated reservation system via WhatsApp is incredible. Patients no longer need to wait on calls." },
        { name: "Dina Marlina", role: "Sales Director · Real Estate", stars: 4, text: "Broadcasting to VIP prospects is so easy. Our sales conversion rate went up by 40% thanks to this feature." },
        { name: "Kevin Wijaya", role: "Customer Success · Fintech", stars: 5, text: "The shared inbox is a lifesaver for our CS team. No more missed customer messages." },
        { name: "Putri Amanda", role: "Owner · Bakery & Cafe", stars: 5, text: "Automated order notifications run 24/7. Weaweb is truly like having an extra admin who never sleeps." },
      ]
    },
    pricingTitle: "Simple, transparent pricing",
    pricingSubtitle: "No hidden fees. No long-term contracts. Start free — upgrade when you're ready.",
    plans: [
      { name: "Free Trial", desc: "Try it risk-free", price: "Rp 0", originalPrice: "", period: "/3 days", features: ["1 WhatsApp Device", "100 Broadcasts", "Basic Auto-Responder", "Contact Management", "Community Support"], cta: "Start Free Trial", href: "/register?plan=Free+Trial", highlight: false, badge: "No Card", color: "emerald" },
      { name: "Starter", desc: "Perfect for small teams", price: "Rp 299k", originalPrice: "Rp 399k", period: "/mo", features: ["1 WhatsApp Device", "Unlimited Broadcasts", "Basic Auto-Responder", "Contact Management", "Email Support"], cta: "Get Started", href: "/register?plan=Starter", highlight: false, badge: "", color: "blue" },
      { name: "Business", desc: "For scaling marketing teams", price: "Rp 499k", originalPrice: "Rp 699k", period: "/mo", features: ["3 WhatsApp Devices", "Unlimited Broadcasts", "Excel Import Campaigns", "Advanced Auto-Responder", "Priority Support"], cta: "Get Started", href: "/register?plan=Business", highlight: false, badge: "", color: "purple" },
      { name: "AI Automation", desc: "Full AI autopilot mode", price: "Rp 999k", originalPrice: "Rp 1.500k", period: "/mo", features: ["5 WhatsApp Devices", "Unlimited Broadcasts", "10,000 AI Messages/mo", "ChatGPT & Gemini AI", "PDF Knowledge Base", "AI Chat Analytics"], cta: "Start Automating", href: "/register?plan=AI+Automation", highlight: true, badge: "Most Popular", color: "emerald" },
      { name: "Enterprise", desc: "For high-volume operations", price: "Custom", originalPrice: "", period: "", features: ["Unlimited Devices", "Unlimited AI Messages", "Dedicated Server", "Custom API Access", "Account Manager", "SLA 99.9%"], cta: "Talk to Sales", href: "mailto:admin@weaweb.com", highlight: false, badge: "", color: "amber" },
    ],
    ctaBanner: { title: "Ready to put WhatsApp on autopilot?", subtitle: "Join 10,000+ businesses already growing with Weaweb. Start your free trial today.", cta: "Start Free Trial" },
    footer: "© 2026 Weaweb · Built with ❤️ for businesses worldwide",
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
      note: "Coba gratis 3 hari · Batal kapan saja",
    },
    stats: [
      { num: "10RB+", label: "Bisnis Aktif" },
      { num: "500JT+", label: "Pesan Terkirim" },
      { num: "99,9%", label: "Uptime SLA" },
      { num: "< 2dtk", label: "Waktu Respons" },
    ],
    howPreTitle: "Mulai dalam 3 langkah",
    howTitle: "Cara Kerja Weaweb",
    howSteps: [
      { step: "01", title: "Hubungkan WhatsApp Anda", desc: "Scan QR code atau masukkan token WhatsApp Business API. Langsung jalan dalam kurang dari 3 menit." },
      { step: "02", title: "Import & Segmentasi Kontak", desc: "Upload file Excel atau sync dari CRM Anda. Beri tag, label, dan kelompokkan sesuai kebutuhan." },
      { step: "03", title: "Jalankan Kampanye & AI", desc: "Jadwalkan broadcast massal atau aktifkan chatbot AI. Tinggal santai dan lihat hasilnya mengalir." },
    ],
    featuresPreTitle: "Platform lengkap",
    featuresTitle: "Dibangun untuk bisnis yang bergerak cepat",
    featuresSubtitle: "Semua alat yang Anda butuhkan untuk mengubah WhatsApp menjadi channel penjualan terbaik.",
    features: [
      { icon: Globe, title: "Broadcast Massal", desc: "Kirim pesan personal ke 50.000+ kontak dalam satu klik. Import Excel, jadwalkan, pantau real-time.", badge: "Paling Populer" },
      { icon: Bot, title: "Mesin Chatbot AI", desc: "Pasang AI GPT-4o atau Gemini dilatih dari PDF produk Anda. Menangani FAQ, pesanan, support 24/7.", badge: "🔥 Trending" },
      { icon: MessageCircle, title: "Inbox Tim Terpadu", desc: "Setiap agen tim menangani percakapan dari satu tampilan terpusat. Assign, label, selesaikan cepat.", badge: "" },
      { icon: Zap, title: "Auto-Responder Cerdas", desc: "Trigger kata kunci, welcome flow, pesan away, drip sequence — dibuat visual, tanpa coding.", badge: "" },
      { icon: Database, title: "Manajemen Kontak", desc: "Kontak tak terbatas. Field kustom, segmen, dan tag yang kaya. Import Excel atau sync webhook.", badge: "" },
      { icon: BarChart, title: "Dashboard Analitik", desc: "Tingkat pengiriman live, skor AI chat, performa agen, dan ROI kampanye. Export ke CSV.", badge: "Baru" },
    ],
    social: {
      title: "Dicintai bisnis di seluruh dunia",
      rating: "4,9/5 dari 2.000+ ulasan terverifikasi",
      items: [
        { name: "Ahmad Fauzi", role: "Pemilik · Toko Online Jakarta", stars: 5, text: "Revenue naik 3x dalam 2 bulan. Chatbot AI sekarang menangani 80% pertanyaan tanpa sentuhan manusia." },
        { name: "Siti Rahayu", role: "Marketing Manager · PT Maju Bersama", stars: 5, text: "Kami blast 10.000 pesan dengan satu klik. Campaign scheduler benar-benar mengubah cara kerja tim kami." },
        { name: "Budi Santoso", role: "CEO · Startup SaaS", stars: 5, text: "Tool WhatsApp terbaik yang pernah kami gunakan — titik. Bersih, cepat, support balas dalam menit." },
        { name: "Rina Wati", role: "Pemilik · Butik Fashion Surabaya", stars: 5, text: "AI-nya tahu katalog kami dengan sempurna. Pelanggan dapat jawaban instan 24/7 meski kami tidur." },
        { name: "Hendra K.", role: "Digital Agency · Bandung", stars: 5, text: "Kelola 10 WhatsApp klien dari satu dashboard adalah game changer. Sangat direkomendasikan!" },
        { name: "Maya S.", role: "E-Commerce · Penjual Tokopedia", stars: 5, text: "Otomasi konfirmasi pesanan hemat 4 jam per hari. Tim kami bisa fokus mengembangkan bisnis." },
        { name: "Reza Pratama", role: "Founder · Klinik Gigi Senyum", stars: 5, text: "Sistem reservasi otomatis via WhatsApp ini luar biasa. Pasien tidak perlu antre telepon lagi." },
        { name: "Dina Marlina", role: "Sales Director · Properti Real Estate", stars: 4, text: "Broadcast ke prospek VIP sangat mudah. Tingkat konversi penjualan kami naik 40% berkat fitur ini." },
        { name: "Kevin Wijaya", role: "Customer Success · Fintech", stars: 5, text: "Inbox terpadu sangat membantu tim CS kami. Tidak ada lagi pesan pelanggan yang terlewat." },
        { name: "Putri Amanda", role: "Owner · Bakery & Cafe", stars: 5, text: "Notifikasi orderan otomatis jalan 24 jam. Weaweb benar-benar seperti punya admin tambahan yang tak pernah tidur." },
      ]
    },
    pricingTitle: "Harga yang jelas & transparan",
    pricingSubtitle: "Tanpa biaya tersembunyi. Tanpa kontrak jangka panjang. Mulai gratis — upgrade saat siap.",
    plans: [
      { name: "Free Trial", desc: "Coba tanpa risiko", price: "Rp 0", originalPrice: "", period: "/3 hari", features: ["1 Perangkat WhatsApp", "100 Broadcast", "Auto-Responder Dasar", "Manajemen Kontak", "Dukungan Komunitas"], cta: "Mulai Coba Gratis", href: "/register?plan=Free+Trial", highlight: false, badge: "Tanpa Kartu", color: "emerald" },
      { name: "Starter", desc: "Cocok untuk tim kecil", price: "Rp 299k", originalPrice: "Rp 399k", period: "/bln", features: ["1 Perangkat WhatsApp", "Broadcast Tak Terbatas", "Auto-Responder Dasar", "Manajemen Kontak", "Dukungan Email"], cta: "Mulai Sekarang", href: "/register?plan=Starter", highlight: false, badge: "", color: "blue" },
      { name: "Business", desc: "Untuk tim marketing berkembang", price: "Rp 499k", originalPrice: "Rp 699k", period: "/bln", features: ["3 Perangkat WhatsApp", "Broadcast Tak Terbatas", "Kampanye Import Excel", "Auto-Responder Lanjutan", "Dukungan Prioritas"], cta: "Mulai Sekarang", href: "/register?plan=Business", highlight: false, badge: "", color: "purple" },
      { name: "AI Automation", desc: "Autopilot penuh dengan AI", price: "Rp 999k", originalPrice: "Rp 1.500k", period: "/bln", features: ["5 Perangkat WhatsApp", "Broadcast Tak Terbatas", "10.000 Pesan AI/bln", "ChatGPT & Gemini AI", "Knowledge Base PDF", "Analitik AI Chat"], cta: "Mulai Automasi", href: "/register?plan=AI+Automation", highlight: true, badge: "Paling Populer", color: "emerald" },
      { name: "Enterprise", desc: "Untuk operasi volume tinggi", price: "Kustom", originalPrice: "", period: "", features: ["Perangkat Tak Terbatas", "Pesan AI Tak Terbatas", "Server Dedicated", "Akses API Kustom", "Account Manager", "SLA 99,9%"], cta: "Hubungi Sales", href: "mailto:admin@weaweb.com", highlight: false, badge: "", color: "amber" },
    ],
    ctaBanner: { title: "Siap pasang WhatsApp pada mode autopilot?", subtitle: "Bergabung dengan 10.000+ bisnis yang sudah tumbuh bersama Weaweb. Mulai uji coba gratis hari ini.", cta: "Mulai Coba Gratis" },
    footer: "© 2026 Weaweb · Dibuat dengan ❤️ untuk bisnis di seluruh dunia",
  }
};

// ── COMPONENTS ────────────────────────────────────────────────────────────────

function GridLines() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity: 0.035 }}>
      <div className="w-full h-full" style={{
        backgroundImage: `linear-gradient(to right, #10b981 1px, transparent 1px), linear-gradient(to bottom, #10b981 1px, transparent 1px)`,
        backgroundSize: '80px 80px'
      }} />
    </div>
  );
}

function ParticleField() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(70)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: Math.random() > 0.7 ? '2px' : '1px',
            height: Math.random() > 0.7 ? '2px' : '1px',
            background: `hsl(${160 + Math.random() * 30}, 80%, 60%)`,
          }}
          animate={{ opacity: [0, 0.8, 0], scale: [0, 1.5, 0] }}
          transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 6, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// Animated number ticker
function Ticker({ value }: { value: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300"
    >
      {value}
    </motion.span>
  )
}

// Live mock dashboard for hero
function MockDashboard() {
  const msgs = [
    { name: "Andi S.", msg: "Halo, ada promo hari ini?", time: "09:41", unread: true, color: "from-emerald-400 to-teal-500" },
    { name: "Dewi R.", msg: "Pesanan sudah diterima, terima kasih!", time: "09:38", unread: false, color: "from-blue-400 to-cyan-500" },
    { name: "Budi M.", msg: "Kapan barangnya sampai kak?", time: "09:35", unread: true, color: "from-purple-400 to-pink-500" },
    { name: "Rina W.", msg: "Bisa custom ukuran tidak?", time: "09:30", unread: false, color: "from-amber-400 to-orange-500" },
  ];
  return (
    <div className="relative w-full max-w-[360px] rounded-2xl border border-white/10 bg-[#070d1a]/90 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/60 text-xs">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-gradient-to-r from-emerald-500/5 to-teal-500/5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white/50 font-bold text-[10px] uppercase tracking-widest">AI Inbox · Live</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 font-black text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">2 unread</span>
        </div>
      </div>

      {/* Messages */}
      {msgs.map((m, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 + i * 0.15 }}
          className={`flex items-center gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/2 transition-colors ${m.unread ? 'bg-emerald-500/3' : ''}`}
        >
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${m.color} flex items-center justify-center font-bold text-[10px] text-white shrink-0`}>
            {m.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-0.5">
              <span className="font-black text-white/80 text-[11px]">{m.name}</span>
              <span className="text-white/25 text-[9px]">{m.time}</span>
            </div>
            <span className="text-white/35 text-[10px] truncate block">{m.msg}</span>
          </div>
          {m.unread && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />}
        </motion.div>
      ))}

      {/* AI reply bar */}
      <div className="px-4 py-3 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border-t border-emerald-500/10">
        <div className="flex items-center gap-2">
          <Bot className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <motion.span
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-emerald-400 text-[10px] font-mono"
          >
            AI membalas Andi S. secara otomatis...
          </motion.span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 divide-x divide-white/5">
        {[["1,247", "Sent"], ["98.2%", "Delivered"], ["43%", "Read"]].map(([val, lab], i) => (
          <div key={i} className="px-3 py-2.5 text-center">
            <div className="font-black text-white/80 text-sm">{val}</div>
            <div className="text-white/25 text-[9px] uppercase tracking-wider">{lab}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Marquee testimonial strip
function TestimonialMarquee({ items }: { items: any[] }) {
  return (
    <div className="overflow-hidden relative">
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#040810] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#040810] to-transparent z-10 pointer-events-none" />
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="flex gap-5 w-max"
      >
        {[...items, ...items].map((item, i) => (
          <div key={i} className="w-72 shrink-0 p-5 rounded-2xl bg-white/[0.03] border border-white/8">
            <div className="flex gap-0.5 mb-3">
              {[...Array(item.stars)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
            </div>
            <p className="text-white/55 text-xs leading-relaxed mb-4">"{item.text}"</p>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-black text-[10px] shrink-0">
                {item.name[0]}
              </div>
              <div>
                <div className="font-bold text-xs text-white/70">{item.name}</div>
                <div className="text-white/25 text-[10px]">{item.role}</div>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

const planColorMap: Record<string, { border: string; badge: string; btn: string; glow: string }> = {
  emerald: {
    border: "border-emerald-500/30 hover:border-emerald-500",
    badge: "bg-emerald-500 text-white",
    btn: "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20",
    glow: "bg-emerald-500/5",
  },
  blue: {
    border: "border-blue-500/20 hover:border-blue-500/60",
    badge: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    btn: "bg-white/5 hover:bg-blue-500/10 text-white/60 hover:text-white border border-white/8 hover:border-blue-500/30",
    glow: "bg-blue-500/3",
  },
  purple: {
    border: "border-purple-500/20 hover:border-purple-500/60",
    badge: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
    btn: "bg-white/5 hover:bg-purple-500/10 text-white/60 hover:text-white border border-white/8 hover:border-purple-500/30",
    glow: "bg-purple-500/3",
  },
  amber: {
    border: "border-amber-500/20 hover:border-amber-500/60",
    badge: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    btn: "bg-white/5 hover:bg-amber-500/10 text-white/60 hover:text-white border border-white/8 hover:border-amber-500/30",
    glow: "bg-amber-500/3",
  },
};

function BannerParticles() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <>
      {[...Array(15)].map((_, i) => (
        <motion.div key={i} className="absolute w-1 h-1 bg-white/30 rounded-full"
          style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
          transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 4 }} />
      ))}
    </>
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
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#040810]/90 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo with gradient */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-400 blur-md opacity-40 group-hover:opacity-70 transition-opacity" />
                <Logo size={36} className="relative group-hover:scale-105 transition-transform" />
              </div>
              <span className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                Weaweb
              </span>
            </Link>

            {/* Center nav */}
            <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-full px-2 py-1 border border-white/8">
              <button onClick={() => scrollTo('features')} className="px-4 py-1.5 rounded-full text-sm font-semibold text-white/60 hover:text-white hover:bg-white/10 transition-all">{t.nav.features}</button>
              <button onClick={() => scrollTo('pricing')} className="px-4 py-1.5 rounded-full text-sm font-semibold text-white/60 hover:text-white hover:bg-white/10 transition-all">{t.nav.pricing}</button>
              <button onClick={() => scrollTo('testimonials')} className="px-4 py-1.5 rounded-full text-sm font-semibold text-white/60 hover:text-white hover:bg-white/10 transition-all">Review</button>
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
                <button className="px-5 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-sm font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/30">
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
              <button onClick={() => scrollTo('features')} className="text-left text-white/60 font-semibold hover:text-white py-2">{t.nav.features}</button>
              <button onClick={() => scrollTo('pricing')} className="text-left text-white/60 font-semibold hover:text-white py-2">{t.nav.pricing}</button>
              <Link href="/login" className="text-white/60 font-semibold hover:text-white py-2">{t.nav.login}</Link>
              <Link href="/register"><button className="w-full py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold">{t.nav.signup}</button></Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        <GridLines />
        <ParticleField />
        {/* Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-emerald-500/7 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-cyan-400/4 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8 py-20 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left copy */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 text-xs font-bold mb-8 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" /> {t.badge}
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] mb-6 tracking-tight">
              <span className="text-white/80">{t.hero.line1}</span><br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                {t.hero.line2}
              </span>
            </h1>

            <p className="text-lg text-white/45 max-w-lg mb-10 leading-relaxed">{t.hero.subtitle}</p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link href="/register">
                <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-base shadow-2xl shadow-emerald-500/30 transition-all">
                  {t.hero.cta1} <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
              <button onClick={() => scrollTo('how')}
                className="group flex items-center justify-center gap-3 px-8 py-4 rounded-full border border-white/10 hover:border-white/25 bg-white/3 hover:bg-white/6 text-white/60 hover:text-white font-bold text-base transition-all">
                <div className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                  <Play className="w-3.5 h-3.5 ml-0.5" />
                </div>
                {t.hero.cta2}
              </button>
            </div>

            <div className="flex items-center gap-3 text-white/30 text-sm mb-10">
              <Shield className="w-4 h-4 text-emerald-500/60" />
              <span>{t.hero.note}</span>
            </div>

            {/* Social proof avatars */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {["from-emerald-400 to-teal-500", "from-blue-400 to-cyan-500", "from-purple-400 to-pink-500", "from-amber-400 to-orange-500", "from-rose-400 to-red-500"].map((g, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full bg-gradient-to-br ${g} border-2 border-[#040810] flex items-center justify-center text-white text-[10px] font-black`}>
                    {["A", "S", "B", "R", "H"][i]}
                  </div>
                ))}
              </div>
              <div className="text-xs text-white/35">
                <span className="text-white/60 font-bold">10.000+ bisnis</span> sudah bergabung
              </div>
            </div>
          </motion.div>

          {/* Right: Mock Dashboard */}
          <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.3 }}
            className="relative flex justify-center lg:justify-end mt-10 lg:mt-0">
            <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="relative w-full max-w-[320px] sm:max-w-none flex justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 rounded-2xl blur-2xl scale-110 -z-10" />
              <MockDashboard />
              {/* Floating badge 1 */}
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -left-4 sm:-left-12 top-6 sm:top-10 bg-[#0a1520] border border-emerald-500/20 rounded-xl px-3 py-2 flex items-center gap-2 shadow-xl backdrop-blur-sm z-20">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white/70 text-xs font-bold">AI Active</span>
              </motion.div>
              {/* Floating badge 2 */}
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -right-2 sm:-right-12 bottom-16 sm:bottom-20 bg-[#0a1520] border border-teal-500/20 rounded-xl px-3 py-2 shadow-xl backdrop-blur-sm hidden sm:block z-20">
                <div className="text-emerald-400 font-black text-base">↑ 312%</div>
                <div className="text-white/35 text-[10px]">Conversions</div>
              </motion.div>
              {/* Floating badge 3 */}
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                className="absolute -left-2 sm:-left-10 bottom-6 sm:bottom-10 bg-[#0a1520] border border-purple-500/20 rounded-xl px-3 py-2 shadow-xl backdrop-blur-sm flex items-center gap-2 z-20">
                <Bot className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-white/60 text-xs font-bold">AI Reply</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="border-y border-white/5 bg-white/[0.015]">
        <div className="max-w-5xl mx-auto px-5 py-14 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {t.stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Ticker value={s.num} />
              <div className="text-sm text-white/30 font-medium mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── MARQUEE LOGOS (trust) ── */}
      <section className="py-10 border-b border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 mb-6 text-center">
          <span className="text-white/20 text-xs font-bold uppercase tracking-widest">Dipercaya tim dari berbagai bisnis</span>
        </div>
        <div className="relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#040810] to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#040810] to-transparent z-10" />
          <motion.div animate={{ x: ["0%", "-50%"] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="flex gap-12 w-max items-center py-2">
            {[...Array(2)].flatMap(() => ["Tokopedia", "Shopee", "Gojek Partners", "UMKM Digital", "iSeller", "Jurnal.id", "Moka POS", "Qasir"].map((b, i) => (
              <span key={`${b}-${i}`} className="text-white/20 text-sm font-black tracking-wide whitespace-nowrap">{b}</span>
            )))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="py-28 px-5 scroll-mt-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/3 to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-xs font-black text-emerald-400/60 uppercase tracking-widest mb-3 block">{t.howPreTitle}</span>
            <h2 className="text-3xl md:text-5xl font-black">{t.howTitle}</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {t.howSteps.map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="relative p-7 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-emerald-500/20 hover:bg-white/[0.05] transition-all group">
                <div className="text-5xl font-black text-white/5 mb-4 group-hover:text-emerald-500/10 transition-colors">{step.step}</div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                  <span className="text-emerald-400 font-black text-sm">{i + 1}</span>
                </div>
                <h3 className="font-black text-white mb-2">{step.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{step.desc}</p>
                {i < 2 && <ChevronRight className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-white/10 hidden md:block" />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-28 px-5 scroll-mt-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-xs font-black text-emerald-400/60 uppercase tracking-widest mb-3 block">{t.featuresPreTitle}</span>
            <h2 className="text-3xl md:text-5xl font-black mb-4">{t.featuresTitle}</h2>
            <p className="text-lg text-white/40 max-w-2xl mx-auto">{t.featuresSubtitle}</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {t.features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="relative group p-7 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-emerald-500/25 hover:bg-white/[0.05] transition-all overflow-hidden">
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-teal-500/0 group-hover:from-emerald-500/3 group-hover:to-teal-500/3 transition-all duration-500" />
                {f.badge && <span className="absolute top-5 right-5 text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">{f.badge}</span>}
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/15 to-teal-500/10 border border-emerald-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <f.icon className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-base font-black mb-2 text-white">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed relative z-10">{f.desc}</p>
                <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-emerald-500/0 to-transparent group-hover:via-emerald-500/40 transition-all duration-500" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS MARQUEE ── */}
      <section id="testimonials" className="py-28 border-t border-white/5 relative overflow-hidden scroll-mt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/3 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-5 mb-12 relative">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
            <div className="flex items-center justify-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
              <span className="ml-2 text-white/30 text-sm font-semibold">{t.social.rating}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-4">{t.social.title}</h2>
            <p className="text-white/30 text-sm">Ribuan pebisnis sudah merasakan manfaatnya — ini cerita mereka</p>
          </motion.div>
        </div>
        <TestimonialMarquee items={t.social.items} />
        <div className="mt-5">
          <TestimonialMarquee items={[...t.social.items].reverse()} />
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-28 px-5 scroll-mt-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-xs font-black text-emerald-400/60 uppercase tracking-widest mb-3 block">Mulai dari gratis</span>
            <h2 className="text-3xl md:text-5xl font-black mb-4">{t.pricingTitle}</h2>
            <p className="text-lg text-white/40">{t.pricingSubtitle}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
            {t.plans.map((plan, i) => {
              const colors = planColorMap[plan.color] || planColorMap.emerald;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  whileHover={{ y: plan.highlight ? -8 : -4, transition: { duration: 0.2 } }}
                  className={`relative flex flex-col rounded-2xl border-2 transition-all ${plan.highlight
                    ? 'bg-gradient-to-b from-emerald-500/10 to-emerald-500/3 border-emerald-500/50 lg:-translate-y-4 shadow-2xl shadow-emerald-500/15'
                    : `${colors.border} bg-white/[0.025] ${colors.glow}`
                  }`}>
                  {plan.badge && (
                    <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-widest shadow-lg whitespace-nowrap ${plan.highlight ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/30" : colors.badge}`}>
                      {plan.badge}
                    </div>
                  )}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="mb-5">
                      <div className="text-xs font-black text-white/40 mb-0.5 uppercase tracking-wider">{plan.name}</div>
                      <div className="text-[11px] text-white/25">{plan.desc}</div>
                    </div>
                    <div className="mb-6">
                      {plan.originalPrice && <div className="text-xs text-white/20 line-through mb-1">{plan.originalPrice}</div>}
                      <div className="flex items-baseline gap-1">
                        <span className={`font-black ${plan.price === "Custom" || plan.price === "Kustom" ? "text-2xl text-white" : plan.price === "Rp 0" ? "text-3xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300" : "text-3xl text-white"}`}>{plan.price}</span>
                        {plan.period && <span className="text-white/25 text-xs">{plan.period}</span>}
                      </div>
                    </div>
                    <ul className="space-y-2 mb-6 flex-1">
                      {plan.features.map((feat, j) => (
                        <li key={j} className="flex items-center gap-2 text-xs">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${plan.highlight ? 'bg-emerald-500/20' : 'bg-white/6'}`}>
                            <Check className={`w-2.5 h-2.5 ${plan.highlight ? 'text-emerald-400' : 'text-white/35'}`} />
                          </div>
                          <span className="text-white/45">{feat}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href={plan.href}>
                      <button className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${colors.btn}`}>
                        {plan.cta}
                      </button>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-28 px-5">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          className="max-w-4xl mx-auto relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-500" />
          <GridLines />
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-black/10 rounded-full blur-2xl" />
          {/* Animated particles on banner */}
          <BannerParticles />
          <div className="relative z-10 text-center py-20 px-8">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-5">{t.ctaBanner.title}</h2>
            <p className="text-white/75 text-lg mb-10 max-w-lg mx-auto">{t.ctaBanner.subtitle}</p>
            <Link href="/register">
              <motion.button whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }}
                className="px-10 py-4 rounded-full bg-white text-emerald-600 font-black text-lg shadow-2xl shadow-black/20 hover:shadow-black/30 transition-all">
                {t.ctaBanner.cta} <ArrowRight className="inline-block ml-2 w-5 h-5" />
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-10 px-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex items-center gap-2">
              <Logo size={28} />
              <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Weaweb</span>
            </div>
          </Link>
          <p className="text-sm text-white/20">{t.footer}</p>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm text-white/25 hover:text-white transition-colors">{t.nav.login}</Link>
            <Link href="/register" className="text-sm text-white/25 hover:text-white transition-colors">{t.nav.signup}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
