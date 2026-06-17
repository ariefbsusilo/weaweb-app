"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, MonitorSmartphone, MessageCircle, Megaphone, Bot } from "lucide-react"

export function MobileNavigation() {
  const pathname = usePathname()

  const links = [
    { href: "/dashboard", icon: Home, label: "Home" },
    { href: "/dashboard/devices", icon: MonitorSmartphone, label: "Devices" },
    { href: "/dashboard/inbox", icon: MessageCircle, label: "Inbox" },
    { href: "/dashboard/campaigns", icon: Megaphone, label: "Campaigns" },
    { href: "/dashboard/chatbot", icon: Bot, label: "Chat AI" },
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border flex items-center justify-around p-2 z-50 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
      {links.map((link) => {
        let isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href))
        
        if (pathname.includes("/ai")) {
          if (link.href === "/dashboard/chatbot") isActive = true;
          if (link.href === "/dashboard/devices") isActive = false;
        }
        const Icon = link.icon
        
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center justify-center p-2 rounded-[0.35rem] transition-all ${isActive ? 'text-primary scale-110' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'fill-primary/20' : ''}`} />
            <span className="text-[10px] font-bold mt-1">{link.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
