"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Plus, Search, MonitorSmartphone, Link2, CheckCheck, 
  Smartphone, User, Diamond, Infinity, Calendar, Phone,
  Bot, GitMerge, Settings2, Database, Trash2, Edit, Loader2,
  RefreshCcw, Unplug, ShoppingCart, Key, MoreHorizontal
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from "qrcode.react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function DevicesPage() {
  const [search, setSearch] = useState("");
  const [devices, setDevices] = useState<any[]>([]);

  // Load from API on mount
  const fetchDevices = async () => {
    try {
      const res = await fetch("/api/devices");
      const json = await res.json();
      if (json.success) {
        setDevices(json.data);
      }
    } catch (e) {
      console.error("Failed to fetch devices", e);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);
  
  // Add Device Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deviceName, setDeviceName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [provider, setProvider] = useState("baileys");
  const [officialToken, setOfficialToken] = useState("");
  const [officialPhoneId, setOfficialPhoneId] = useState("");
  const [officialWabaId, setOfficialWabaId] = useState("");

  // Edit Device Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editOfficialToken, setEditOfficialToken] = useState("");
  const [editOfficialPhoneId, setEditOfficialPhoneId] = useState("");
  const [editOfficialWabaId, setEditOfficialWabaId] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const openEditModal = (device: any) => {
    setEditingDevice(device);
    setEditName(device.name || "");
    setEditOfficialToken(device.officialToken || "");
    setEditOfficialPhoneId(device.officialPhoneId || "");
    setEditOfficialWabaId(device.officialWabaId || "");
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingDevice || !editName) return;
    setEditSaving(true);
    try {
      const res = await fetch(`/api/devices/${editingDevice.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          officialToken: editOfficialToken || null,
          officialPhoneId: editOfficialPhoneId || null,
          officialWabaId: editOfficialWabaId || null,
        })
      });
      const json = await res.json();
      if (json.success) {
        setIsEditModalOpen(false);
        fetchDevices();
      } else {
        alert(json.error || "Failed to update device");
      }
    } catch (e: any) {
      alert(e.message || "Something went wrong");
    } finally {
      setEditSaving(false);
    }
  };

  // QR Modal state
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [liveQr, setLiveQr] = useState<string | null>(null);

  // API Key Modal state
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [selectedDeviceForKey, setSelectedDeviceForKey] = useState<any>(null);
  const [generatedApiKey, setGeneratedApiKey] = useState<string | null>(null);

  const handleGenerateApiKey = async (deviceId: string) => {
    try {
      const res = await fetch(`/api/devices/${deviceId}/key`, { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setGeneratedApiKey(json.apiKey);
        fetchDevices();
      }
    } catch (error) {
      console.error("Failed to generate API Key", error);
    }
  };

  const handleConnect = async (device: any) => {
    setSelectedDevice(device);
    setLiveQr(null);
    setIsConnectModalOpen(true);

    try {
      await fetch(`/api/devices/${device.id}/connect`, {
        method: 'POST',
      });
      // We removed the alert here as requested by the user
    } catch (error) {
      console.error("Failed to start connection process", error);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isConnectModalOpen && selectedDevice) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/devices/${selectedDevice.id}/qr`);
          const json = await res.json();
          if (json.success) {
            if (json.data.qr) {
              setLiveQr(json.data.qr);
            }
            if (json.data.status === "connect") {
              // Automatically close modal and refresh when connected
              setIsConnectModalOpen(false);
              fetchDevices();
            }
          }
        } catch (e) {
          console.error("QR poll error", e);
        }
      }, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isConnectModalOpen, selectedDevice]);

  const handleAddDevice = async () => {
    if (!deviceName || !phoneNumber) return;
    
    try {
      const res = await fetch("/api/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: deviceName, 
          phoneNumber,
          provider,
          officialToken: provider === 'official' ? officialToken : null,
          officialPhoneId: provider === 'official' ? officialPhoneId : null,
          officialWabaId: provider === 'official' ? officialWabaId : null,
        })
      });
      const json = await res.json();
      
      if (json.success) {
        setDevices([json.data, ...devices]);
        setIsModalOpen(false);
        setDeviceName("");
        setPhoneNumber("");
        setProvider("baileys");
        setOfficialToken("");
        setOfficialPhoneId("");
        setOfficialWabaId("");
      } else {
        alert(json.error || "Failed to add device");
      }
    } catch (e) {
      console.error(e);
      alert("Something went wrong");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      
      {/* Simple Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border/50 rounded-lg p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-primary/10 flex items-center justify-center rounded-lg">
            <MonitorSmartphone className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-muted-foreground font-medium text-xs mb-0.5">Total Devices</p>
            <h3 className="text-2xl font-bold text-foreground">{devices.length}</h3>
          </div>
        </div>
        
        <div className="bg-card border border-border/50 rounded-lg p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-emerald-500/10 flex items-center justify-center rounded-lg">
            <Link2 className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-muted-foreground font-medium text-xs mb-0.5">Connected</p>
            <h3 className="text-2xl font-bold text-foreground">{devices.filter(d => d.status === 'connect').length}</h3>
          </div>
        </div>
        
        <div className="bg-card border border-border/50 rounded-lg p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-blue-500/10 flex items-center justify-center rounded-lg">
            <CheckCheck className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-muted-foreground font-medium text-xs mb-0.5">Messages Sent</p>
            <h3 className="text-2xl font-bold text-foreground">0</h3>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-end mt-8 mb-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Devices Management</h2>
          <p className="text-muted-foreground text-sm mt-1">Manage your connected WhatsApp numbers and AI configurations.</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger
            render={
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-medium shadow-sm h-10 px-4">
                <Plus className="w-4 h-4 mr-2" />
                Add New Device
              </Button>
            }
          />
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="font-extrabold text-2xl tracking-tight">Add Device</DialogTitle>
              <DialogDescription className="font-medium text-muted-foreground">
                Add a new device by entering its name and WhatsApp number. You will connect it via QR code later.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
              <div className="grid gap-2">
                <Label className="font-bold text-foreground">API Provider</Label>
                <div className="flex gap-4">
                  <label className={`flex items-center gap-3 border-2 p-4 rounded-xl flex-1 cursor-pointer transition-all duration-200 ${provider === 'baileys' ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/50'}`}>
                    <input 
                      type="radio" 
                      name="provider" 
                      value="baileys" 
                      checked={provider === "baileys"}
                      onChange={() => setProvider("baileys")}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${provider === 'baileys' ? 'border-primary' : 'border-slate-300 dark:border-slate-600'}`}>
                      {provider === 'baileys' && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    <div className="flex flex-col">
                      <span className={`font-bold text-sm ${provider === 'baileys' ? 'text-primary' : 'text-foreground'}`}>Baileys (QR Code)</span>
                      <span className="text-xs text-muted-foreground mt-0.5">Scan from WhatsApp App</span>
                    </div>
                  </label>
                  <label className={`flex items-center gap-3 border-2 p-4 rounded-xl flex-1 cursor-pointer transition-all duration-200 ${provider === 'official' ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/50'}`}>
                    <input 
                      type="radio" 
                      name="provider" 
                      value="official" 
                      checked={provider === "official"}
                      onChange={() => setProvider("official")}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${provider === 'official' ? 'border-primary' : 'border-slate-300 dark:border-slate-600'}`}>
                      {provider === 'official' && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    <div className="flex flex-col">
                      <span className={`font-bold text-sm ${provider === 'official' ? 'text-primary' : 'text-foreground'}`}>Official Meta API</span>
                      <span className="text-xs text-muted-foreground mt-0.5">WhatsApp Cloud API</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="grid gap-2 mt-2">
                <Label htmlFor="device-name" className="font-bold text-foreground">
                  Device Name
                </Label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="device-name"
                    placeholder="e.g. Sales WhatsApp"
                    className="rounded-lg font-medium pl-9 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus-visible:ring-primary/20"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    autoComplete="off"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone-number" className="font-bold text-foreground">
                  WhatsApp Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone-number"
                    placeholder="e.g. 6281234567890"
                    className="rounded-lg font-mono pl-9 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus-visible:ring-primary/20"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    autoComplete="tel"
                  />
                </div>
              </div>

              {provider === "official" && (
                <div className="grid gap-4 mt-2 p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border-2 border-blue-100 dark:border-blue-900/30">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCheck className="w-4 h-4 text-blue-500" />
                    <h4 className="font-bold text-sm text-blue-700 dark:text-blue-400">Meta API Credentials</h4>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="official-token" className="font-bold text-xs text-foreground">System User Access Token</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="official-token"
                        type="password"
                        placeholder="EAAI..."
                        className="rounded-lg font-mono text-sm pl-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500/20"
                        value={officialToken}
                        onChange={(e) => setOfficialToken(e.target.value)}
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="official-phone-id" className="font-bold text-xs text-foreground">Phone Number ID</Label>
                    <div className="relative">
                      <Database className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="official-phone-id"
                        placeholder="e.g. 10234567890"
                        className="rounded-lg font-mono text-sm pl-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500/20"
                        value={officialPhoneId}
                        onChange={(e) => setOfficialPhoneId(e.target.value)}
                        autoComplete="off"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="official-waba-id" className="font-bold text-xs text-foreground">WhatsApp Business Account ID (WABA)</Label>
                    <div className="relative">
                      <Database className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="official-waba-id"
                        placeholder="e.g. 10987654321"
                        className="rounded-lg font-mono text-sm pl-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500/20"
                        value={officialWabaId}
                        onChange={(e) => setOfficialWabaId(e.target.value)}
                        autoComplete="off"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground/80 mt-2 bg-white/50 dark:bg-slate-950/50 p-3 rounded-lg border border-slate-200/50 dark:border-slate-800/50">
                    <strong>Note:</strong> Incoming messages require setting up Webhooks in your Meta App Dashboard pointing to <code className="font-mono text-blue-600 dark:text-blue-400 bg-blue-100/50 dark:bg-blue-900/30 px-1 py-0.5 rounded">/api/v1/webhook/official</code>
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button 
                onClick={handleAddDevice}
                className="w-full bg-primary hover:bg-primary/90 rounded-[0.35rem] font-bold tracking-wide text-primary-foreground"
              >
                Add Device
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* QR Connect Modal */}
        <Dialog open={isConnectModalOpen} onOpenChange={setIsConnectModalOpen}>
          <DialogContent className="sm:max-w-[425px] flex flex-col items-center justify-center py-10">
            <DialogHeader className="w-full text-center mb-4">
              <DialogTitle className="font-extrabold text-2xl tracking-tight text-center w-full">Connect Device</DialogTitle>
              <DialogDescription className="font-medium text-muted-foreground text-center">
                Scan this QR Code with your WhatsApp app to connect <strong className="text-foreground">{selectedDevice?.name} ({selectedDevice?.phoneNumber})</strong>.
              </DialogDescription>
            </DialogHeader>
            <div className="w-64 h-64 bg-white rounded-xl border-4 border-primary flex items-center justify-center p-4 mb-4">
              {liveQr ? (
                <QRCodeSVG 
                  value={liveQr}
                  size={220}
                  bgColor={"#ffffff"}
                  fgColor={"#000000"}
                  level={"L"}
                  includeMargin={false}
                />
              ) : (
                <div className="w-[220px] h-[220px] bg-slate-100 flex items-center justify-center text-slate-400">
                  <RefreshCcw className="w-8 h-8 animate-spin" />
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground animate-pulse font-medium">
              {liveQr ? "Scan this QR code now..." : "Generating QR code..."}
            </p>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search & List Section */}
      <div className="space-y-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input 
            placeholder="Search devices by name or number..." 
            className="w-full bg-background border-border/50 rounded-md focus-visible:ring-primary pl-9 h-10 shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {devices.length === 0 ? (
          <div className="bg-card border border-dashed border-border/60 rounded-lg h-64 flex flex-col items-center justify-center text-muted-foreground">
            <MonitorSmartphone className="w-12 h-12 opacity-20 mb-4" />
            <span className="font-bold uppercase tracking-widest text-sm">No devices found</span>
            <span className="text-xs mt-1">Add your first device to start connecting.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {devices.map((device) => (
              <div key={device.id} className="bg-card border border-border/50 rounded-lg p-5 shadow-sm flex flex-col justify-between group">
                <div className="flex justify-between items-start mb-5">
                  <div className="flex items-center gap-3">
                    <div className="bg-secondary p-2.5 rounded-md">
                      <Smartphone className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground font-mono">{device.phoneNumber}</h4>
                      <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <User className="w-3.5 h-3.5" /> {device.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      {device.provider === 'official' ? (
                        <Badge className="bg-blue-500 hover:bg-blue-600 text-[10px] px-1.5 py-0">OFFICIAL API</Badge>
                      ) : (
                        <span className="relative flex h-2 w-2">
                          {device.status === 'connect' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                          <span className={`relative inline-flex rounded-full h-2 w-2 ${device.status === 'connect' ? 'bg-emerald-500' : 'bg-destructive'}`}></span>
                        </span>
                      )}
                      
                      {device.provider === 'baileys' && (
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${device.status === 'connect' ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
                          {device.status === 'connect' ? 'Connected' : 'Disconnected'}
                        </span>
                      )}
                    </div>
                    <Badge variant="outline" className="text-[10px] font-bold px-2 py-0 border-border/50 bg-secondary/50">
                      <Diamond className="w-3 h-3 mr-1 text-primary" />
                      {device.package}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4 px-1">
                  <Badge variant="secondary" className="text-xs font-medium px-2.5 py-1 bg-blue-50/50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200/50">
                    <Bot className="w-3.5 h-3.5 mr-1.5" />
                    {device.aiConfig?.totalResponses || 0} AI Responses
                  </Badge>
                </div>

                <div className="pt-4 border-t border-border/40 mt-auto flex items-center justify-between gap-2">
                  <div className="flex gap-2">
                    {device.provider === 'official' ? (
                       <Button 
                         variant="outline"
                         size="sm" 
                         className="font-semibold rounded-md h-8 px-3 shadow-sm border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400"
                         disabled
                       >
                         <CheckCheck className="w-3.5 h-3.5 mr-1.5" /> API Active
                       </Button>
                    ) : (
                      <>
                        {device.status === 'disconnect' ? (
                          <Button 
                            size="sm" 
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-md h-8 px-3 shadow-sm"
                            onClick={() => handleConnect(device)}
                          >
                            <Link2 className="w-3.5 h-3.5 mr-1.5" /> Connect
                          </Button>
                        ) : (
                          <Button variant="destructive" size="sm" className="font-semibold rounded-md h-8 px-3 shadow-sm">
                            <Unplug className="w-3.5 h-3.5 mr-1.5" /> Disconnect
                          </Button>
                        )}
                      </>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="font-semibold rounded-md h-8 px-3"
                      onClick={() => {
                        setSelectedDeviceForKey(device);
                        setGeneratedApiKey(device.apiKey || null);
                        setIsApiKeyModalOpen(true);
                      }}
                    >
                      <Key className="w-3.5 h-3.5 mr-1.5" /> API Key
                    </Button>
                  </div>

                  <div className="flex gap-1.5">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-transparent hover:bg-secondary focus-visible:outline-none transition-colors">
                          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-md border-border/50 shadow-md">
                        <div className="px-2 py-1.5 font-bold text-[10px] text-muted-foreground uppercase tracking-widest">Options</div>
                        <hr className="my-1 border-border/40" />
                        <DropdownMenuItem className="font-medium cursor-pointer rounded-sm" onClick={() => openEditModal(device)}>
                          <Edit className="w-4 h-4 mr-2" /> Edit Device
                        </DropdownMenuItem>
                        <DropdownMenuItem className="font-medium cursor-pointer rounded-sm">
                          <ShoppingCart className="w-4 h-4 mr-2" /> Upgrade Package
                        </DropdownMenuItem>
                        <DropdownMenuItem className="font-medium cursor-pointer rounded-sm">
                          <GitMerge className="w-4 h-4 mr-2" /> Chat Flow
                        </DropdownMenuItem>
                        <hr className="my-1 border-border/40" />
                        <DropdownMenuItem 
                          className="font-medium cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive rounded-sm"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this device? This action cannot be undone.")) {
                              fetch(`/api/devices/${device.id}`, { method: "DELETE" }).then(() => fetchDevices());
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete Device
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* API Key Modal */}
      <Dialog open={isApiKeyModalOpen} onOpenChange={setIsApiKeyModalOpen}>
        <DialogContent className="sm:max-w-md rounded-[1rem] p-0 overflow-hidden border-border/50 shadow-2xl">
          <div className="bg-gradient-to-br from-primary/10 via-background to-background px-6 pt-8 pb-6 border-b border-border/30 relative">
            <div className="absolute top-0 right-0 p-32 bg-primary/5 blur-[80px] rounded-full -z-10"></div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-extrabold flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 text-primary rounded-[0.5rem] shadow-sm">
                  <Key className="w-6 h-6" />
                </div>
                API Credentials
              </DialogTitle>
              <DialogDescription className="font-medium text-[13px] text-muted-foreground mt-3 leading-relaxed">
                Manage the secret API key for <span className="font-bold text-foreground px-2 py-0.5 bg-secondary rounded-[0.25rem]">{selectedDeviceForKey?.phoneNumber}</span>. This key grants full access to send messages via this device.
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="px-6 py-6 bg-background space-y-6">
            {generatedApiKey ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="space-y-2">
                  <Label className="font-extrabold text-muted-foreground uppercase tracking-widest text-[10px]">Your Secret Key</Label>
                  <div className="flex items-center space-x-2 relative group">
                    <Input 
                      value={generatedApiKey} 
                      readOnly 
                      className="font-mono text-sm bg-secondary/50 border-border/50 rounded-[0.5rem] pr-20 h-11 focus-visible:ring-1 focus-visible:ring-primary/50 shadow-inner"
                    />
                    <Button 
                      type="button" 
                      size="sm" 
                      className="absolute right-1 top-1 h-9 px-4 rounded-[0.35rem] font-bold shadow-sm transition-all"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedApiKey);
                        alert("Copied to clipboard!");
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-[0.5rem] flex gap-3">
                  <div className="mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-destructive uppercase tracking-wider mb-1">Security Warning</h4>
                    <p className="text-[11px] text-destructive/80 font-medium leading-relaxed">
                      Keep this key secret. If you generate a new key, any application using the old key will instantly lose access.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 bg-secondary/30 rounded-[0.75rem] border border-dashed border-border/60">
                <div className="w-16 h-16 bg-background shadow-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-border/50">
                  <Key className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-foreground font-bold text-lg mb-1">No Active Key</h3>
                <p className="text-sm font-medium text-muted-foreground max-w-[250px] mx-auto">Generate your first API key to start integrating this device.</p>
              </div>
            )}
          </div>
          
          <div className="px-6 py-5 bg-secondary/20 border-t border-border/30">
            <Button 
              onClick={() => handleGenerateApiKey(selectedDeviceForKey?.id)}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-[0.5rem] font-bold h-12 shadow-md transition-all hover:shadow-lg active:scale-[0.98]"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              {generatedApiKey ? "Regenerate API Key" : "Generate API Key Now"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Device Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="font-extrabold text-xl tracking-tight">Edit Device</DialogTitle>
            <DialogDescription className="font-medium text-muted-foreground">
              Update configuration for <strong>{editingDevice?.phoneNumber}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
            <div className="grid gap-2">
              <Label className="font-bold text-foreground">Device Name</Label>
              <Input
                placeholder="e.g. Sales WhatsApp"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="rounded-lg font-medium bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
              />
            </div>
            {editingDevice?.provider === "official" && (
              <div className="grid gap-4 mt-2 p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border-2 border-blue-100 dark:border-blue-900/30">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCheck className="w-4 h-4 text-blue-500" />
                  <h4 className="font-bold text-sm text-blue-700 dark:text-blue-400">Meta API Credentials</h4>
                </div>
                <div className="grid gap-2">
                  <Label className="font-bold text-xs text-foreground">System User Access Token</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="EAAI... (leave blank to keep current)"
                      className="rounded-lg font-mono text-sm pl-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                      value={editOfficialToken}
                      onChange={(e) => setEditOfficialToken(e.target.value)}
                      autoComplete="new-password"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="font-bold text-xs text-foreground">Phone Number ID</Label>
                  <div className="relative">
                    <Database className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="e.g. 10234567890"
                      className="rounded-lg font-mono text-sm pl-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                      value={editOfficialPhoneId}
                      onChange={(e) => setEditOfficialPhoneId(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="font-bold text-xs text-foreground">WhatsApp Business Account ID (WABA)</Label>
                  <div className="relative">
                    <Database className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="e.g. 10987654321"
                      className="rounded-lg font-mono text-sm pl-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                      value={editOfficialWabaId}
                      onChange={(e) => setEditOfficialWabaId(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={handleSaveEdit}
              disabled={editSaving || !editName}
              className="w-full bg-primary hover:bg-primary/90 rounded-[0.35rem] font-bold tracking-wide text-primary-foreground"
            >
              {editSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {editSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SendIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  )
}
