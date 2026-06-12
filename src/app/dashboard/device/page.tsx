"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Smartphone, Unplug, Wifi } from "lucide-react";
import QRCode from "qrcode";
import Image from "next/image";

export default function WhatsAppConnectionPage() {
  const [status, setStatus] = useState<string>("unconnected");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/v1/whatsapp");
      const data = await res.json();
      setStatus(data.status);
      
      if (data.qr) {
        const url = await QRCode.toDataURL(data.qr, { width: 300, margin: 2 });
        setQrCodeDataUrl(url);
      } else {
        setQrCodeDataUrl(null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      await fetch("/api/v1/whatsapp", {
        method: "POST",
        body: JSON.stringify({ action: "connect" }),
        headers: { "Content-Type": "application/json" }
      });
      setStatus("connecting");
      fetchStatus();
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    if (!confirm("Are you sure you want to disconnect your WhatsApp? Campaigns will stop sending.")) return;
    try {
      await fetch("/api/v1/whatsapp", {
        method: "POST",
        body: JSON.stringify({ action: "logout" }),
        headers: { "Content-Type": "application/json" }
      });
      setStatus("unconnected");
      setQrCodeDataUrl(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 max-w-2xl mx-auto mt-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
          <Smartphone className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900">WhatsApp Connection</h2>
        <p className="text-zinc-500 mt-2">Connect your phone to start sending messages and automating replies.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm text-center">
        {loading ? (
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
        ) : status === "connected" ? (
          <div className="space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 border-4 border-green-100">
              <Wifi className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-zinc-900">Connected!</h3>
              <p className="text-zinc-500 mt-1">Your WhatsApp is successfully linked to Weaweb SaaS.</p>
            </div>
            <Button onClick={handleLogout} variant="destructive" className="w-full sm:w-auto">
              <Unplug className="w-4 h-4 mr-2" />
              Disconnect Device
            </Button>
          </div>
        ) : status === "connecting" ? (
          <div className="space-y-6 flex flex-col items-center">
            <h3 className="text-xl font-bold text-zinc-900">Scan QR Code</h3>
            <p className="text-zinc-500 text-sm max-w-sm">
              Open WhatsApp on your phone, go to Linked Devices, and scan this QR code.
            </p>
            
            {qrCodeDataUrl ? (
              <div className="p-4 bg-white border-2 border-zinc-100 rounded-xl shadow-inner">
                <Image src={qrCodeDataUrl} alt="WhatsApp QR Code" width={250} height={250} />
              </div>
            ) : (
              <div className="w-[250px] h-[250px] border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center rounded-xl bg-zinc-50">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-400 mb-2" />
                <p className="text-sm text-zinc-500">Generating QR...</p>
              </div>
            )}
            
            <Button onClick={handleLogout} variant="outline" className="w-full sm:w-auto">
              Cancel
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-6 bg-zinc-50 rounded-xl border border-zinc-100">
              <h3 className="font-semibold text-zinc-900 mb-2">Ready to Connect</h3>
              <p className="text-sm text-zinc-600 mb-4">
                We will generate a unique QR code for you to scan. Make sure your phone has an active internet connection.
              </p>
              <Button onClick={handleConnect} className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-lg">
                <Smartphone className="w-5 h-5 mr-2" />
                Generate QR Code
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
