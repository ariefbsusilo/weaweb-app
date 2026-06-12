"use client";

import { useState, useEffect } from "react";
import { Loader2, Users, Search, AlertCircle, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function WAGroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/wa-groups");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch WA groups");
      setGroups(data.groups || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const filteredGroups = groups.filter((g) => 
    g.subject?.toLowerCase().includes(search.toLowerCase()) || 
    g.id.includes(search)
  );

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in zoom-in-95 duration-500">
      <div className="flex justify-between items-center bg-card p-6 rounded-[0.35rem] border border-border shadow-sm">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Users className="w-8 h-8 text-primary" />
            WhatsApp Groups
          </h2>
          <p className="text-muted-foreground mt-1 font-medium">View all WhatsApp groups your connected device is part of.</p>
        </div>
        <Button onClick={fetchGroups} disabled={loading} className="bg-primary text-primary-foreground font-bold shadow-sm rounded-[0.35rem] hover:bg-primary/90 transition-all">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Refresh List"}
        </Button>
      </div>

      {error ? (
        <div className="bg-destructive/10 border-l-4 border-destructive p-4 rounded-[0.25rem] flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
          <div>
            <h3 className="font-bold text-destructive">Error Loading Groups</h3>
            <p className="text-sm text-destructive/80 mt-1">{error}</p>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-[0.35rem] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/20">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search by group name or ID..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-background border-border shadow-sm text-foreground rounded-[0.25rem]"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Group Name</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">JID (Group ID)</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Participants</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Creation</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading && groups.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                      <p className="text-muted-foreground font-medium animate-pulse">Loading groups from WhatsApp...</p>
                    </td>
                  </tr>
                ) : filteredGroups.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground font-medium">
                      {search ? "No groups matched your search." : "No WhatsApp groups found on your connected device."}
                    </td>
                  </tr>
                ) : (
                  filteredGroups.map((g) => (
                    <tr key={g.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-foreground">{g.subject || "Unknown Group"}</div>
                        {g.owner && <div className="text-[10px] text-muted-foreground mt-0.5">Owner: {g.owner.split('@')[0]}</div>}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{g.id}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-[0.25rem] text-xs font-bold bg-primary/10 text-primary">
                          {g.participants?.length || 0} Members
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {g.creation ? new Date(g.creation * 1000).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(g.id)} className="text-muted-foreground hover:text-foreground">
                          <Copy className="w-4 h-4 mr-1.5" /> Copy ID
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
