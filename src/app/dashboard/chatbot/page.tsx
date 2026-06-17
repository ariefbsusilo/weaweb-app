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
    <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500 max-w-6xl mx-auto py-8">
      <div className="flex flex-col items-center text-center space-y-4 mb-12">
        <div className="w-16 h-16 bg-gradient-to-tr from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center shadow-inner border border-primary/10">
          <Bot className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-foreground">Chat AI Configuration</h2>
          <p className="text-muted-foreground mt-3 text-lg max-w-2xl mx-auto leading-relaxed">
            Select a device below to configure its AI assistant, manage knowledge sources, connect integrations, and orchestrate automated conversational rules.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary/50" />
        </div>
      ) : devices.length === 0 ? (
        <div className="text-center py-20 bg-card/50 rounded-3xl border border-border/50 shadow-sm backdrop-blur-sm">
          <div className="w-20 h-20 bg-secondary mx-auto rounded-full flex items-center justify-center mb-4">
            <MonitorSmartphone className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground">No devices found</h3>
          <p className="text-muted-foreground mt-2 mb-6">You need to add a device before configuring AI.</p>
          <Button onClick={() => router.push("/dashboard/devices")} size="lg" className="rounded-full px-8 shadow-md">
            Go to Devices
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {devices.map(device => (
            <div 
              key={device.id} 
              onClick={() => router.push(`/dashboard/devices/${device.id}/ai`)}
              className="bg-card border border-border/60 rounded-[1.5rem] p-6 cursor-pointer transition-all duration-300 group relative overflow-hidden shadow-sm hover:shadow-2xl hover:border-primary/40 hover:-translate-y-1"
            >
              {/* Decorative Background Blob */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-bl from-primary/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl z-0"></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center text-secondary-foreground shadow-sm border border-border/50 group-hover:scale-105 transition-transform duration-300">
                      <MonitorSmartphone className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-xl text-foreground group-hover:text-primary transition-colors duration-300">
                        {device.name}
                      </h3>
                      <p className="text-sm font-mono text-muted-foreground tracking-tight mt-1 bg-secondary/30 px-2 py-0.5 rounded-md inline-block">
                        {device.phoneNumber}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-8 pt-5 border-t border-border/40">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 ${device.status === 'connect' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${device.status === 'connect' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                    {device.status === 'connect' ? 'Connected' : 'Disconnected'}
                  </span>
                  
                  <div className="flex items-center text-sm font-bold text-primary opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    Configure AI &rarr;
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
