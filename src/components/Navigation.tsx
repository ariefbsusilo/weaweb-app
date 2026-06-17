"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Settings, Key } from "lucide-react"
import { motion } from "framer-motion"

export function Navigation() {
  const pathname = usePathname()

  const [openMenus, setOpenMenus] = React.useState<Record<string, boolean>>({
    "/dashboard/contacts": true
  })

  const toggleMenu = (href: string) => {
    setOpenMenus(prev => ({ ...prev, [href]: !prev[href] }))
  }

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/devices", label: "Devices" },
    { 
      href: "/dashboard/contacts", 
      label: "Phonebook",
      subItems: [
        { href: "/dashboard/contacts", label: "Contact" },
        { href: "/dashboard/groups", label: "Group" },
        { href: "/dashboard/wa-groups", label: "WA Group" },
      ]
    },
    { href: "/dashboard/campaigns", label: "Campaigns" },
    { href: "/dashboard/chatbot", label: "Chat AI" },
    { href: "/dashboard/inbox", label: "Inbox" },
    { href: "/dashboard/analytics", label: "Analytics" },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ]

  return (
    <nav className="flex flex-col gap-1 w-full py-4">
      {links.map((link) => {
        let isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href))
        
        // Special case for AI Config pages under devices
        if (pathname.includes("/ai")) {
          if (link.href === "/dashboard/chatbot") isActive = true;
          if (link.href === "/dashboard/devices") isActive = false;
        }
        const Icon = link.icon
        const hasSubItems = link.subItems && link.subItems.length > 0
        const isOpen = openMenus[link.href]

        return (
          <div key={link.href} className="flex flex-col">
            <Link 
              href={hasSubItems ? "#" : link.href}
              onClick={(e) => {
                if (hasSubItems) {
                  e.preventDefault()
                  toggleMenu(link.href)
                }
              }}
              className={`relative flex items-center justify-between gap-3 text-sm font-bold px-4 py-3 rounded-[0.35rem] transition-colors ${isActive && !hasSubItems ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 z-10"}`}
            >
              {isActive && !hasSubItems && (
                <motion.div
                  layoutId="nav-active-pill"
                  className="absolute inset-0 bg-primary rounded-[0.35rem] -z-10 shadow-sm"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-3 w-full">
                {Icon && <Icon className="w-5 h-5" />} 
                <span className="flex-1 truncate tracking-wide">{link.label}</span>
              </span>
              {hasSubItems && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                >
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              )}
            </Link>
            
            {hasSubItems && isOpen && (
              <div className="flex flex-col gap-1 mt-1 pl-4 border-l-2 border-border/50 ml-4">
                {link.subItems?.map((subItem) => {
                  const isSubActive = pathname === subItem.href
                  return (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      className={`relative flex items-center gap-3 text-sm font-bold px-4 py-2.5 rounded-[0.35rem] transition-colors ${isSubActive ? "text-primary-foreground bg-primary/90 shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}
                    >
                      <span className="flex-1 truncate tracking-wide">{subItem.label}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )
}
