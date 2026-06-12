"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Megaphone, Loader2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
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

  const filteredCampaigns = campaigns.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex justify-between items-center bg-card p-6 rounded-[0.35rem] border border-border">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-primary" />
            Campaigns
          </h1>
          <p className="text-muted-foreground mt-1 font-medium">Manage and monitor your broadcast campaigns</p>
        </div>
        <Link href="/dashboard/campaigns/new">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-[0.35rem] font-bold shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </Button>
        </Link>
      </div>

      <div className="bg-card rounded-[0.35rem] border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-4 bg-secondary/50">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search campaigns..." 
              className="pl-9 bg-background border-border text-foreground focus-visible:ring-primary rounded-[0.25rem]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/80 hover:bg-secondary/80 border-border">
                <TableHead className="font-bold text-foreground">Name</TableHead>
                <TableHead className="font-bold text-foreground">Target Tags</TableHead>
                <TableHead className="font-bold text-foreground">Status</TableHead>
                <TableHead className="font-bold text-foreground">Total Contacts</TableHead>
                <TableHead className="font-bold text-foreground text-right">Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="border-border">
                  <TableCell colSpan={5} className="h-48 text-center text-muted-foreground font-bold">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    Loading campaigns...
                  </TableCell>
                </TableRow>
              ) : filteredCampaigns.length === 0 ? (
                <TableRow className="border-border">
                  <TableCell colSpan={5} className="h-48 text-center text-muted-foreground font-bold uppercase tracking-widest text-sm">
                    No campaigns found. Create one to get started!
                  </TableCell>
                </TableRow>
              ) : (
                filteredCampaigns.map((campaign) => (
                  <TableRow key={campaign.id} className="hover:bg-muted/50 transition-colors border-border">
                    <TableCell className="font-bold text-foreground">{campaign.name}</TableCell>
                    <TableCell>
                      {campaign.targetTags ? (
                        <Badge variant="outline" className="bg-secondary text-secondary-foreground border-border font-bold uppercase tracking-wider rounded-[0.25rem]">
                          {campaign.targetTags}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-secondary text-muted-foreground border-border font-bold uppercase tracking-wider rounded-[0.25rem]">
                          All Contacts
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary"
                        className={
                          campaign.status === "running" ? "bg-primary/20 text-primary hover:bg-primary/20 font-bold uppercase tracking-wider rounded-[0.25rem]" :
                          campaign.status === "completed" ? "bg-secondary text-secondary-foreground hover:bg-secondary font-bold uppercase tracking-wider rounded-[0.25rem]" :
                          "bg-muted text-muted-foreground hover:bg-muted font-bold uppercase tracking-wider rounded-[0.25rem]"
                        }
                      >
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-foreground font-mono">
                      {campaign._count?.messages || 0}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground font-mono">
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
