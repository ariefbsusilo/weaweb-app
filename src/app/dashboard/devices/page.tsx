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
  Smartphone, User, Diamond, Infinity, Calendar, 
  Bot, GitMerge, Settings2, Database, Trash2, Edit,
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
        body: JSON.stringify({ name: deviceName, phoneNumber })
      });
      const json = await res.json();
      
      if (json.success) {
        setDevices([json.data, ...devices]);
        setIsModalOpen(false);
        setDeviceName("");
        setPhoneNumber("");
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
      
      {/* Premium Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Devices Card */}
        <div className="rounded-2xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden group bg-gradient-to-br from-indigo-600 to-blue-700 text-white border-0">
          <div className="absolute top-0 right-0 p-16 bg-white/10 blur-[50px] rounded-full mix-blend-overlay -z-0"></div>
          <div className="absolute -bottom-10 -left-10 p-20 bg-black/10 blur-[40px] rounded-full mix-blend-overlay -z-0"></div>
          <div className="flex items-start justify-between z-10">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/20 shadow-inner">
              <MonitorSmartphone className="w-7 h-7 text-white" />
            </div>
            <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-xs font-bold tracking-widest uppercase">
              Devices
            </div>
          </div>
          <div className="mt-6 z-10">
            <h3 className="text-4xl font-black tracking-tight">{devices.length}</h3>
            <p className="text-indigo-100 font-medium text-sm mt-1 opacity-90">Total registered numbers</p>
          </div>
        </div>
        
        {/* Connected Card */}
        <div className="rounded-2xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden group bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0">
          <div className="absolute top-0 right-0 p-16 bg-white/10 blur-[50px] rounded-full mix-blend-overlay -z-0"></div>
          <div className="absolute -bottom-10 -left-10 p-20 bg-black/10 blur-[40px] rounded-full mix-blend-overlay -z-0"></div>
          <div className="flex items-start justify-between z-10">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/20 shadow-inner">
              <Link2 className="w-7 h-7 text-white" />
            </div>
            <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-xs font-bold tracking-widest uppercase">
              Status
            </div>
          </div>
          <div className="mt-6 z-10">
            <h3 className="text-4xl font-black tracking-tight">{devices.filter(d => d.status === 'connect').length}</h3>
            <p className="text-emerald-100 font-medium text-sm mt-1 opacity-90">Currently connected</p>
          </div>
        </div>
        
        {/* Messages Card */}
        <div className="rounded-2xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden group bg-gradient-to-br from-fuchsia-600 to-purple-700 text-white border-0">
          <div className="absolute top-0 right-0 p-16 bg-white/10 blur-[50px] rounded-full mix-blend-overlay -z-0"></div>
          <div className="absolute -bottom-10 -left-10 p-20 bg-black/10 blur-[40px] rounded-full mix-blend-overlay -z-0"></div>
          <div className="flex items-start justify-between z-10">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/20 shadow-inner">
              <CheckCheck className="w-7 h-7 text-white" />
            </div>
            <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-xs font-bold tracking-widest uppercase">
              Activity
            </div>
          </div>
          <div className="mt-6 z-10">
            <h3 className="text-4xl font-black tracking-tight">0</h3>
            <p className="text-fuchsia-100 font-medium text-sm mt-1 opacity-90">Total messages sent</p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mt-12 mb-6 gap-4 relative">
        <div className="relative z-10">
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-xl mb-3 border border-primary/20 shadow-sm">
            <MonitorSmartphone className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Devices Management
          </h2>
          <p className="text-muted-foreground text-[15px] font-medium mt-1.5 max-w-lg">
            Manage your connected WhatsApp numbers, check connection status, and configure AI chat assistants.
          </p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger
            render={
              <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 px-6 h-12 hover:-translate-y-0.5 active:translate-y-0">
                <Plus className="w-5 h-5 mr-2" />
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
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="device-name" className="font-bold text-foreground">
                  Device Name
                </Label>
                <Input
                  id="device-name"
                  placeholder="e.g. Sales WhatsApp"
                  className="rounded-[0.35rem] font-medium"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone-number" className="font-bold text-foreground">
                  WhatsApp Number
                </Label>
                <Input
                  id="phone-number"
                  placeholder="e.g. 6281234567890"
                  className="rounded-[0.35rem] font-mono"
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
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

      {/* Table Section */}
      <div className="bg-card rounded-2xl border border-border/40 shadow-xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 to-transparent pointer-events-none z-0"></div>
        <div className="p-5 border-b border-border/40 bg-background/40 backdrop-blur-xl flex items-center relative z-10">
          <div className="relative w-full max-w-md">
            <Search className="w-5 h-5 text-primary absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input 
              placeholder="Search devices by name or number..." 
              className="w-full bg-background border-border/50 rounded-xl focus-visible:ring-primary pl-11 h-11 text-foreground font-medium shadow-sm transition-all hover:border-primary/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto relative z-10">
          <Table>
            <TableHeader className="bg-secondary/40 backdrop-blur-sm">
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableHead className="font-extrabold text-muted-foreground uppercase tracking-widest text-[11px] py-4 pl-6">Device Info</TableHead>
                <TableHead className="font-extrabold text-muted-foreground uppercase tracking-widest text-[11px] py-4">Package</TableHead>
                <TableHead className="font-extrabold text-muted-foreground uppercase tracking-widest text-[11px] py-4 text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.length === 0 ? (
                <TableRow className="border-border/40">
                  <TableCell colSpan={3} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mb-4">
                        <MonitorSmartphone className="w-8 h-8 opacity-50" />
                      </div>
                      <span className="font-bold uppercase tracking-widest text-sm">No devices found</span>
                      <span className="text-xs mt-1">Add your first device to start connecting.</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : devices.map((device) => (
                <TableRow key={device.id} className="border-border/30 hover:bg-primary/5 transition-all duration-300 group">
                  <TableCell className="align-middle py-6 pl-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg border border-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                          <Smartphone className="w-4 h-4 text-primary group-hover:text-primary-foreground" />
                        </div>
                        <span className="font-extrabold text-foreground font-mono text-base tracking-tight">{device.phoneNumber}</span>
                      </div>
                      <div className="flex items-center gap-2.5 ml-2">
                        <User className="w-4 h-4 text-muted-foreground/50" />
                        <span className="font-semibold text-muted-foreground text-[13px]">{device.name}</span>
                      </div>
                      <div className="flex items-center gap-2.5 ml-2.5 mt-1.5">
                        <span className="relative flex h-2.5 w-2.5">
                          {device.status === 'connect' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${device.status === 'connect' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-destructive'}`}></span>
                        </span>
                        <span className={`text-[11px] font-bold uppercase tracking-widest ${device.status === 'connect' ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
                          {device.status === 'connect' ? 'Connected' : 'Disconnected'}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="align-middle py-6">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-bold rounded-lg px-3 py-1.5 text-xs bg-secondary/80 text-secondary-foreground border border-border/50 shadow-sm backdrop-blur-sm group-hover:border-primary/30 transition-colors">
                        <Diamond className="w-3.5 h-3.5 mr-1.5 text-primary" />
                        {device.package}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="align-middle py-6 text-right pr-6">
                    <div className="flex items-center justify-end gap-3 w-full">
                      
                      {/* Primary Actions */}
                      <div className="flex items-center gap-2 bg-background/50 backdrop-blur-md p-1.5 rounded-xl border border-border/50 shadow-sm group-hover:border-primary/20 transition-all">
                        {device.status === 'disconnect' ? (
                          <Button 
                            size="sm" 
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg h-9 px-4 shadow-sm transition-all"
                            onClick={() => handleConnect(device)}
                          >
                            <Link2 className="w-4 h-4 mr-2" /> Connect
                          </Button>
                        ) : (
                          <Button variant="destructive" size="sm" className="font-bold rounded-lg h-9 px-4 shadow-sm transition-all">
                            <Unplug className="w-4 h-4 mr-2" /> Disconnect
                          </Button>
                        )}
                        
                        <div className="h-5 w-px bg-border/50 mx-1"></div>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="font-bold rounded-lg h-9 px-3 hover:bg-primary/10 hover:text-primary transition-all"
                          onClick={() => {
                            setSelectedDeviceForKey(device);
                            setGeneratedApiKey(device.apiKey || null);
                            setIsApiKeyModalOpen(true);
                          }}
                        >
                          <Key className="w-4 h-4 mr-2 text-primary" /> API Key
                        </Button>
                        
                        <Link href={`/dashboard/devices/${device.id}/ai`}>
                          <Button variant="ghost" size="sm" className="font-bold rounded-lg h-9 px-3 hover:bg-primary/10 hover:text-primary transition-all">
                            <Bot className="w-4 h-4 mr-2 text-primary" /> AI Config
                          </Button>
                        </Link>
                        
                        <Link href={`/dashboard/devices/${device.id}/ai-data`}>
                          <Button variant="ghost" size="sm" className="font-bold rounded-lg h-9 px-3 hover:bg-primary/10 hover:text-primary transition-all">
                            <Database className="w-4 h-4 mr-2 text-primary" /> AI Data
                          </Button>
                        </Link>
                      </div>

                      {/* Secondary Actions (Dropdown) */}
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-border/50 bg-background/80 backdrop-blur-md shadow-sm hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all hover:border-primary/30">
                            <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52 rounded-xl border-border/50 shadow-xl p-1 bg-background/95 backdrop-blur-xl">
                          <div className="px-3 py-2 font-black text-[10px] text-muted-foreground uppercase tracking-widest">Options</div>
                          <hr className="my-1 border-border/40" />
                          
                          <DropdownMenuItem className="font-medium cursor-pointer rounded-[0.25rem] focus:bg-secondary">
                            <Edit className="w-4 h-4 mr-2 text-muted-foreground" /> Edit Device
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem className="font-medium cursor-pointer rounded-[0.25rem] focus:bg-secondary">
                            <ShoppingCart className="w-4 h-4 mr-2 text-muted-foreground" /> Upgrade Package
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem className="font-medium cursor-pointer rounded-[0.25rem] focus:bg-secondary">
                            <GitMerge className="w-4 h-4 mr-2 text-muted-foreground" /> Chat Flow
                          </DropdownMenuItem>
                          
                          <hr className="my-1 border-border" />
                          
                          <DropdownMenuItem 
                            className="font-medium cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive rounded-[0.25rem]"
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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
