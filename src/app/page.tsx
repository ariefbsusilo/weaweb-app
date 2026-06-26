"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Check, ChevronRight, Zap, MessageCircle, Bot, Globe, BarChart, Database } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { motion, Variants } from 'framer-motion';

export default function Home() {

  const containerFade: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemFade: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  const scrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-50 selection:bg-primary/20 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">Weaweb</span>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link href="/login">
                <Button variant="ghost" className="hidden sm:inline-flex text-slate-600 dark:text-slate-300">
                  Login
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 shadow-lg shadow-primary/25 transition-transform hover:-translate-y-0.5">
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] dark:bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)]" />
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={containerFade}
          className="max-w-7xl mx-auto text-center relative z-10"
        >
          <motion.div variants={itemFade} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Zap className="w-4 h-4" /> v2.0 Now with AI Chatbots
          </motion.div>
          
          <motion.h1 variants={itemFade} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            Automate WhatsApp. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
              Scale Your Business.
            </span>
          </motion.h1>
          
          <motion.p variants={itemFade} className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10">
            The ultimate all-in-one platform for WhatsApp Marketing, AI Customer Service, and Team Inbox. Built for modern businesses.
          </motion.p>
          
          <motion.div variants={itemFade} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white rounded-full px-8 h-14 text-lg shadow-[0_0_40px_rgba(16,185,129,0.3)] transition-all hover:-translate-y-1 hover:shadow-[0_0_60px_rgba(16,185,129,0.4)]">
                Start Free Trial <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button onClick={scrollToPricing} size="lg" variant="outline" className="w-full sm:w-auto rounded-full px-8 h-14 text-lg border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:-translate-y-1">
              View Pricing
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800/50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to grow</h2>
            <p className="text-slate-600 dark:text-slate-400">Powerful tools designed to automate your conversations.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Globe, title: "Mass Broadcasting", desc: "Send personalized messages to thousands of contacts with one click using our Excel Import tool." },
              { icon: Bot, title: "AI Chatbots", desc: "Integrate ChatGPT or Gemini to handle customer inquiries 24/7 automatically." },
              { icon: Database, title: "Knowledge Base", desc: "Upload PDFs and let our AI train on your specific product data to give accurate answers." },
              { icon: MessageCircle, title: "Shared Team Inbox", desc: "Manage all customer conversations from multiple numbers in one unified dashboard." },
              { icon: Zap, title: "Auto-Responders", desc: "Set up smart keyword triggers to reply instantly without human intervention." },
              { icon: BarChart, title: "Deep Analytics", desc: "Track message delivery, read rates, and AI conversation evaluations in real-time." },
            ].map((feature, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="p-6 rounded-2xl bg-slate-50 dark:bg-[#020617] border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-colors shadow-sm hover:shadow-md"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 max-w-7xl mx-auto scroll-mt-20 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Simple, Transparent Pricing</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Choose the perfect plan for your business needs. 
            <br className="hidden sm:block" /> Promo starts from just Rp 150.000/month.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Starter Plan */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col p-8 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:shadow-lg"
          >
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Starter</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">For small businesses.</p>
            <div className="mb-6 flex flex-col">
              <span className="text-sm text-slate-400 line-through">Rp 250.000</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">Rp 150k</span>
                <span className="text-slate-500 dark:text-slate-400">/mo</span>
              </div>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {[
                "1 WhatsApp Device",
                "Unlimited Broadcasts",
                "Basic Auto-Responder",
                "Contact Management",
                "Standard Support"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <Check className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">{item}</span>
                </li>
              ))}
            </ul>
            <Link href="/login" className="w-full">
              <Button variant="outline" className="w-full rounded-full border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">Get Started</Button>
            </Link>
          </motion.div>

          {/* Business Plan */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col p-8 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:shadow-lg"
          >
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Business</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Scale your marketing.</p>
            <div className="mb-6 flex flex-col">
              <span className="text-sm text-slate-400 line-through">Rp 499.000</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">Rp 299k</span>
                <span className="text-slate-500 dark:text-slate-400">/mo</span>
              </div>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {[
                "3 WhatsApp Devices",
                "Unlimited Broadcasts",
                "Excel Import Campaigns",
                "Advanced Auto-Responder",
                "Priority Support"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <Check className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">{item}</span>
                </li>
              ))}
            </ul>
            <Link href="/login" className="w-full">
              <Button variant="outline" className="w-full rounded-full border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">Get Started</Button>
            </Link>
          </motion.div>

          {/* AI Automation Plan */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col p-8 rounded-3xl bg-slate-900 dark:bg-slate-800 border-2 border-primary relative transform lg:-translate-y-4 shadow-2xl shadow-primary/20"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
              Most Popular
            </div>
            <h3 className="text-xl font-bold text-white mb-2">AI Automation</h3>
            <p className="text-sm text-slate-400 mb-6">Full autopilot with AI.</p>
            <div className="mb-6 flex flex-col">
              <span className="text-sm text-slate-500 line-through">Rp 1.500.000</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">Rp 1jt</span>
                <span className="text-slate-400">/mo</span>
              </div>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {[
                "5 WhatsApp Devices",
                "Unlimited Broadcasts",
                "10,000 AI Messages/mo",
                "ChatGPT & Gemini AI",
                "PDF Knowledge Base",
                "AI Chat Analytics"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <Check className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-slate-300">{item}</span>
                </li>
              ))}
            </ul>
            <Link href="/login" className="w-full">
              <Button className="w-full rounded-full bg-primary hover:bg-primary/90 text-white font-bold h-12 shadow-lg shadow-primary/30 transition-all">Upgrade Now</Button>
            </Link>
          </motion.div>

          {/* Enterprise Plan */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col p-8 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:shadow-lg"
          >
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Enterprise</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Custom high-volume.</p>
            <div className="mb-6 flex flex-col">
              <div className="flex items-baseline gap-1 h-[48px] items-end">
                <span className="text-4xl font-extrabold">Custom</span>
              </div>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {[
                "Unlimited Devices",
                "Unlimited AI Messages",
                "Dedicated Server",
                "Custom API Access",
                "Dedicated Account Manager",
                "SLA 99.9%"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <Check className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">{item}</span>
                </li>
              ))}
            </ul>
            <Link href="mailto:admin@weaweb.com" className="w-full">
              <Button variant="outline" className="w-full rounded-full border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">Contact Sales</Button>
            </Link>
          </motion.div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
        <p>© 2026 Weaweb. All rights reserved.</p>
      </footer>
    </div>
  );
}
