"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUp, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ImportContact() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const text = await file.text();
      const rows = text.split("\n").map(r => r.trim()).filter(r => r);
      if (rows.length < 2) throw new Error("File must contain a header and at least one row.");

      const headers = rows[0].split(",").map(h => h.trim());
      const phoneIdx = headers.findIndex(h => h.toLowerCase().includes("phone") || h.toLowerCase().includes("nomor"));
      
      if (phoneIdx === -1) throw new Error("CSV must contain a column for 'phone' or 'nomor'.");

      const contactsToImport = [];
      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i].split(",").map(c => c.trim());
        const contactObj: any = {};
        
        headers.forEach((h, idx) => {
          if (idx === phoneIdx) {
            contactObj.phoneNumber = cols[idx];
          } else if (h.toLowerCase().includes("name") || h.toLowerCase().includes("nama")) {
            contactObj.name = cols[idx];
          } else if (h.toLowerCase().includes("tag")) {
            contactObj.tags = cols[idx];
          } else {
            contactObj[h] = cols[idx];
          }
        });
        
        if (contactObj.phoneNumber) {
          contactsToImport.push(contactObj);
        }
      }

      const res = await fetch("/api/v1/contacts/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts: contactsToImport })
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Successfully imported ${data.successCount} contacts.`);
        router.refresh();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error: any) {
      alert(`Import Failed: ${error.message}`);
    } finally {
      setLoading(false);
      e.target.value = ""; // reset input
    }
  };

  return (
    <div className="relative">
      <input 
        type="file" 
        accept=".csv" 
        onChange={handleFileChange} 
        disabled={loading}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />
      <Button disabled={loading} className="flex items-center gap-2 bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-sm rounded-[0.35rem]">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-5 h-5" />}
        {loading ? "Importing..." : "Import CSV Contacts"}
      </Button>
    </div>
  );
}
