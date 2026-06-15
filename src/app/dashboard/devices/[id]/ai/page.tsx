"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Bot, Save, Settings, BookOpen, Link2, Clock, ListChecks, Network, User as UserIcon, RefreshCw } from "lucide-react";

export default function AiConfigPage() {
  const params = useParams();
  const router = useRouter();
  const deviceId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Device data
  const [device, setDevice] = useState<any>(null);
  
  // Tab State
  const [activeTab, setActiveTab] = useState("General");
  
  // AI Config State
  const [isActive, setIsActive] = useState(false);
  const [provider, setProvider] = useState("gemini");
  const [apiKey, setApiKey] = useState("");
  const [prompt, setPrompt] = useState("");

  const tabs = [
    { id: "General", icon: Settings },
    { id: "Knowledge Sources", icon: BookOpen },
    { id: "Integrations", icon: Link2 },
    { id: "Followups", icon: Clock },
    { id: "Evaluation", icon: ListChecks },
    { id: "Orchestration", icon: Network },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Device details
        const devRes = await fetch(`/api/devices/${deviceId}`);
        if (devRes.ok) {
          const devData = await devRes.json();
          setDevice(devData);
        }

        // Fetch AI Config
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
    fetchData();
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

  const renderTabContent = () => {
    if (activeTab === "General") {
      return (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="text-center space-y-1 mb-8">
             <h3 className="text-2xl font-bold">{device?.name || "Device Name"}</h3>
             <p className="text-muted-foreground text-sm">Description</p>
             <p className="text-xs font-semibold mt-2">Last Trained: 10:17</p>
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <h4 className="text-[#38bdf8] font-bold text-lg">AI Agent Behavior</h4>
              <p className="text-sm text-muted-foreground">This is the AI Prompt that defines the AI's speaking style and identity.</p>
            </div>
            
            <Textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[300px] font-mono text-sm resize-y rounded-md"
              placeholder="Enter your system prompt here..."
            />
          </div>

          <div className="space-y-4 mt-8 pt-8 border-t border-border/50">
            <h4 className="font-bold text-lg text-center text-foreground">Advanced Settings</h4>
            
            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border">
              <div className="space-y-0.5">
                <Label className="text-base font-bold">Enable AI Auto-Reply</Label>
                <p className="text-sm text-muted-foreground">If enabled, the AI will reply to incoming messages.</p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>

            <div className="grid gap-4">
              <Label htmlFor="provider" className="font-bold">AI Provider</Label>
              <select 
                id="provider"
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
              >
                <option value="gemini">Google Gemini</option>
                <option value="openai">OpenAI (ChatGPT)</option>
              </select>
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
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-64 text-center animate-in fade-in duration-300">
        <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mb-4">
          <Bot className="w-8 h-8 text-muted-foreground opacity-50" />
        </div>
        <h3 className="font-bold text-lg text-foreground">{activeTab}</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
          This section is currently under construction. Check back later for updates.
        </p>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-500 bg-background">
      
      {/* Header Back Button */}
      <div className="px-6 py-4 flex items-center">
        <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary" onClick={() => router.push("/dashboard/devices")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Devices
        </Button>
      </div>

      {/* Main Title Area */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold tracking-tight">{device?.name || "Loading..."}</h2>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-border/50">
        <div className="flex items-center justify-center gap-2 md:gap-8 overflow-x-auto px-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-3 px-2 border-b-2 transition-all font-semibold text-sm whitespace-nowrap
                  ${isSelected 
                    ? "border-primary text-primary" 
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
              >
                <Icon className="w-4 h-4" />
                {tab.id}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area - Split View */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden relative">
        
        {/* Left Side: Configuration */}
        <div className="h-full overflow-y-auto p-6 md:p-10 pb-32">
          <div className="max-w-2xl mx-auto">
            {renderTabContent()}
          </div>
        </div>

        {/* Right Side: Chat Preview */}
        <div className="h-full border-l border-border/50 bg-[#f9fafb] dark:bg-card/30 hidden lg:block p-8 pb-32">
          <div className="bg-white dark:bg-background border border-border/60 shadow-lg rounded-[1.5rem] h-[80vh] max-h-[800px] flex flex-col overflow-hidden max-w-md mx-auto relative">
            {/* Phone Header */}
            <div className="bg-white dark:bg-background border-b border-border/40 p-4 flex items-center justify-between shadow-sm z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="font-semibold text-[15px]">{device?.name || "Device Name"}</span>
              </div>
              <button className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-secondary">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            
            {/* Phone Body (Chat Area) */}
            <div className="flex-1 bg-[#efeae2] dark:bg-[#0b141a] p-4 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="text-center opacity-40">
                  <Bot className="w-12 h-12 mx-auto mb-3" />
                  <p className="text-sm font-medium">Chat Preview Sandbox</p>
                  <p className="text-xs mt-1">Test your AI agent here</p>
                </div>
            </div>
          </div>
        </div>

      </div>

      {/* Sticky Bottom Save Button */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-background border-t border-border/50 p-4 flex justify-center z-50">
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-[#94a3b8] hover:bg-[#64748b] text-white px-8 rounded-md font-semibold transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Save AI Settings
        </Button>
      </div>

    </div>
  );
}
