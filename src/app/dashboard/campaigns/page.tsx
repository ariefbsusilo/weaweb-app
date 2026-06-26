"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Search, Megaphone, Loader2, Users, Clock, CheckCircle2,
  XCircle, BarChart3, CalendarDays, Tag, Trash2, RefreshCw
} from "lucide-react";
import Link from "next/link";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/campaigns");
      const data = await res.json();
      setCampaigns(data);
    } catch (error) {
      console.error("Failed to fetch campaigns", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus campaign "${name}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      await fetch(`/api/v1/campaigns?id=${id}`, { method: "DELETE" });
      setCampaigns(prev => prev.filter(c => c.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const filteredCampaigns = campaigns.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  // Stats
  const total = campaigns.length;
  const running = campaigns.filter(c => c.status === "running").length;
  const completed = campaigns.filter(c => c.status === "completed").length;
  const pending = campaigns.filter(c => c.status === "pending").length;

  const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    running: {
      label: "Running",
      className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      icon: <Loader2 className="w-3 h-3 animate-spin" />,
    },
    completed: {
      label: "Completed",
      className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      icon: <CheckCircle2 className="w-3 h-3" />,
    },
    pending: {
      label: "Pending",
      className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      icon: <Clock className="w-3 h-3" />,
    },
    failed: {
      label: "Failed",
      className: "bg-destructive/10 text-destructive border-destructive/20",
      icon: <XCircle className="w-3 h-3" />,
    },
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="flex justify-between items-center bg-card p-6 rounded-[0.35rem] border border-border">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-primary" />
            Campaigns
          </h1>
          <p className="text-muted-foreground mt-1 font-medium">Kelola dan pantau broadcast campaign Anda</p>
        </div>
        <Link href="/dashboard/campaigns/new">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-[0.35rem] font-bold shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Campaigns", value: total, icon: <BarChart3 className="w-5 h-5 text-primary" />, bg: "bg-primary/10" },
          { label: "Running", value: running, icon: <Loader2 className="w-5 h-5 text-blue-500" />, bg: "bg-blue-500/10" },
          { label: "Completed", value: completed, icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, bg: "bg-emerald-500/10" },
          { label: "Pending", value: pending, icon: <Clock className="w-5 h-5 text-amber-500" />, bg: "bg-amber-500/10" },
        ].map(stat => (
          <div key={stat.label} className="bg-card border border-border rounded-[0.35rem] p-4 flex items-center gap-4 shadow-sm">
            <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
              <p className="text-2xl font-extrabold text-foreground">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-[0.35rem] border border-border overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border flex items-center justify-between gap-4 bg-secondary/30">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari campaign..."
              className="pl-9 bg-background border-border text-foreground focus-visible:ring-primary rounded-[0.25rem]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" onClick={fetchCampaigns} disabled={loading} className="border-border">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-primary" />
            <span className="font-medium">Memuat campaigns...</span>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <Megaphone className="w-12 h-12 opacity-20 mb-3" />
            <span className="font-bold uppercase tracking-widest text-sm">Belum ada campaign</span>
            <span className="text-xs mt-1">Buat campaign pertama Anda sekarang!</span>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredCampaigns.map((campaign) => {
              const sc = statusConfig[campaign.status] || statusConfig.pending;
              const msgCount = campaign._count?.messages || 0;
              const hasSchedule = campaign.scheduledAt;
              const hasTemplate = campaign.metaTemplateName;

              return (
                <div key={campaign.id} className="px-5 py-4 hover:bg-secondary/30 transition-colors group">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="font-bold text-foreground truncate">{campaign.name}</h3>
                        <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 flex-shrink-0 ${sc.className}`}>
                          {sc.icon}
                          {sc.label}
                        </Badge>
                        {hasTemplate && (
                          <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider flex-shrink-0 bg-purple-500/10 text-purple-500 border-purple-500/20">
                            META TEMPLATE
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        {/* Contact count */}
                        <span className="flex items-center gap-1.5 font-medium">
                          <Users className="w-3.5 h-3.5" />
                          {msgCount} kontak
                        </span>

                        {/* Tags */}
                        <span className="flex items-center gap-1.5 font-medium">
                          <Tag className="w-3.5 h-3.5" />
                          {campaign.targetTags || "Semua kontak"}
                        </span>

                        {/* Schedule */}
                        {hasSchedule && (
                          <span className="flex items-center gap-1.5 font-medium text-amber-600 dark:text-amber-400">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(campaign.scheduledAt).toLocaleString("id-ID")}
                          </span>
                        )}

                        {/* Template name */}
                        {hasTemplate && (
                          <span className="flex items-center gap-1.5 font-medium text-purple-600 dark:text-purple-400">
                            <Megaphone className="w-3.5 h-3.5" />
                            {campaign.metaTemplateName}
                          </span>
                        )}

                        {/* Created At */}
                        <span className="flex items-center gap-1.5 font-medium">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {new Date(campaign.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                    </div>

                    {/* Right: Progress + Delete */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {/* Progress bar */}
                      {msgCount > 0 && (
                        <div className="hidden md:flex flex-col items-end gap-1 min-w-[120px]">
                          <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                campaign.status === "completed" ? "bg-emerald-500" :
                                campaign.status === "running" ? "bg-blue-500" : "bg-amber-400"
                              }`}
                              style={{ width: campaign.status === "completed" ? "100%" : campaign.status === "running" ? "60%" : "0%" }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground font-medium">
                            {campaign.status === "completed" ? "Selesai" :
                             campaign.status === "running" ? "Sedang berjalan" : "Menunggu"}
                          </span>
                        </div>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all h-8 w-8 p-0"
                        onClick={() => handleDelete(campaign.id, campaign.name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
