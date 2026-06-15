"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Bot, Save, Settings, BookOpen, Link2, Clock, ListChecks, Network, User as UserIcon, RefreshCw, Plus, BellRing, FileText, Image as ImageIcon, Globe, LayoutDashboard, ShoppingCart, DollarSign, Calendar, ShieldCheck, Table, MapPin, BadgeCheck, Zap, Eye, Edit2, Trash2 } from "lucide-react";
import { ReactFlow, Background, Controls, Node, Edge, addEdge, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

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
  
  // React Flow State
  const initialNodes: Node[] = [
    { id: '1', position: { x: 50, y: 50 }, data: { label: 'Supervisor Agent' }, type: 'input' },
    { id: '2', position: { x: 50, y: 200 }, data: { label: 'Sales Agent' } },
  ];
  const initialEdges: Edge[] = [{ id: 'e1-2', source: '1', target: '2', label: 'If asking about price', animated: true }];
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Extensibility State
  const [knowledgeSources, setKnowledgeSources] = useState<any[]>([]);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [togglingIntegration, setTogglingIntegration] = useState<string | null>(null);
  const [activeSettingsApp, setActiveSettingsApp] = useState<{name: string, desc: string} | null>(null);

  // Custom AI Tool State
  const [isCustomToolModalOpen, setIsCustomToolModalOpen] = useState(false);
  const [newToolName, setNewToolName] = useState("");
  const [newToolDesc, setNewToolDesc] = useState("");
  const [newToolUrl, setNewToolUrl] = useState("");
  const [isAddingTool, setIsAddingTool] = useState(false);
  const [isDeletingTool, setIsDeletingTool] = useState<string | null>(null);

  // Sandbox Chat State
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    
    const userMessage = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setIsChatLoading(true);

    try {
      const res = await fetch(`/api/devices/${deviceId}/sandbox`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMessage,
          history: chatMessages 
        })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to get reply");
      
      setChatMessages(prev => [...prev, { role: "model", text: data.reply }]);
    } catch (error: any) {
      setChatMessages(prev => [...prev, { role: "model", text: `Error: ${error.message}` }]);
    } finally {
      setIsChatLoading(false);
    }
  };

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

        // Fetch Knowledge Sources
        const ksRes = await fetch(`/api/devices/${deviceId}/ai-knowledge`);
        if (ksRes.ok) setKnowledgeSources(await ksRes.json());

        // Fetch Integrations
        await fetchIntegrations();

        // Fetch Orchestration
        const orchRes = await fetch(`/api/devices/${deviceId}/ai-orchestration`);
        if (orchRes.ok) {
          const orchData = await orchRes.json();
          if (orchData.nodes && orchData.nodes.length > 0) {
            setNodes(orchData.nodes.map((n: any) => ({
              id: n.id,
              type: n.isEntryNode ? 'input' : 'default',
              position: { x: n.positionX, y: n.positionY },
              data: { label: n.name, prompt: n.prompt }
            })));
          }
          if (orchData.edges && orchData.edges.length > 0) {
            setEdges(orchData.edges.map((e: any) => ({
              id: e.id,
              source: e.sourceId,
              target: e.targetId,
              label: e.condition,
              animated: true
            })));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [deviceId, setNodes, setEdges]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const text = await file.text();
      const res = await fetch(`/api/devices/${deviceId}/ai-knowledge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: file.name, type: "file", content: text }),
      });
      if (res.ok) {
        const newSource = await res.json();
        setKnowledgeSources([newSource, ...knowledgeSources]);
      } else {
        alert("Failed to upload knowledge source");
      }
    } catch (err) {
      console.error("Upload error", err);
      alert("Error reading file. Only text-based files are supported currently.");
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleDeleteKnowledge = async (sourceId: string) => {
    try {
      const res = await fetch(`/api/devices/${deviceId}/ai-knowledge/${sourceId}`, { method: "DELETE" });
      if (res.ok) {
        setKnowledgeSources(knowledgeSources.filter(s => s.id !== sourceId));
      }
    } catch (err) {
      console.error("Failed to delete", err);
     } finally {
      // setIsToggling(false);
    }
  };

  const fetchIntegrations = async () => {
    const intRes = await fetch(`/api/devices/${deviceId}/ai-integrations`);
    if (intRes.ok) setIntegrations(await intRes.json());
  };

  const handleAddCustomTool = async () => {
    if (!newToolName || !newToolUrl) return;
    setIsAddingTool(true);
    try {
      const res = await fetch(`/api/devices/${deviceId}/ai-integrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: newToolName.replace(/\s+/g, "_"), // Enforce no spaces for tool names
          description: newToolDesc,
          webhookUrl: newToolUrl
        })
      });
      if (res.ok) {
        await fetchIntegrations();
        setIsCustomToolModalOpen(false);
        setNewToolName("");
        setNewToolDesc("");
        setNewToolUrl("");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to add tool");
      }
    } catch (e) {
      alert("Something went wrong");
    } finally {
      setIsAddingTool(false);
    }
  };

  const handleDeleteCustomTool = async (toolId: string) => {
    if (!confirm("Are you sure you want to delete this tool?")) return;
    setIsDeletingTool(toolId);
    try {
      const res = await fetch(`/api/devices/${deviceId}/ai-integrations?toolId=${toolId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        await fetchIntegrations();
      } else {
        alert("Failed to delete tool");
      }
    } catch (e) {
      alert("Something went wrong");
    } finally {
      setIsDeletingTool(null);
    }
  };

  const handleToggleIntegration = async (name: string, currentStatus: boolean) => {
    setTogglingIntegration(name);
    try {
      const res = await fetch(`/api/devices/${deviceId}/ai-integrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, isActive: !currentStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setIntegrations(prev => {
          const exists = prev.find(i => i.name === name);
          if (exists) return prev.map(i => i.name === name ? updated : i);
          return [...prev, updated];
        });
      }
    } catch (err) {
      console.error("Failed to toggle integration", err);
    } finally {
      setTogglingIntegration(null);
    }
  };

  const handleSaveOrchestration = async () => {
    setSaving(true);
    try {
      const payload = {
        nodes: nodes.map(n => ({
          id: n.id,
          type: n.type,
          position: n.position,
          data: n.data
        })),
        edges: edges.map(e => ({
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.label
        }))
      };
      
      const res = await fetch(`/api/devices/${deviceId}/ai-orchestration`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (res.ok) {
        alert("Orchestration flow saved successfully!");
      } else {
        alert("Failed to save orchestration flow");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while saving the orchestration flow");
    } finally {
      setSaving(false);
    }
  };

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
    switch (activeTab) {
      case "General":
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
                className="min-h-[200px] max-h-[400px] overflow-y-auto font-mono text-sm resize-y rounded-md"
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

      case "Knowledge Sources":
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="text-center space-y-1 mb-8">
               <h3 className="text-2xl font-bold">Knowledge Base (RAG)</h3>
               <p className="text-muted-foreground text-sm">Upload documents or add text for the AI to learn from.</p>
            </div>
            
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center bg-secondary/20 hover:bg-secondary/40 transition-colors relative">
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                accept=".txt" 
                onChange={handleFileUpload}
                disabled={uploading}
              />
              <BookOpen className="w-10 h-10 mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="font-semibold text-foreground">Click to upload or drag and drop</p>
              <p className="text-sm text-muted-foreground mt-1">Only .TXT supported for now (Max 5MB)</p>
              <Button variant="outline" className="mt-4" disabled={uploading}>
                {uploading ? "Uploading..." : "Browse Files"}
              </Button>
            </div>
            
            <div className="space-y-4 mt-8">
              <h4 className="font-bold text-lg">Stored Knowledge</h4>
              {knowledgeSources.length === 0 ? (
                <div className="bg-card border border-border rounded-lg p-4 text-center text-sm text-muted-foreground">
                  No knowledge sources added yet.
                </div>
              ) : (
                <div className="grid gap-3">
                  {knowledgeSources.map((source) => (
                    <div key={source.id} className="flex items-center justify-between p-4 border border-border bg-card rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="font-semibold text-sm">{source.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(source.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteKnowledge(source.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case "Integrations":
        return (
          <div className="space-y-12 animate-in fade-in duration-300">
            {/* Connected Apps Section */}
            <section>
              <div className="mb-6">
                 <h3 className="text-xl font-bold">Connected Apps</h3>
                 <p className="text-muted-foreground text-sm">Connect your chatbot with third-party applications to extend its functionality.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[
                  { name: "Send Personal Notification", desc: "Send personal notifications to your phone number when a customer places an order or performs a specific activity", icon: BellRing, colorClass: "text-blue-600 dark:text-blue-300", bgClass: "bg-blue-100 dark:bg-blue-900" },
                  { name: "File Generator", desc: "Generates files in formats such as .csv, .xlsx, etc., based on the provided prompt", icon: FileText, colorClass: "text-orange-600 dark:text-orange-300", bgClass: "bg-orange-100 dark:bg-orange-900" },
                  { name: "Image Edit", desc: "Edit and create images based on prompts or images provided by users", icon: ImageIcon, colorClass: "text-blue-500 dark:text-blue-300", bgClass: "bg-blue-100 dark:bg-blue-900" },
                  { name: "Web Search", desc: "Search the web for up-to-date information to answer customer questions with real-time data", icon: Globe, colorClass: "text-gray-700 dark:text-gray-300", bgClass: "bg-gray-100 dark:bg-gray-800" },
                  { name: "CRM Integration", desc: "Connect AI with your CRM to retrieve data and create or update records in the CRM", icon: LayoutDashboard, colorClass: "text-blue-600 dark:text-blue-400", bgClass: "bg-blue-50 dark:bg-blue-900/30" },
                  { name: "Orders", desc: "Connect AI with the Orders system so AI can create orders automatically", icon: ShoppingCart, colorClass: "text-purple-600 dark:text-purple-400", bgClass: "bg-purple-50 dark:bg-purple-900/30" },
                  { name: "Check Shipping Cost", desc: "Check shipping rates from various couriers and get delivery status", icon: DollarSign, colorClass: "text-yellow-600 dark:text-yellow-400", bgClass: "bg-yellow-100 dark:bg-yellow-900/50" },
                  { name: "Auto Reminder", desc: "Create reminders to perform specific tasks at a specific time", icon: Calendar, colorClass: "text-red-500 dark:text-red-400", bgClass: "bg-red-100 dark:bg-red-900/50" },
                  { name: "Allow List (Whitelist numbers)", desc: "Create a list of phone numbers allowed to interact with this AI and block the rest", icon: ShieldCheck, colorClass: "text-orange-600 dark:text-orange-400", bgClass: "bg-orange-100 dark:bg-orange-900/50" },
                  { name: "Google Sheets", desc: "Connect to Google Sheets to read and write data", icon: Table, colorClass: "text-green-600 dark:text-green-400", bgClass: "bg-green-100 dark:bg-green-900/50" },
                  { name: "Nearest Location", desc: "Find the nearest location to the customer", icon: MapPin, colorClass: "text-red-500 dark:text-red-400", bgClass: "bg-red-100 dark:bg-red-900/50" },
                  { name: "Netzme", desc: "Transaction payments via QRIS", icon: Zap, colorClass: "text-white", bgClass: "bg-blue-500" }
                ].map((app, idx) => {
                  const isActive = integrations.find(i => i.name === app.name)?.isActive || false;
                  const Icon = app.icon;
                  const isToggling = togglingIntegration === app.name;

                  return (
                    <div key={idx} className={`border rounded-xl p-5 flex flex-col relative overflow-hidden ${isActive ? 'border-green-400 bg-green-50/30 dark:bg-green-950/10' : 'border-border bg-card'}`}>
                      <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className={`p-2 rounded-lg ${app.bgClass} ${app.colorClass}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className={`flex items-center gap-1.5 text-xs ${isActive ? 'font-semibold text-green-600' : 'text-muted-foreground'}`}>
                          {isActive ? 'Active' : 'Inactive'} <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        </div>
                      </div>
                      <h4 className="font-bold text-base mb-1 relative z-10">{app.name}</h4>
                      <p className="text-xs text-muted-foreground mb-6 flex-1 relative z-10">{app.desc}</p>
                      <div className="flex items-center gap-2 relative z-10">
                        <Button variant="outline" size="sm" className={`flex-1 h-8 text-xs ${isActive ? 'bg-white hover:bg-gray-50' : ''}`} onClick={() => setActiveSettingsApp({name: app.name, desc: app.desc})}>Settings</Button>
                        <Button 
                          variant={isActive ? "default" : "outline"} 
                          size="sm" 
                          className={`flex-1 h-8 text-xs ${isActive ? 'bg-green-500 hover:bg-green-600 text-white' : ''}`}
                          onClick={() => handleToggleIntegration(app.name, isActive)}
                          disabled={isToggling}
                        >
                          {isToggling ? 'Wait...' : (isActive ? 'Active' : 'Activate')}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* AI Tools Section */}
            <section>
              <div className="mb-6 flex items-center gap-4">
                 <h3 className="text-xl font-bold">AI Tools</h3>
                 <Button variant="outline" size="sm" className="h-8 text-xs rounded-full">
                    <Settings className="w-3.5 h-3.5 mr-2" />
                    Open AI Tools Settings
                 </Button>
              </div>
              <p className="text-muted-foreground text-sm mb-6">Enable AI tools to enhance your chatbot's capabilities with additional functionalities.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {integrations.filter(i => i.provider === 'custom').map((tool, idx) => {
                  const isActive = tool.isActive;
                  const isToggling = togglingIntegration === tool.name;

                  return (
                    <div key={tool.id} className={`border rounded-xl p-5 flex flex-col relative overflow-hidden ${isActive ? 'border-green-400 bg-green-50/30 dark:bg-green-950/10' : 'border-border bg-card'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className={`flex items-center gap-1.5 text-xs ${isActive ? 'font-semibold text-green-600' : 'text-muted-foreground'}`}>
                          {isActive ? 'Active' : 'Inactive'} <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-muted-foreground hover:text-destructive -mr-2 -mt-2"
                          onClick={() => handleDeleteCustomTool(tool.id)}
                          disabled={isDeletingTool === tool.id}
                        >
                          {isDeletingTool === tool.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                        </Button>
                      </div>
                      <h4 className="font-bold text-base mb-2">{tool.name}</h4>
                      <p className="text-xs text-muted-foreground mb-6 flex-1 line-clamp-3" title={tool.description}>{tool.description}</p>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className={`flex-1 h-8 text-xs ${isActive ? 'bg-white hover:bg-gray-50' : ''}`} onClick={() => setActiveSettingsApp({name: tool.name, desc: "Webhook: " + tool.webhookUrl})}>Details</Button>
                        <Button 
                          variant={isActive ? "default" : "outline"} 
                          size="sm" 
                          className={`flex-1 h-8 text-xs ${isActive ? 'bg-green-500 hover:bg-green-600 text-white' : ''}`}
                          onClick={() => handleToggleIntegration(tool.name, isActive)}
                          disabled={isToggling}
                        >
                          {isToggling ? 'Wait...' : (isActive ? 'Active' : 'Activate')}
                        </Button>
                      </div>
                    </div>
                  );
                })}

                <div 
                  onClick={() => setIsCustomToolModalOpen(true)}
                  className="border-2 border-dashed border-border bg-secondary/20 hover:bg-secondary/40 transition-colors rounded-xl p-5 flex flex-col items-center justify-center min-h-[160px] cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  <Plus className="w-8 h-8 mb-2" />
                  <span className="font-bold">Create Custom Tool</span>
                </div>
              </div>
            </section>

            {/* Register Third Party Apps Section */}
            <section>
              <div className="mb-6">
                 <h3 className="text-xl font-bold">Register Third Party Apps</h3>
                 <p className="text-muted-foreground text-sm">Register your third party apps to enhance your chatbot's capabilities.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <div className="border border-border bg-card rounded-xl p-5 flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500 rounded-lg text-white">
                        <Zap className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-base">Netzme</h4>
                        <p className="text-xs text-muted-foreground">Transaction payments via QRIS</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                    </div>
                  </div>
                  <div className="mt-4 relative z-10">
                    <Button variant="outline" size="sm" className="h-8 text-xs w-24">Register</Button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        );

      case "Followups":
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="text-center space-y-1 mb-8">
               <h3 className="text-2xl font-bold">Auto Follow-ups</h3>
               <p className="text-muted-foreground text-sm">Automate replies when customers stop responding.</p>
            </div>

            <div className="p-4 border border-border rounded-lg bg-card space-y-4">
              <div className="flex items-center justify-between">
                <Label className="font-bold">Condition: No Reply For</Label>
                <select className="p-2 border border-border rounded-md text-sm">
                  <option value="1h">1 Hour</option>
                  <option value="24h">24 Hours</option>
                  <option value="48h">48 Hours</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Follow-up Action / Prompt</Label>
                <Textarea placeholder="e.g. Ask the user if they still need help with the pricing..." />
              </div>
              <Button variant="secondary" className="w-full">Add Rule</Button>
            </div>
          </div>
        );

      case "Evaluation":
        const dummyEvals = [
          { name: "test chat", response: "Untuk motor Nmax Turbo, kaka mau tipe yang apa? Motor Nmax Turbo ada beberapa tipe yaitu : - Nm...", date: "16/09/2025, 09.53" },
          { name: "esra", response: "Baik kak, untuk perbandingan antara *Honda Beat* dan *Yamaha Gear 125*, berikut beberapa poinny...", date: "22/08/2025, 11.34" },
          { name: "Rizal Yamaha SIP MGS", response: "Untuk Yamaha Jupiter Z CW FI di wilayah Plat G, berikut informasinya: 1. *Model*: Jupiter Z CW FI - *...", date: "25/07/2025, 14.03" },
          { name: "test chat", response: "Baik kak, untuk perbandingan Fazzio dan Scoopy, berikut beberapa poinnya: **Scoopy:** - Desain yan...", date: "22/07/2025, 10.23" },
          { name: "test chat", response: "Baik kak, untuk perbandingan Aerox dan PCX, berikut beberapa poinnya: **PCX:** - Dikenal dengan d...", date: "22/07/2025, 10.20" },
        ];
        return (
          <div className="space-y-6 animate-in fade-in duration-300 w-full max-w-full">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-bold">AI Evaluation Documents</h3>
            </div>
            
            <div className="bg-white dark:bg-card border border-border rounded-lg overflow-hidden shadow-sm overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/40 text-muted-foreground uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Contact Name</th>
                    <th className="px-6 py-4 font-semibold w-1/2">Ai Response</th>
                    <th className="px-6 py-4 font-semibold whitespace-nowrap">Created At</th>
                    <th className="px-6 py-4 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {dummyEvals.map((evalDoc, idx) => (
                    <tr key={idx} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4 font-medium">{evalDoc.name}</td>
                      <td className="px-6 py-4 text-muted-foreground truncate max-w-[200px] md:max-w-[400px]">{evalDoc.response}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{evalDoc.date}</td>
                      <td className="px-6 py-4 flex items-center justify-center gap-2">
                        <button className="p-1.5 text-blue-500 border border-blue-200 bg-blue-50 hover:bg-blue-100 rounded transition-colors" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-amber-500 border border-amber-200 bg-amber-50 hover:bg-amber-100 rounded transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-red-500 border border-red-200 bg-red-50 hover:bg-red-100 rounded transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "Orchestration":
        return (
          <div className="space-y-6 animate-in fade-in duration-300 h-full flex flex-col">
            <div className="text-center space-y-1 mb-4 flex-shrink-0">
               <h3 className="text-2xl font-bold">Agent Orchestrator</h3>
               <p className="text-muted-foreground text-sm">Drag and drop to route between multiple AI Personas.</p>
            </div>
            
            <div className="flex-1 w-full border border-border rounded-lg overflow-hidden bg-white/50 relative min-h-[400px]">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
              >
                <Background />
                <Controls />
              </ReactFlow>
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <Button size="sm" variant="secondary" className="shadow-md">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Agent Node
                </Button>
                <Button size="sm" className="shadow-md bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSaveOrchestration} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Flow
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
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
      <div className={`flex-1 grid gap-0 overflow-hidden relative ${activeTab === "General" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
        
        {/* Left Side: Configuration */}
        <div className="h-full overflow-y-auto p-6 md:p-10 pb-32">
          <div className={`${activeTab === "General" ? "max-w-2xl" : activeTab === "Evaluation" ? "max-w-7xl" : "max-w-4xl"} mx-auto`}>
            {renderTabContent()}
          </div>
        </div>

        {/* Right Side: Chat Preview */}
        {activeTab === "General" && (
        <div className="h-full border-l border-border/50 bg-[#f9fafb] dark:bg-card/30 hidden lg:block p-8 pb-32">
          <div className="bg-white dark:bg-background border border-border/60 shadow-lg rounded-[1.5rem] h-[80vh] max-h-[800px] flex flex-col overflow-hidden max-w-md mx-auto relative">
            {/* Phone Header */}
            <div className="bg-white dark:bg-background border-b border-border/40 p-4 flex items-center justify-between shadow-sm z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="font-semibold text-[15px]">Sandbox Preview</span>
              </div>
              <button 
                onClick={() => setChatMessages([])}
                className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-secondary"
                title="Reset Chat"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            
            {/* Phone Body (Chat Area) */}
            <div 
              ref={chatContainerRef}
              className="flex-1 bg-[#efeae2] dark:bg-[#0b141a] p-4 flex flex-col overflow-y-auto gap-4"
            >
              {chatMessages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                  <Bot className="w-12 h-12 mx-auto mb-3" />
                  <p className="text-sm font-medium">Chat Preview Sandbox</p>
                  <p className="text-xs mt-1">Test your AI agent here</p>
                </div>
              ) : (
                chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-sm' 
                        : 'bg-white dark:bg-zinc-800 text-foreground border border-border/50 rounded-tl-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-zinc-800 text-foreground border border-border/50 rounded-2xl rounded-tl-sm px-4 py-3 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>

            {/* Phone Input Area */}
            <div className="bg-white dark:bg-background border-t border-border/40 p-3 flex gap-2 items-end">
              <Textarea 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendChatMessage();
                  }
                }}
                placeholder="Type a message..."
                className="min-h-[40px] max-h-[120px] resize-none rounded-xl bg-secondary/50 border-transparent focus-visible:ring-1"
                rows={1}
              />
              <Button 
                onClick={handleSendChatMessage}
                disabled={!chatInput.trim() || isChatLoading}
                size="icon" 
                className="h-10 w-10 shrink-0 rounded-xl bg-blue-600 hover:bg-blue-700"
              >
                <Zap className="w-4 h-4 text-white" />
              </Button>
            </div>
          </div>
        </div>
        )}
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

      {/* Settings Dialog */}
      <Dialog open={!!activeSettingsApp} onOpenChange={(open) => !open && setActiveSettingsApp(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settings: {activeSettingsApp?.name}</DialogTitle>
            <DialogDescription>
              {activeSettingsApp?.desc}
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-3 bg-secondary/30 rounded-full border border-border">
              <Settings className="w-8 h-8 text-muted-foreground opacity-50" />
            </div>
            <p className="text-sm text-muted-foreground max-w-[250px]">
              Advanced configuration for this integration is currently under development. It will be available in the next update.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setActiveSettingsApp(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Custom Tool Dialog */}
      <Dialog open={isCustomToolModalOpen} onOpenChange={setIsCustomToolModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Custom AI Tool</DialogTitle>
            <DialogDescription>
              Create a custom webhook tool that the AI can trigger. Tool names should not contain spaces.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="tool-name">Tool Name (e.g., check_shipping_cost)</Label>
              <Input
                id="tool-name"
                placeholder="No spaces allowed"
                value={newToolName}
                onChange={(e) => setNewToolName(e.target.value.replace(/\s+/g, "_"))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tool-desc">Description (Instructions for AI)</Label>
              <Textarea
                id="tool-desc"
                placeholder="Explain to the AI when and how to use this tool."
                value={newToolDesc}
                onChange={(e) => setNewToolDesc(e.target.value)}
                className="h-20"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tool-url">Webhook URL</Label>
              <Input
                id="tool-url"
                placeholder="https://api.yourdomain.com/endpoint"
                value={newToolUrl}
                onChange={(e) => setNewToolUrl(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCustomToolModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCustomTool} disabled={isAddingTool || !newToolName || !newToolUrl}>
              {isAddingTool ? "Saving..." : "Add Tool"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
