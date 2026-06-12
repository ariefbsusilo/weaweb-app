"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Trash2, Plus, Loader2 } from "lucide-react";

export default function ChatbotPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [keyword, setKeyword] = useState("");
  const [replyText, setReplyText] = useState("");
  const [matchType, setMatchType] = useState("exact");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const res = await fetch("/api/v1/chatbot");
      const data = await res.json();
      setRules(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const saveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let mediaUrl = null;
      let mediaType = null;

      if (file) {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch("/api/v1/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed");
        mediaUrl = uploadData.url;
        mediaType = uploadData.type;
        setUploading(false);
      }

      await fetch("/api/v1/chatbot", {
        method: "POST",
        body: JSON.stringify({ keyword, replyText, matchType, mediaUrl, mediaType }),
        headers: { "Content-Type": "application/json" }
      });
      setKeyword("");
      setReplyText("");
      setFile(null);
      await fetchRules();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const deleteRule = async (id: string) => {
    try {
      await fetch(`/api/v1/chatbot?id=${id}`, { method: "DELETE" });
      await fetchRules();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 max-w-5xl">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Chatbot Auto-Reply</h2>
        <p className="text-muted-foreground mt-1 font-medium">Automatically respond to incoming messages based on keywords.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-card p-6 rounded-[0.35rem] border border-border">
            <h3 className="font-extrabold text-lg mb-4 flex items-center gap-2 text-foreground">
              <Bot className="w-5 h-5 text-primary" />
              New Rule
            </h3>
            <form onSubmit={saveRule} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1 text-foreground">Keyword</label>
                <Input 
                  placeholder="e.g. PROMO" 
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="rounded-[0.25rem] border-border bg-background text-foreground"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1 text-foreground">Match Type</label>
                <select 
                  className="flex h-10 w-full rounded-[0.25rem] border border-border bg-background px-3 py-2 text-sm text-foreground"
                  value={matchType}
                  onChange={(e) => setMatchType(e.target.value)}
                >
                  <option value="exact">Exact Match</option>
                  <option value="contains">Contains Word</option>
                  <option value="startsWith">Starts With</option>
                  <option value="regex">RegEx (Advanced)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1 text-foreground">Auto-Reply Message</label>
                <Textarea 
                  placeholder="Hello! Here is our current promo..." 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="rounded-[0.25rem] border-border bg-background text-foreground"
                  required 
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1 text-foreground">Attachment (Optional)</label>
                <Input 
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="rounded-[0.25rem] border-border bg-background text-foreground"
                />
              </div>
              <Button type="submit" disabled={saving || uploading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-[0.35rem] font-bold">
                {saving || uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                {uploading ? "Uploading..." : "Add Rule"}
              </Button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-card rounded-[0.35rem] border border-border overflow-hidden">
            <div className="p-4 bg-secondary border-b border-border">
              <h3 className="font-extrabold text-foreground">Active Rules</h3>
            </div>
            <div className="p-0">
              {loading ? (
                <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : rules.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground font-bold uppercase tracking-widest text-sm">No auto-reply rules configured yet.</div>
              ) : (
                <ul className="divide-y divide-border">
                  {rules.map((rule) => (
                    <li key={rule.id} className="p-4 hover:bg-secondary/50 flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono bg-primary/20 text-primary px-2 py-0.5 rounded-[0.25rem] text-xs font-bold uppercase tracking-wider">
                            {rule.keyword}
                          </span>
                          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-[0.25rem] font-bold uppercase tracking-wider">
                            {rule.matchType}
                          </span>
                        </div>
                        <p className="text-sm text-foreground font-medium whitespace-pre-wrap">{rule.replyText}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteRule(rule.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
