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
      
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border/50 rounded-[0.5rem] p-6 flex items-center gap-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center rounded-[0.5rem] border border-primary/10 shadow-inner z-10">
            <MonitorSmartphone className="w-7 h-7 text-primary" />
          </div>
          <div className="z-10">
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] mb-1">Total Devices</p>
            <h3 className="text-3xl font-extrabold text-foreground font-mono tracking-tight">{devices.length}</h3>
          </div>
        </div>
        
        <div className="bg-card border border-border/50 rounded-[0.5rem] p-6 flex items-center gap-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 flex items-center justify-center rounded-[0.5rem] border border-emerald-500/10 shadow-inner z-10">
            <Link2 className="w-7 h-7 text-emerald-500" />
          </div>
          <div className="z-10">
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] mb-1">Connected</p>
            <h3 className="text-3xl font-extrabold text-foreground font-mono tracking-tight">{devices.filter(d => d.status === 'connect').length}</h3>
          </div>
        </div>
        
        <div className="bg-card border border-border/50 rounded-[0.5rem] p-6 flex items-center gap-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500/10 to-blue-500/5 flex items-center justify-center rounded-[0.5rem] border border-blue-500/10 shadow-inner z-10">
            <CheckCheck className="w-7 h-7 text-blue-500" />
          </div>
          <div className="z-10">
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] mb-1">Messages Sent</p>
            <h3 className="text-3xl font-extrabold text-foreground font-mono tracking-tight">0</h3>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-end mt-10 mb-2">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground">Devices Management</h2>
          <p className="text-muted-foreground text-sm font-medium mt-1">Manage your connected WhatsApp numbers and AI configurations.</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger
            render={
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-[0.5rem] font-bold shadow-md hover:shadow-lg transition-all px-5 h-10">
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
      <div className="bg-card rounded-[0.5rem] border border-border/50 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-background/50 flex items-center">
          <Search className="w-5 h-5 text-muted-foreground mr-3" />
          <Input 
            placeholder="Search devices by name or number..." 
            className="w-full bg-transparent border-none rounded-none focus-visible:ring-0 px-0 text-foreground font-medium shadow-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/20">
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="font-bold text-muted-foreground uppercase tracking-wider text-xs py-4">Device Info</TableHead>
                <TableHead className="font-bold text-muted-foreground uppercase tracking-wider text-xs py-4">Package</TableHead>
                <TableHead className="font-bold text-muted-foreground uppercase tracking-wider text-xs py-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.length === 0 ? (
                <TableRow className="border-border">
                  <TableCell colSpan={3} className="h-48 text-center text-muted-foreground font-bold uppercase tracking-widest text-sm">
                    No devices configured yet. Add your first device.
                  </TableCell>
                </TableRow>
              ) : devices.map((device) => (
                <TableRow key={device.id} className="border-border/50 hover:bg-muted/30 transition-colors group">
                  <TableCell className="align-middle py-5">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <div className="bg-secondary p-1.5 rounded-md">
                          <Smartphone className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <span className="font-extrabold text-foreground font-mono text-base">{device.phoneNumber}</span>
                      </div>
                      <div className="flex items-center gap-2.5 ml-1">
                        <User className="w-4 h-4 text-muted-foreground/70" />
                        <span className="font-semibold text-muted-foreground text-sm">{device.name}</span>
                      </div>
                      <div className="flex items-center gap-2.5 ml-1.5 mt-1">
                        <span className="relative flex h-2.5 w-2.5">
                          {device.status === 'connect' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${device.status === 'connect' ? 'bg-emerald-500' : 'bg-destructive'}`}></span>
                        </span>
                        <span className={`text-xs font-bold uppercase tracking-wider ${device.status === 'connect' ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
                          {device.status === 'connect' ? 'Connected' : 'Disconnected'}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="align-middle py-5">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-bold rounded-[0.35rem] px-3 py-1.5 text-xs bg-secondary text-secondary-foreground border border-border/50">
                        <Diamond className="w-3.5 h-3.5 mr-1.5 text-primary" />
                        {device.package}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="align-middle py-5 text-right">
                    <div className="flex items-center justify-end gap-3 w-full">
                      
                      {/* Primary Actions */}
                      <div className="flex items-center gap-2 bg-secondary/30 p-1.5 rounded-[0.5rem] border border-border/50">
                        {device.status === 'disconnect' ? (
                          <Button 
                            size="sm" 
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-[0.35rem] h-9 px-4 shadow-sm transition-all"
                            onClick={() => handleConnect(device)}
                          >
                            <Link2 className="w-4 h-4 mr-2" /> Connect
                          </Button>
                        ) : (
                          <Button variant="destructive" size="sm" className="font-bold rounded-[0.35rem] h-9 px-4 shadow-sm transition-all">
                            <Unplug className="w-4 h-4 mr-2" /> Disconnect
                          </Button>
                        )}
                        
                        <div className="h-5 w-px bg-border mx-1"></div>
                        
                        <Link href={`/dashboard/devices/${device.id}/ai`}>
                          <Button variant="ghost" size="sm" className="font-bold rounded-[0.35rem] h-9 px-3 hover:bg-primary/10 hover:text-primary transition-all">
                            <Bot className="w-4 h-4 mr-2 text-primary" /> AI Config
                          </Button>
                        </Link>
                        
                        <Link href={`/dashboard/devices/${device.id}/ai-data`}>
                          <Button variant="ghost" size="sm" className="font-bold rounded-[0.35rem] h-9 px-3 hover:bg-primary/10 hover:text-primary transition-all">
                            <Database className="w-4 h-4 mr-2 text-primary" /> AI Data
                          </Button>
                        </Link>
                      </div>

                      {/* Secondary Actions (Dropdown) */}
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center justify-center h-9 w-9 rounded-[0.35rem] border border-border bg-background shadow-sm hover:bg-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-[0.5rem] border-border shadow-md">
                          <DropdownMenuLabel className="font-bold text-xs text-muted-foreground uppercase tracking-wider">Options</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem className="font-medium cursor-pointer rounded-[0.25rem] focus:bg-secondary">
                            <Edit className="w-4 h-4 mr-2 text-muted-foreground" /> Edit Device
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem className="font-medium cursor-pointer rounded-[0.25rem] focus:bg-secondary">
                            <ShoppingCart className="w-4 h-4 mr-2 text-muted-foreground" /> Upgrade Package
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem className="font-medium cursor-pointer rounded-[0.25rem] focus:bg-secondary">
                            <GitMerge className="w-4 h-4 mr-2 text-muted-foreground" /> Chat Flow
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem 
                            className="font-medium cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive rounded-[0.25rem]"
                            onClick={async () => {
                              if (confirm("Are you sure you want to delete this device? This action cannot be undone.")) {
                                await fetch(`/api/devices/${device.id}`, { method: "DELETE" });
                                fetchDevices();
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
