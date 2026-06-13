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
        <div className="bg-card border border-border rounded-[0.35rem] p-6 flex items-center gap-4 shadow-sm">
          <div className="w-14 h-14 bg-secondary flex items-center justify-center rounded-[0.35rem]">
            <MonitorSmartphone className="w-7 h-7 text-muted-foreground" />
          </div>
          <div>
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs mb-1">Devices</p>
            <h3 className="text-3xl font-extrabold text-foreground font-mono">{devices.length}</h3>
          </div>
        </div>
        <div className="bg-card border border-border rounded-[0.35rem] p-6 flex items-center gap-4 shadow-sm">
          <div className="w-14 h-14 bg-secondary flex items-center justify-center rounded-[0.35rem]">
            <Link2 className="w-7 h-7 text-muted-foreground" />
          </div>
          <div>
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs mb-1">Connect</p>
            <h3 className="text-3xl font-extrabold text-foreground font-mono">0</h3>
          </div>
        </div>
        <div className="bg-card border border-border rounded-[0.35rem] p-6 flex items-center gap-4 shadow-sm">
          <div className="w-14 h-14 bg-secondary flex items-center justify-center rounded-[0.35rem]">
            <CheckCheck className="w-7 h-7 text-muted-foreground" />
          </div>
          <div>
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs mb-1">Messages</p>
            <h3 className="text-3xl font-extrabold text-foreground font-mono">0</h3>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mt-8">
        <h2 className="text-2xl font-extrabold tracking-tight text-foreground">Devices</h2>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger
            render={
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-[0.35rem] font-bold shadow-sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Device
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
      <div className="bg-card rounded-[0.35rem] border border-border overflow-hidden">
        <div className="p-4 border-b border-border bg-background">
          <Input 
            placeholder="Search" 
            className="w-full bg-background border-b-2 border-t-0 border-x-0 border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 text-foreground"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="font-bold text-foreground">Device</TableHead>
                <TableHead className="font-bold text-foreground">Package</TableHead>
                <TableHead className="font-bold text-foreground text-right">Action</TableHead>
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
                <TableRow key={device.id} className="border-border hover:bg-muted/50 transition-colors">
                  <TableCell className="align-top py-6">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-muted-foreground" />
                        <span className="font-bold text-foreground font-mono">{device.phoneNumber}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-muted-foreground text-sm">{device.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${device.status === 'connect' ? 'bg-primary' : 'bg-destructive'}`}></span>
                        <span className="text-sm font-medium text-muted-foreground capitalize">{device.status}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="align-top py-6">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-bold rounded-[0.25rem] px-3 py-1 text-sm bg-secondary text-secondary-foreground">
                        <Diamond className="w-4 h-4 mr-1.5" />
                        {device.package}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="align-top py-6 text-right">
                    <div className="flex flex-wrap gap-2 justify-end w-[400px] float-right">
                      {device.status === 'disconnect' ? (
                        <Button 
                          size="sm" 
                          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-[0.25rem] h-8 px-3"
                          onClick={() => handleConnect(device)}
                        >
                          <Link2 className="w-3.5 h-3.5 mr-1.5" /> Connect
                        </Button>
                      ) : (
                        <Button variant="destructive" size="sm" className="font-bold rounded-[0.25rem] h-8 px-3">
                          <Unplug className="w-3.5 h-3.5 mr-1.5" /> Disconnect
                        </Button>
                      )}
                      
                      <Button variant="outline" size="sm" className="font-bold rounded-[0.25rem] h-8 px-3">
                        <ShoppingCart className="w-3.5 h-3.5 mr-1.5" /> Order
                      </Button>
                      

                      
                      <Button variant="outline" size="sm" className="font-bold rounded-[0.25rem] h-8 px-3">
                        <GitMerge className="w-3.5 h-3.5 mr-1.5" /> Flow
                      </Button>
                      
                      <Link href={`/dashboard/devices/${device.id}/ai`}>
                        <Button variant="outline" size="sm" className="font-bold rounded-[0.25rem] h-8 px-3">
                          <Bot className="w-3.5 h-3.5 mr-1.5" /> AI
                        </Button>
                      </Link>
                      
                      <Link href={`/dashboard/devices/${device.id}/ai-data`}>
                        <Button variant="outline" size="sm" className="font-bold rounded-[0.25rem] h-8 px-3">
                          <Database className="w-3.5 h-3.5 mr-1.5" /> AI Data
                        </Button>
                      </Link>
                      
                      <Button variant="secondary" size="sm" className="font-bold rounded-[0.25rem] h-8 px-3">
                        <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 font-bold rounded-[0.25rem] h-8 px-3"
                        onClick={async () => {
                          if (confirm("Are you sure you want to delete this device?")) {
                            await fetch(`/api/devices/${device.id}`, { method: "DELETE" });
                            fetchDevices();
                          }
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                      </Button>
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
