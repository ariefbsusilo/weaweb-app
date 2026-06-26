"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, LayoutTemplate, RefreshCw, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function TemplatesPage() {
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Create Form State
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newLanguage, setNewLanguage] = useState("id");
  const [newCategory, setNewCategory] = useState("MARKETING");
  const [newBody, setNewBody] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const res = await fetch("/api/devices");
      const json = await res.json();
      if (json.success) {
        const officials = json.data.filter((d: any) => d.provider === "official");
        setDevices(officials);
        if (officials.length > 0) {
          setSelectedDeviceId(officials[0].id);
          fetchTemplates(officials[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTemplates = async (deviceId: string) => {
    if (!deviceId) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/v1/meta-templates?deviceId=${deviceId}`);
      const json = await res.json();
      if (json.success) {
        setTemplates(json.data);
      } else {
        setError(json.error || "Failed to fetch templates");
      }
    } catch (e: any) {
      setError(e.message || "Error fetching templates");
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedDeviceId(id);
    fetchTemplates(id);
  };

  const handleCreate = async () => {
    if (!newName || !newBody || !selectedDeviceId) return;

    if (!/^[a-z0-9_]+$/.test(newName)) {
      alert("Name can only contain lowercase letters, numbers, and underscores.");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/v1/meta-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId: selectedDeviceId,
          name: newName,
          language: newLanguage,
          category: newCategory,
          body: newBody,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setCreateOpen(false);
        setNewName("");
        setNewBody("");
        fetchTemplates(selectedDeviceId);
      } else {
        alert("Failed: " + json.error);
      }
    } catch (e: any) {
      alert(e.message || "Error creating template");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (templateName: string) => {
    if (!confirm(`Delete template "${templateName}"? This cannot be undone.`)) return;
    try {
      const res = await fetch("/api/v1/meta-templates", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId: selectedDeviceId, name: templateName }),
      });
      const json = await res.json();
      if (json.success) {
        fetchTemplates(selectedDeviceId);
      } else {
        alert("Failed to delete template: " + json.error);
      }
    } catch (e: any) {
      alert(e.message || "Error deleting template");
    }
  };

  const statusColor = (status: string) => {
    if (status === "APPROVED") return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    if (status === "REJECTED") return "bg-destructive/10 text-destructive border-destructive/20";
    return "bg-amber-500/10 text-amber-500 border-amber-500/20";
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-[0.35rem] border border-border">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <LayoutTemplate className="w-6 h-6 text-primary" />
            Meta Message Templates
          </h1>
          <p className="text-muted-foreground mt-1 font-medium">Manage official WhatsApp Business templates.</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {devices.length > 0 && (
            <>
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground font-medium whitespace-nowrap">Select Device:</label>
                <select
                  value={selectedDeviceId}
                  onChange={handleDeviceChange}
                  className="border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                >
                  {devices.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.phoneNumber})</option>
                  ))}
                </select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchTemplates(selectedDeviceId)}
                disabled={loading}
                className="border-border"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>

              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 px-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors shadow">
                  <Plus className="w-4 h-4 mr-2" />
                  New Template
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="font-extrabold text-xl">Create Meta Template</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label className="text-sm font-bold mb-1.5 block text-foreground">Template Name</Label>
                      <Input
                        placeholder="e.g. promo_ramadhan"
                        value={newName}
                        onChange={e => setNewName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        className="bg-background border-border text-foreground"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Lowercase letters and underscores only.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-bold mb-1.5 block text-foreground">Language</Label>
                        <select
                          className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                          value={newLanguage}
                          onChange={e => setNewLanguage(e.target.value)}
                        >
                          <option value="id">Indonesian (id)</option>
                          <option value="en_US">English (en_US)</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-sm font-bold mb-1.5 block text-foreground">Category</Label>
                        <select
                          className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                          value={newCategory}
                          onChange={e => setNewCategory(e.target.value)}
                        >
                          <option value="MARKETING">Marketing</option>
                          <option value="UTILITY">Utility</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-bold mb-1.5 block text-foreground">Message Body</Label>
                      <Textarea
                        rows={5}
                        placeholder={"Halo {{1}}, promo menarik untukmu: {{2}}!"}
                        value={newBody}
                        onChange={e => setNewBody(e.target.value)}
                        className="bg-background border-border text-foreground"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Use {'{{1}}'}, {'{{2}}'} for variables.</p>
                    </div>
                    <Button onClick={handleCreate} disabled={creating || !newName || !newBody} className="w-full bg-primary hover:bg-primary/90">
                      {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                      {creating ? "Submitting..." : "Submit to Meta"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      {devices.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-lg p-12 text-center">
          <LayoutTemplate className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-bold text-foreground">No Official Devices Found</h3>
          <p className="text-muted-foreground mt-2">You need to connect an Official Meta API device first to manage templates.</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg border border-destructive/20 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-lg p-12 text-center">
          <LayoutTemplate className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-bold text-foreground">No Templates Found</h3>
          <p className="text-muted-foreground mt-2">Click "New Template" to create your first message template.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t: any) => {
            const bodyText = t.components?.find((c: any) => c.type === "BODY")?.text || "No body";
            return (
              <div key={t.id} className="bg-card border border-border rounded-lg p-5 shadow-sm hover:shadow-md transition-all flex flex-col h-full group">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-foreground truncate pr-2">{t.name}</h3>
                  <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${statusColor(t.status)}`}>
                    {t.status}
                  </Badge>
                </div>

                <div className="flex gap-2 mb-4">
                  <span className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-md font-medium">{t.language}</span>
                  <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-500 dark:text-blue-400 rounded-md font-medium">{t.category}</span>
                </div>

                <div className="bg-secondary/50 rounded-lg p-3 text-sm text-foreground mb-4 whitespace-pre-wrap flex-grow border border-border/50 font-mono leading-relaxed">
                  {bodyText}
                </div>

                <div className="flex justify-end pt-3 border-t border-border mt-auto">
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(t.name)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
