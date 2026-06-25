"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, LayoutTemplate } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
    
    // validate name (lowercase, no spaces, just underscores)
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
          components: [
            {
              type: "BODY",
              text: newBody
            }
          ]
        })
      });
      const json = await res.json();
      if (json.success) {
        setCreateOpen(false);
        setNewName("");
        setNewBody("");
        fetchTemplates(selectedDeviceId);
      } else {
        alert("Failed to create template: " + json.error);
      }
    } catch (e: any) {
      alert(e.message || "Error creating template");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`Are you sure you want to delete template '${name}'?`)) return;
    try {
      const res = await fetch(`/api/v1/meta-templates?deviceId=${selectedDeviceId}&name=${name}`, {
        method: "DELETE"
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

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-800 flex items-center gap-2">
            <LayoutTemplate className="w-6 h-6 text-green-600" />
            Meta Message Templates
          </h1>
          <p className="text-zinc-600 mt-1">Manage official WhatsApp Business templates.</p>
        </div>

        {devices.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-500 font-medium">Select Device:</span>
            <select
              value={selectedDeviceId}
              onChange={handleDeviceChange}
              className="border-zinc-200 border rounded-md px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-green-500"
            >
              {devices.map((d) => (
                <option key={d.id} value={d.id}>{d.name} ({d.phoneNumber})</option>
              ))}
            </select>
            
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger className="bg-green-600 hover:bg-green-700 text-white h-9 px-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow">
                <Plus className="w-4 h-4 mr-2" />
                New Template
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create Meta Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Template Name</label>
                    <Input 
                      placeholder="e.g. promo_ramadhan" 
                      value={newName}
                      onChange={e => setNewName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    />
                    <p className="text-xs text-zinc-500 mt-1">Lowercase letters and underscores only.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Language</label>
                      <select 
                        className="w-full border border-zinc-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
                        value={newLanguage}
                        onChange={e => setNewLanguage(e.target.value)}
                      >
                        <option value="id">Indonesian (id)</option>
                        <option value="en_US">English (en_US)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Category</label>
                      <select 
                        className="w-full border border-zinc-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
                        value={newCategory}
                        onChange={e => setNewCategory(e.target.value)}
                      >
                        <option value="MARKETING">Marketing</option>
                        <option value="UTILITY">Utility</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Message Body</label>
                    <Textarea 
                      rows={5} 
                      placeholder="Halo {{1}}, promo menarik untukmu: {{2}}!"
                      value={newBody}
                      onChange={e => setNewBody(e.target.value)}
                    />
                    <p className="text-xs text-zinc-500 mt-1">Use {'{{1}}'}, {'{{2}}'} for variables.</p>
                  </div>
                  <Button onClick={handleCreate} disabled={creating || !newName || !newBody} className="w-full bg-green-600 hover:bg-green-700">
                    {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Submit to Meta"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {devices.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center">
          <h3 className="text-lg font-medium text-zinc-800">No Official Devices Found</h3>
          <p className="text-zinc-500 mt-2">You need to connect an Official Meta API device first to manage templates.</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
          {error}
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center">
          <h3 className="text-lg font-medium text-zinc-800">No Templates Found</h3>
          <p className="text-zinc-500 mt-2">You haven't created any templates for this device yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((t: any) => {
            const bodyText = t.components?.find((c: any) => c.type === "BODY")?.text || "No body";
            return (
              <div key={t.id} className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-zinc-900 truncate pr-2">{t.name}</h3>
                  <Badge variant="outline" className={t.status === "APPROVED" ? "bg-green-50 text-green-700 border-green-200" : t.status === "REJECTED" ? "bg-red-50 text-red-700 border-red-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"}>
                    {t.status}
                  </Badge>
                </div>
                
                <div className="flex gap-2 mb-4">
                  <span className="text-xs px-2 py-1 bg-zinc-100 rounded-md font-medium text-zinc-600">{t.language}</span>
                  <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-md font-medium">{t.category}</span>
                </div>

                <div className="bg-zinc-50 rounded-lg p-3 text-sm text-zinc-700 mb-4 whitespace-pre-wrap flex-grow border border-zinc-100 font-mono">
                  {bodyText}
                </div>

                <div className="flex justify-end pt-2 border-t border-zinc-100 mt-auto">
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(t.name)}>
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
