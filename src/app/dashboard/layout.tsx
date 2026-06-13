import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Settings, Bell, User, MessageCircle } from "lucide-react"
import { Navigation } from "@/components/Navigation"
import { ThemeToggle } from "@/components/ThemeToggle"
import { LogoutButton } from "@/components/LogoutButton"
import { MobileNavigation } from "@/components/MobileNavigation"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  
  if (!session?.user || !(session as any).tenantId) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 flex">
      
      {/* Executive Vertical Sidebar */}
      <aside className="w-64 bg-card border-r border-border h-screen sticky top-0 flex flex-col z-50 shadow-sm hidden md:flex">
        <div className="px-6 py-8 flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center">
            <img src="/logo.png" alt="Weaweb Logo" className="w-full h-full object-contain drop-shadow-sm" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-foreground ml-1">Weaweb</span>
        </div>

        <div className="flex-1 px-4 overflow-y-auto">
          <Navigation />
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 p-2 rounded-[0.35rem] bg-secondary/30">
            <div className="w-8 h-8 bg-secondary rounded-[0.25rem] flex items-center justify-center border border-border overflow-hidden">
              <User className="w-4 h-4 text-secondary-foreground" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-foreground truncate">{session.user.name || "Administrator"}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest truncate">Workspace</p>
            </div>
          </div>
          
          <div className="mt-2 flex gap-2">
            <LogoutButton />
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Top Nav */}
        <header className="md:hidden w-full bg-card border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <img src="/logo.png" alt="Weaweb Logo" className="w-full h-full object-contain drop-shadow-sm" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground ml-1">Weaweb</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button className="w-8 h-8 flex items-center justify-center text-muted-foreground">
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 pb-24 md:pb-10 md:p-10 max-w-7xl mx-auto w-full">
          {children}
        </main>
        <MobileNavigation />
      </div>
    </div>
  )
}
