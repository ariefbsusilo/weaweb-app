"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Send, Paperclip, CalendarClock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [name, setName] = useState("");
  const [targetTags, setTargetTags] = useState("");
  const [content, setContent] = useState("Halo {{name}}, \n\n");
  const [scheduledAt, setScheduledAt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

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

      const payload = { 
        name, 
        content, 
        targetTags, 
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        mediaUrl,
        mediaType
      };

      const res = await fetch("/api/v1/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create campaign");
      }

      router.push("/dashboard/campaigns");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/campaigns">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5 text-zinc-600" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">New Campaign</h1>
          <p className="text-zinc-500 text-sm">Create and broadcast a new message to your contacts</p>
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-2xl border border-zinc-100 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-900">Campaign Name</label>
            <Input 
              required
              placeholder="e.g., Promo Akhir Tahun 2026" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-zinc-50 border-zinc-200 focus-visible:ring-green-600 focus-visible:ring-offset-2"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-900">Target Tags <span className="text-zinc-400 font-normal">(Optional)</span></label>
            <Input 
              placeholder="e.g., VIP, promo (leave blank to send to all contacts)" 
              value={targetTags}
              onChange={(e) => setTargetTags(e.target.value)}
              className="bg-zinc-50 border-zinc-200 focus-visible:ring-green-600"
            />
            <p className="text-xs text-zinc-500">Matches contacts containing this tag. Leave empty to target everyone.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                <CalendarClock className="w-4 h-4" /> Schedule Send
              </label>
              <Input 
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="bg-zinc-50 border-zinc-200 focus-visible:ring-green-600"
              />
              <p className="text-xs text-zinc-500">Leave blank to send immediately.</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                <Paperclip className="w-4 h-4" /> Media Attachment
              </label>
              <Input 
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="bg-zinc-50 border-zinc-200 focus-visible:ring-green-600 cursor-pointer"
              />
              <p className="text-xs text-zinc-500">Image, Video, or PDF.</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-900 flex justify-between">
              Message Content
              <span className="text-zinc-400 font-normal text-xs">Variables: {'{{name}}'}</span>
            </label>
            <Textarea 
              required
              rows={8}
              placeholder="Write your message here..." 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bg-zinc-50 border-zinc-200 focus-visible:ring-green-600 resize-none font-mono text-sm"
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading || uploading} 
            className="w-full h-12 text-base font-medium bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all hover:-translate-y-0.5"
          >
            {loading || uploading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {uploading ? "Uploading media..." : "Processing..."}
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Launch Campaign
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
