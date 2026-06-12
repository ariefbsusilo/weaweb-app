"use client";

import { useState, useEffect } from "react";
import { Loader2, Users, Plus, FolderHeart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newGroupName, setNewGroupName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/v1/contact-groups");
      const data = await res.json();
      setGroups(data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    setIsCreating(true);
    try {
      const res = await fetch("/api/v1/contact-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newGroupName.trim() })
      });
      if (res.ok) {
        setNewGroupName("");
        setDialogOpen(false);
        fetchGroups();
      }
    } catch (err) {
      console.error("Failed to create group", err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in zoom-in-95 duration-500">
      <div className="flex justify-between items-center bg-card p-6 rounded-[0.35rem] border border-border shadow-sm">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <FolderHeart className="w-8 h-8 text-primary" />
            Contact Groups
          </h2>
          <p className="text-muted-foreground mt-1 font-medium">Group your contacts for targeted campaigns.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground font-bold shadow-sm rounded-[0.35rem] hover:bg-primary/90 transition-all">
              <Plus className="w-5 h-5 mr-1" /> Create Group
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-[0.35rem] bg-card border border-border shadow-2xl">
            <DialogHeader>
              <DialogTitle className="font-extrabold text-foreground">Create New Group</DialogTitle>
            </DialogHeader>
            <form onSubmit={createGroup} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Group Name</label>
                <Input 
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. VIP Customers, Leads Q3..."
                  required
                  className="bg-background border-border text-foreground rounded-[0.25rem] shadow-sm"
                />
              </div>
              <Button type="submit" disabled={isCreating || !newGroupName.trim()} className="w-full bg-primary text-primary-foreground font-bold shadow-sm rounded-[0.35rem] hover:bg-primary/90">
                {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save Group
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && groups.length === 0 ? (
          <div className="col-span-full py-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : groups.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-card border border-border rounded-[0.35rem] shadow-sm">
            <FolderHeart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-foreground mb-1">No Groups Yet</h3>
            <p className="text-muted-foreground text-sm">Create your first group to start organizing contacts.</p>
          </div>
        ) : (
          groups.map((g) => (
            <div key={g.id} className="bg-card border border-border rounded-[0.35rem] p-5 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-extrabold text-lg text-foreground truncate pr-4">{g.name}</h3>
                <span className="inline-flex items-center justify-center bg-primary/10 text-primary w-8 h-8 rounded-[0.25rem] font-bold text-sm">
                  {g._count?.contacts || 0}
                </span>
              </div>
              <div className="flex items-center text-xs font-bold text-muted-foreground">
                <Users className="w-4 h-4 mr-1.5 opacity-70" />
                {g._count?.contacts === 1 ? "1 Contact" : `${g._count?.contacts || 0} Contacts`}
              </div>
              <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                  {new Date(g.createdAt).toLocaleDateString()}
                </span>
                <Button variant="ghost" size="sm" className="h-8 text-xs font-bold text-primary hover:bg-primary/10">
                  Manage Contacts
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
