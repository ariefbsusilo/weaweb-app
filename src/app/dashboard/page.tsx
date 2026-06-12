import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, Megaphone, Smartphone, ArrowUpRight, Play, Pause, CheckCircle2, Circle, MessageCircle, Settings } from "lucide-react";
import Image from "next/image";

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user || !(session as any).tenantId) {
    redirect("/login");
  }

  const tenantId = (session as any).tenantId;

  // Fetch real metrics
  const totalContacts = await prisma.contact.count({ where: { tenantId } });
  const totalCampaigns = await prisma.campaign.count({ where: { tenantId } });
  
  // Only count outbound messages (sent via Weaweb)
  const sentMessages = await prisma.message.count({
    where: { 
      tenantId, 
      direction: "outbound",
      status: { notIn: ["queued", "failed"] }
    }
  });

  const totalMessages = await prisma.message.count({
    where: { 
      tenantId,
      direction: "outbound"
    }
  });
  
  const inboxMessagesCount = await prisma.message.count({
    where: {
      tenantId,
      direction: "inbound"
    }
  });
  
  const performanceRate = totalMessages > 0 ? Math.round((sentMessages / totalMessages) * 100) : 0;
  
  // Fake auto-reply hit rate for now (or dynamic based on inbound replies if any)
  const autoReplyHitRate = 0;

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }});
  const connectedDevice = await prisma.device.findFirst({
    where: { tenantId, status: "connect" }
  });
  const isConnected = !!connectedDevice;

  // Recent 5 messages for the dark card (grouped by contact, only weaweb outbound)
  const recentMessages = await prisma.message.findMany({
    where: { tenantId, direction: "outbound" },
    include: { contact: true },
    orderBy: { createdAt: 'desc' },
    distinct: ['contactId'],
    take: 5
  });

  const userName = session.user.name || session.user.email?.split("@")[0] || "User";

  return (
    <div className="space-y-8 pb-12">
      {/* Top Section: Greeting & Stats */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground break-words">Welcome in, {userName}</h1>
          
          <div className="flex flex-wrap items-center gap-4 lg:gap-6 mt-6">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Inbox</span>
              <div className="h-8 min-w-16 px-4 bg-primary rounded-[0.35rem] mt-2 flex items-center justify-center shadow-sm">
                <span className="text-sm text-primary-foreground font-mono font-bold">{inboxMessagesCount}</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Sent</span>
              <div className="h-8 min-w-16 px-4 bg-secondary border border-border rounded-[0.35rem] mt-2 flex items-center justify-center shadow-sm">
                <span className="text-sm text-secondary-foreground font-mono font-bold">{sentMessages}</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Performance</span>
              <div className="h-8 w-32 bg-secondary border border-border rounded-[0.35rem] mt-2 overflow-hidden flex">
                <div className="h-full bg-primary border-r border-border" style={{ width: `${performanceRate}%` }}></div>
                <div className="h-full flex-1 flex items-center justify-center">
                  <span className="text-xs text-secondary-foreground font-mono font-bold">{performanceRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 lg:gap-12 mt-6 lg:mt-0">
          <Link href="/dashboard/contacts" className="flex flex-col items-start hover:opacity-70 transition-opacity cursor-pointer">
            <span className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Contacts</span>
            <div className="flex items-center gap-3">
              <span className="text-5xl font-mono font-medium tracking-tighter text-foreground">{totalContacts}</span>
            </div>
          </Link>
          <Link href="/dashboard/campaigns" className="flex flex-col items-start hover:opacity-70 transition-opacity cursor-pointer">
            <span className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Campaigns</span>
            <div className="flex items-center gap-3">
              <span className="text-5xl font-mono font-medium tracking-tighter text-foreground">{totalCampaigns}</span>
            </div>
          </Link>
          <Link href="/dashboard/inbox" className="flex flex-col items-start hover:opacity-70 transition-opacity cursor-pointer">
            <span className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Messages</span>
            <div className="flex items-center gap-3">
              <span className="text-5xl font-mono font-medium tracking-tighter text-foreground">{totalMessages}</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Middle Section: Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        
        {/* Profile Card (WhatsApp Status) */}
        <Link href="/dashboard/settings" className="bg-card rounded-[0.35rem] p-6 border border-border flex flex-col justify-between relative overflow-hidden h-72 hover:border-primary transition-colors cursor-pointer block group">
          <div className="absolute inset-0 z-0 bg-secondary/50 flex items-center justify-center opacity-50">
              <Smartphone className="w-48 h-48 text-border transition-transform group-hover:scale-110" />
          </div>
          
          <div className="relative z-20 flex justify-between items-start">
             {isConnected ? (
                <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider rounded-[0.25rem]">Connected</span>
             ) : (
                <span className="px-3 py-1 bg-destructive text-destructive-foreground text-xs font-bold uppercase tracking-wider rounded-[0.25rem]">Disconnected</span>
             )}
          </div>
          
          <div className="relative z-20 flex justify-between items-end">
            <div>
              <h3 className="text-2xl font-bold text-foreground">WhatsApp</h3>
              <p className="text-muted-foreground text-sm uppercase tracking-wide">Primary Device</p>
            </div>
          </div>
        </Link>

        {/* Progress Chart */}
        <div className="bg-card rounded-[0.35rem] p-6 border border-border flex flex-col justify-between relative h-72">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-foreground">Progress</h3>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-mono font-medium tracking-tight text-foreground">{sentMessages}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Msg sent total</span>
              </div>
            </div>
            <Link href="/dashboard/campaigns" className="w-8 h-8 rounded-[0.25rem] border border-border flex items-center justify-center bg-secondary hover:bg-border transition-colors cursor-pointer">
              <ArrowUpRight className="w-4 h-4 text-foreground" />
            </Link>
          </div>
          
          <div className="flex items-end justify-between h-32 px-2">
            {[40, 70, 30, 90, 100, 50, 20].map((h, i) => (
              <div key={i} className="flex flex-col items-center gap-2 w-full mx-1">
                <div className="w-full bg-primary" style={{ height: `${h}%` }}></div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground px-2 uppercase font-bold tracking-widest mt-2">
            <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
          </div>
        </div>

        {/* Time Tracker (Dial) */}
        <div className="bg-card rounded-[0.35rem] p-6 border border-border flex flex-col items-center relative h-72">
          <div className="w-full flex justify-between items-start absolute top-6 left-0 px-6">
            <h3 className="text-lg font-bold text-foreground">Auto-Reply</h3>
            <Link href="/dashboard/chatbot" className="w-8 h-8 rounded-[0.25rem] border border-border flex items-center justify-center bg-secondary hover:bg-border transition-colors cursor-pointer">
              <ArrowUpRight className="w-4 h-4 text-foreground" />
            </Link>
          </div>
          
          <div className="relative mt-8 flex-1 flex items-center justify-center w-full">
             {/* Flat Dashboard Dial */}
             <div className="w-32 h-32 rounded-full border-[12px] border-secondary border-t-primary border-r-primary transform -rotate-45"></div>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-mono font-medium tracking-tight text-foreground">{autoReplyHitRate}%</span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Hit Rate</span>
             </div>
          </div>
        </div>

        {/* Dark Card - Recent Messages */}
        <Link href="/dashboard/inbox" className="bg-[#0F172A] rounded-[0.35rem] p-6 flex flex-col h-72 overflow-hidden hover:border hover:border-primary transition-all duration-300 cursor-pointer block group">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[#F8FAFC] font-extrabold tracking-tight">Recent Inbox</h3>
            <span className="text-xl font-mono font-medium tracking-tight text-[#F8FAFC]/50">{recentMessages.length}/5</span>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {recentMessages.length > 0 ? recentMessages.map((msg) => (
              <div key={msg.id} className="flex items-start gap-3">
                <div className="mt-0.5">
                  <div className="w-8 h-8 rounded-[0.25rem] bg-[#1E293B] flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-[#F8FAFC]/70" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-[#F8FAFC]">{msg.contact.name || msg.contact.phoneNumber}</h4>
                  <p className="text-xs text-[#F8FAFC]/40 truncate w-32 mt-1">{msg.content}</p>
                </div>
                <div>
                  {msg.direction === "inbound" ? (
                     <Circle className="w-3 h-3 fill-primary text-primary mt-1" />
                  ) : (
                     <CheckCircle2 className="w-4 h-4 text-[#F8FAFC]/30" />
                  )}
                </div>
              </div>
            )) : (
              <div className="text-[#F8FAFC]/40 text-sm h-full flex items-center justify-center uppercase tracking-widest font-bold">No recent messages</div>
            )}
          </div>
        </Link>

      </div>

    </div>
  )
}
