"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Bot, Save } from "lucide-react";

export default function AiConfigPage() {
  const params = useParams();
  const router = useRouter();
  const deviceId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [provider, setProvider] = useState("gemini");
  const [apiKey, setApiKey] = useState("");
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch(`/api/devices/${deviceId}/ai`);
        if (res.ok) {
          const data = await res.json();
          setIsActive(data.isActive);
          setProvider(data.provider || "gemini");
          setApiKey(data.apiKey || "");
          setPrompt(data.prompt || "You are a helpful WhatsApp assistant.");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, [deviceId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/devices/${deviceId}/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive, provider, apiKey, prompt }),
      });
      if (!res.ok) throw new Error("Failed to save");
      alert("AI Configuration saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save AI configuration");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/devices")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary" />
            AI Chat Configuration
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Configure the AI Assistant for this specific WhatsApp device.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-8">
        <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border">
          <div className="space-y-0.5">
            <Label className="text-base font-bold">Enable AI Auto-Reply</Label>
            <p className="text-sm text-muted-foreground">If enabled, the AI will reply to incoming messages when no other auto-reply rules match.</p>
          </div>
          <Switch checked={isActive} onCheckedChange={setIsActive} />
        </div>

        <div className="grid gap-4">
          <Label htmlFor="provider" className="font-bold">AI Provider</Label>
          <select 
            id="provider"
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
          >
            <option value="gemini">Google Gemini (Recommended)</option>
            <option value="openai">OpenAI (ChatGPT)</option>
          </select>
          <p className="text-xs text-muted-foreground">We recommend Gemini 2.5 Flash for speed and generous free tier.</p>
        </div>

        <div className="grid gap-4">
          <Label htmlFor="apiKey" className="font-bold">API Key</Label>
          <Input 
            id="apiKey" 
            type="password"
            placeholder={`Enter your ${provider === 'gemini' ? 'Gemini' : 'OpenAI'} API Key`}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            {provider === 'gemini' ? "Get your key from Google AI Studio." : "Get your key from OpenAI Platform."}
          </p>
        </div>

        <div className="grid gap-4">
          <Label htmlFor="prompt" className="font-bold">System Prompt (AI Persona)</Label>
          <Textarea 
            id="prompt" 
            placeholder="You are a helpful customer service assistant for our store. Be polite and concise."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[150px]"
          />
          <p className="text-xs text-muted-foreground">Instruct the AI on how it should behave, its tone, and its main purpose.</p>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
        >
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save AI Configuration
        </Button>
      </div>
    </div>
  );
}
