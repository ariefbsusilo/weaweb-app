"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Bot, Save, Settings, BookOpen, Link2, Clock, ListChecks, Network, User as UserIcon, RefreshCw, Plus, BellRing, FileText, Image as ImageIcon, Globe, LayoutDashboard, ShoppingCart, DollarSign, Calendar, ShieldCheck, Table, MapPin, BadgeCheck, Zap } from "lucide-react";
import { ReactFlow, Background, Controls, Node, Edge, addEdge, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

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

      case "Knowledge Sources":
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="text-center space-y-1 mb-8">
               <h3 className="text-2xl font-bold">Knowledge Base (RAG)</h3>
               <p className="text-muted-foreground text-sm">Upload documents or add text for the AI to learn from.</p>
            </div>
            
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center bg-secondary/20 hover:bg-secondary/40 transition-colors cursor-pointer">
              <BookOpen className="w-10 h-10 mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="font-semibold text-foreground">Click to upload or drag and drop</p>
              <p className="text-sm text-muted-foreground mt-1">PDF, TXT, or DOCX (Max 5MB)</p>
              <Button variant="outline" className="mt-4">Browse Files</Button>
            </div>
            
            <div className="space-y-4 mt-8">
              <h4 className="font-bold text-lg">Stored Knowledge</h4>
              <div className="bg-card border border-border rounded-lg p-4 text-center text-sm text-muted-foreground">
                No knowledge sources added yet.
              </div>
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
                {/* Active Card */}
                <div className="border border-green-400 bg-green-50/30 dark:bg-green-950/10 rounded-xl p-5 flex flex-col relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg text-blue-600 dark:text-blue-300">
                      <BellRing className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
                      Active <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    </div>
                  </div>
                  <h4 className="font-bold text-base mb-1">Send Personal Notification</h4>
                  <p className="text-xs text-muted-foreground mb-6 flex-1">Send personal notifications to your phone number when a customer places an order or performs a specific activity</p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="bg-white hover:bg-gray-50 flex-1 h-8 text-xs">Settings</Button>
                    <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white flex-1 h-8 text-xs">Active</Button>
                  </div>
                </div>

                {/* Inactive Cards */}
                <div className="border border-border bg-card rounded-xl p-5 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg text-orange-600 dark:text-orange-300">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      Inactive <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                    </div>
                  </div>
                  <h4 className="font-bold text-base mb-1">File Generator</h4>
                  <p className="text-xs text-muted-foreground mb-6 flex-1">Generates files in formats such as .csv, .xlsx, etc., based on the provided prompt</p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">Settings</Button>
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">Activate</Button>
                  </div>
                </div>

                <div className="border border-border bg-card rounded-xl p-5 flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg text-blue-500 dark:text-blue-300">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      Inactive <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                    </div>
                  </div>
                  <h4 className="font-bold text-base mb-1 relative z-10">Image Edit</h4>
                  <p className="text-xs text-muted-foreground mb-6 flex-1 relative z-10">Edit and create images based on prompts or images provided by users</p>
                  <div className="flex items-center gap-2 relative z-10">
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">Settings</Button>
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">Activate</Button>
                  </div>
                </div>

                <div className="border border-border bg-card rounded-xl p-5 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300">
                      <Globe className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      Inactive <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                    </div>
                  </div>
                  <h4 className="font-bold text-base mb-1">Web Search</h4>
                  <p className="text-xs text-muted-foreground mb-6 flex-1">Search the web for up-to-date information to answer customer questions with real-time data</p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">Settings</Button>
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">Activate</Button>
                  </div>
                </div>

                <div className="border border-border bg-card rounded-xl p-5 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                      <LayoutDashboard className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      Inactive <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                    </div>
                  </div>
                  <h4 className="font-bold text-base mb-1">CRM Integration</h4>
                  <p className="text-xs text-muted-foreground mb-6 flex-1">Connect AI with your CRM to retrieve data and create or update records in the CRM</p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">Settings</Button>
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">Activate</Button>
                  </div>
                </div>

                <div className="border border-border bg-card rounded-xl p-5 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                      <ShoppingCart className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      Inactive <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                    </div>
                  </div>
                  <h4 className="font-bold text-base mb-1">Orders</h4>
                  <p className="text-xs text-muted-foreground mb-6 flex-1">Connect AI with the Orders system so AI can create orders automatically</p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">Settings</Button>
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">Activate</Button>
                  </div>
                </div>

                <div className="border border-border bg-card rounded-xl p-5 flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg text-yellow-600 dark:text-yellow-400">
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      Inactive <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                    </div>
                  </div>
                  <h4 className="font-bold text-base mb-1 relative z-10">Check Shipping Cost</h4>
                  <p className="text-xs text-muted-foreground mb-6 flex-1 relative z-10">Check shipping rates from various couriers and get delivery status</p>
                  <div className="flex items-center gap-2 relative z-10">
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">Settings</Button>
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">Activate</Button>
                  </div>
                </div>

                <div className="border border-border bg-card rounded-xl p-5 flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-400/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg text-red-500 dark:text-red-400">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      Inactive <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                    </div>
                  </div>
                  <h4 className="font-bold text-base mb-1 relative z-10">Auto Reminder</h4>
                  <p className="text-xs text-muted-foreground mb-6 flex-1 relative z-10">Create reminders to perform specific tasks at a specific time</p>
                  <div className="flex items-center gap-2 relative z-10">
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">Settings</Button>
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">Activate</Button>
                  </div>
                </div>

                <div className="border border-border bg-card rounded-xl p-5 flex flex-col relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg text-orange-600 dark:text-orange-400">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      Inactive <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                    </div>
                  </div>
                  <h4 className="font-bold text-base mb-1 relative z-10">Allow List (Whitelist numbers)</h4>
                  <p className="text-xs text-muted-foreground mb-6 flex-1 relative z-10">Create a list of phone numbers allowed to interact with this AI and block the rest</p>
                  <div className="flex items-center gap-2 relative z-10">
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">Settings</Button>
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">Activate</Button>
                  </div>
                </div>

                <div className="border border-border bg-card rounded-xl p-5 flex flex-col relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg text-green-600 dark:text-green-400">
                      <Table className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      Inactive <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                    </div>
                  </div>
                  <h4 className="font-bold text-base mb-1 relative z-10">Google Sheets</h4>
                  <p className="text-xs text-muted-foreground mb-6 flex-1 relative z-10">Connect to Google Sheets to read and write data</p>
                  <div className="flex items-center gap-2 relative z-10">
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">Settings</Button>
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">Activate</Button>
                  </div>
                </div>

                <div className="border border-border bg-card rounded-xl p-5 flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg text-red-500 dark:text-red-400">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      Inactive <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                    </div>
                  </div>
                  <h4 className="font-bold text-base mb-1 relative z-10">Nearest Location</h4>
                  <p className="text-xs text-muted-foreground mb-6 flex-1 relative z-10">Find the nearest location to the customer</p>
                  <div className="flex items-center gap-2 relative z-10">
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">Settings</Button>
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">Activate</Button>
                  </div>
                </div>

                <div className="border border-border bg-card rounded-xl p-5 flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="p-2 bg-blue-500 rounded-lg text-white">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      Inactive <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                    </div>
                  </div>
                  <h4 className="font-bold text-base mb-1 relative z-10">Netzme</h4>
                  <p className="text-xs text-muted-foreground mb-6 flex-1 relative z-10">Transaction payments via QRIS</p>
                  <div className="flex items-center gap-2 relative z-10">
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">Settings</Button>
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">Activate</Button>
                  </div>
                </div>
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
                <div className="border border-green-400 bg-green-50/30 dark:bg-green-950/10 rounded-xl p-5 flex flex-col relative overflow-hidden">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
                      Active <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    </div>
                  </div>
                  <h4 className="font-bold text-base mb-2">nearest_store_locator</h4>
                  <p className="text-xs text-muted-foreground mb-6 flex-1">Use this if user is asking about nearest store. This tool uses customer's address to find the nearest outlet.</p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="bg-white hover:bg-gray-50 flex-1 h-8 text-xs">Settings</Button>
                    <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white flex-1 h-8 text-xs">Active</Button>
                  </div>
                </div>

                <div className="border border-green-400 bg-green-50/30 dark:bg-green-950/10 rounded-xl p-5 flex flex-col relative overflow-hidden">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
                      Active <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    </div>
                  </div>
                  <h4 className="font-bold text-base mb-2">Product_Catalog</h4>
                  <p className="text-xs text-muted-foreground mb-6 flex-1">Find the available products based on product search query given by the customer.</p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="bg-white hover:bg-gray-50 flex-1 h-8 text-xs">Settings</Button>
                    <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white flex-1 h-8 text-xs">Active</Button>
                  </div>
                </div>

                <div className="border border-green-400 bg-green-50/30 dark:bg-green-950/10 rounded-xl p-5 flex flex-col relative overflow-hidden">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
                      Active <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    </div>
                  </div>
                  <h4 className="font-bold text-base mb-2">Leads Customer</h4>
                  <p className="text-xs text-muted-foreground mb-6 flex-1">WAJIB Gunakan untuk mendata customer, panggil tools ketika : 1. Leads / chat pertama dari customer muncul, get data seperti Nama / Display name dan Nomer Telepon</p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="bg-white hover:bg-gray-50 flex-1 h-8 text-xs">Settings</Button>
                    <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white flex-1 h-8 text-xs">Active</Button>
                  </div>
                </div>

                <div className="border border-border bg-card rounded-xl p-5 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      Inactive <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                    </div>
                  </div>
                  <h4 className="font-bold text-base mb-2">Store_Database</h4>
                  <p className="text-xs text-muted-foreground mb-6 flex-1">Find the store based on store name search query given by the customer.</p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">Settings</Button>
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">Activate</Button>
                  </div>
                </div>

                <div className="border-2 border-dashed border-border bg-secondary/20 hover:bg-secondary/40 transition-colors rounded-xl p-5 flex flex-col items-center justify-center min-h-[160px] cursor-pointer text-muted-foreground hover:text-foreground">
                  <Plus className="w-8 h-8 mb-2" />
                  <span className="font-bold">Create AI Tool</span>
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
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="text-center space-y-1 mb-8">
               <h3 className="text-2xl font-bold">AI Evaluation Logs</h3>
               <p className="text-muted-foreground text-sm">Review AI chat scores and performance feedback.</p>
            </div>
            
            <div className="flex flex-col items-center justify-center h-48 border border-border rounded-lg bg-secondary/10">
              <ListChecks className="w-8 h-8 text-muted-foreground opacity-50 mb-2" />
              <p className="text-sm text-muted-foreground">No evaluation logs available yet.</p>
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
              <div className="absolute top-4 right-4 z-10">
                <Button size="sm" className="shadow-md">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Agent Node
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
