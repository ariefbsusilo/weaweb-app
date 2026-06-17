"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, Loader2, MonitorSmartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ChatAIPage() {
  const router = useRouter();
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const res = await fetch("/api/devices");
      const json = await res.json();
      if (json.success) {
        setDevices(json.data);
      }
    } catch (e) {
      console.error("Failed to fetch devices", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 max-w-5xl">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
          <Bot className="w-8 h-8 text-primary" />
          Chat AI Configuration
        </h2>
        <p className="text-muted-foreground mt-2 font-medium">
          Select a device to configure its AI assistant, integrations, and orchestration rules.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center p-10">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : devices.length === 0 ? (
        <div className="text-center p-10 bg-card rounded-[0.35rem] border border-border">
          <p className="text-muted-foreground">No devices found. Add a device first.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map(device => (
            <div 
              key={device.id} 
              onClick={() => router.push(`/dashboard/devices/${device.id}/ai`)}
              className="bg-card border border-border rounded-[0.35rem] p-6 hover:shadow-md hover:border-primary/50 cursor-pointer transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -z-10 group-hover:bg-primary/10 transition-colors"></div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground">
                  <MonitorSmartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-foreground group-hover:text-primary transition-colors">
                    {device.name}
                  </h3>
                  <p className="text-sm font-mono text-muted-foreground">{device.phoneNumber}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
                <span className={`text-xs font-bold px-2 py-1 rounded-md ${device.status === 'connect' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {device.status === 'connect' ? 'Connected' : 'Disconnected'}
                </span>
                
                <Button variant="ghost" size="sm" className="text-xs group-hover:bg-primary group-hover:text-primary-foreground">
                  Configure AI
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
