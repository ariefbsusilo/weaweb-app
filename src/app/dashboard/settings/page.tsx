"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

export default function SettingsPage() {
  const [devices, setDevices] = useState<any[]>([]);
  const [defaultDeviceId, setDefaultDeviceId] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const devRes = await fetch("/api/devices");
        const devJson = await devRes.json();
        if (devJson.success) setDevices(devJson.data);

        const setRes = await fetch("/api/settings");
        const setJson = await setRes.json();
        if (setJson.success && setJson.data?.defaultDeviceId) {
          setDefaultDeviceId(setJson.data.defaultDeviceId);
        }
      } catch (e) {
        console.error("Failed to load settings", e);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ defaultDeviceId })
      });
      const json = await res.json();
      if (json.success) {
        alert("Settings saved successfully!");
      }
    } catch (e) {
      alert("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 max-w-4xl">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground">General Settings</h2>
        <p className="text-muted-foreground mt-1 font-medium">Manage your account and billing preferences.</p>
      </div>
      <div className="bg-card p-6 rounded-[0.35rem] border border-border shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-bold text-foreground mb-2">Default Sender Device</label>
          <p className="text-sm text-muted-foreground mb-4">Choose which WhatsApp device will be used by default to send outgoing Campaigns and Auto-Replies.</p>
          
          <select 
            className="w-full max-w-md flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={defaultDeviceId}
            onChange={(e) => setDefaultDeviceId(e.target.value)}
          >
            <option value="">-- Select a connected device --</option>
            {devices.filter(d => d.status === 'connect').map((device) => (
              <option key={device.id} value={device.id}>
                {device.name} ({device.phoneNumber})
              </option>
            ))}
          </select>
        </div>

        <Button onClick={handleSave} disabled={isSaving} className="font-bold rounded-[0.25rem]">
          <Save className="w-4 h-4 mr-2" /> {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
