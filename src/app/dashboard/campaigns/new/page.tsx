"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Send, Paperclip, CalendarClock, Upload, Download, FileSpreadsheet, ListChecks } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

type ExcelRow = {
  Phone: string;
  Name: string;
  Message: string;
  Date?: string;
  Time?: string;
};

export default function NewCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"standard" | "excel">("standard");
  
  // Standard Mode State
  const [name, setName] = useState("");
  const [targetTags, setTargetTags] = useState("");
  const [content, setContent] = useState("Halo {{name}}, \n\n");
  const [scheduledAt, setScheduledAt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Excel Mode State
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelData, setExcelData] = useState<ExcelRow[]>([]);
  const [excelError, setExcelError] = useState("");

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { Phone: "6281234567890", Name: "Budi", Message: "Halo Budi, promo khusus untukmu!", Date: "2024-12-31", Time: "14:30" },
      { Phone: "6289876543210", Name: "Siti", Message: "Siti, jangan lupa meeting besok jam 10 pagi.", Date: "", Time: "" }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Campaign_Template.xlsx");
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setExcelFile(file);
    setExcelError("");
    setExcelData([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json<any>(worksheet);

        if (json.length === 0) throw new Error("Excel file is empty");
        
        // Validate columns
        const firstRow = json[0];
        if (!("Phone" in firstRow) || !("Name" in firstRow) || !("Message" in firstRow)) {
          throw new Error("Missing required columns: Phone, Name, Message");
        }

        const parsedData: ExcelRow[] = json.map(row => ({
          Phone: String(row.Phone || ""),
          Name: String(row.Name || ""),
          Message: String(row.Message || ""),
          Date: row.Date ? String(row.Date) : undefined,
          Time: row.Time ? String(row.Time) : undefined,
        })).filter(row => row.Phone && row.Message);

        setExcelData(parsedData);
      } catch (err: any) {
        setExcelError("Failed to parse Excel: " + err.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "excel" && excelData.length === 0) {
        throw new Error("Please upload a valid Excel file with contacts first.");
      }

      let mediaUrl = null;
      let mediaType = null;

      if (file && mode === "standard") {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch("/api/v1/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed");
        mediaUrl = uploadData.url;
        mediaType = uploadData.type;
        setUploading(false);
      }

      const payload = mode === "standard" ? { 
        name, 
        content, 
        targetTags, 
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        mediaUrl,
        mediaType,
        mode
      } : {
        name,
        mode,
        excelRows: excelData
      };

      const res = await fetch("/api/v1/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create campaign");
      }

      router.push("/dashboard/campaigns");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/campaigns">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-100">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">New Campaign</h1>
          <p className="text-slate-400 text-sm">Create and broadcast a new message to your contacts</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="flex border-b border-slate-800">
          <button 
            type="button"
            onClick={() => setMode("standard")}
            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${mode === "standard" ? "bg-slate-800 text-white border-b-2 border-green-500" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"}`}
          >
            <ListChecks className="w-4 h-4" /> Standard Broadcast
          </button>
          <button 
            type="button"
            onClick={() => setMode("excel")}
            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${mode === "excel" ? "bg-slate-800 text-white border-b-2 border-green-500" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"}`}
          >
            <FileSpreadsheet className="w-4 h-4" /> Import Excel
          </button>
        </div>

        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 text-red-400 rounded-lg text-sm font-medium border border-red-500/20">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Campaign Name</label>
              <Input 
                required
                placeholder="e.g., Promo Akhir Tahun 2026" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:ring-green-600"
              />
            </div>

            {mode === "standard" ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Target Tags <span className="text-slate-500 font-normal">(Optional)</span></label>
                  <Input 
                    placeholder="e.g., VIP, promo (leave blank to send to all contacts)" 
                    value={targetTags}
                    onChange={(e) => setTargetTags(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:ring-green-600"
                  />
                  <p className="text-xs text-slate-500">Matches contacts containing this tag. Leave empty to target everyone.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <CalendarClock className="w-4 h-4 text-slate-400" /> Schedule Send
                    </label>
                    <Input 
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:ring-green-600 [color-scheme:dark]"
                    />
                    <p className="text-xs text-slate-500">Leave blank to send immediately.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-slate-400" /> Media Attachment
                    </label>
                    <Input 
                      type="file"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="bg-slate-950 border-slate-800 text-slate-300 file:text-slate-300 file:bg-slate-800 focus-visible:ring-green-600 cursor-pointer"
                    />
                    <p className="text-xs text-slate-500">Image, Video, or PDF.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 flex justify-between">
                    Message Content
                    <span className="text-slate-500 font-normal text-xs">Variables: {'{{name}}'}</span>
                  </label>
                  <Textarea 
                    required={mode === "standard"}
                    rows={8}
                    placeholder="Write your message here..." 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:ring-green-600 resize-none font-mono text-sm leading-relaxed"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-6">
                <div className="p-6 border-2 border-dashed border-slate-700 rounded-xl bg-slate-900/50 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center">
                    <Upload className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-slate-200 font-medium">Upload Excel File</h3>
                    <p className="text-slate-500 text-sm mt-1">.xlsx, .xls, or .csv formats supported</p>
                  </div>
                  
                  <Input 
                    type="file" 
                    accept=".xlsx,.xls,.csv"
                    onChange={handleExcelUpload}
                    className="max-w-xs bg-slate-950 border-slate-800 text-slate-300 file:text-slate-300 file:bg-slate-800 cursor-pointer"
                  />

                  {excelError && <p className="text-red-400 text-sm">{excelError}</p>}
                </div>

                <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-8 h-8 text-green-500" />
                    <div>
                      <h4 className="text-slate-200 text-sm font-medium">Download Template</h4>
                      <p className="text-slate-500 text-xs">Use our required columns structure</p>
                    </div>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={downloadTemplate} className="border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white">
                    <Download className="w-4 h-4 mr-2" /> Download
                  </Button>
                </div>

                {excelData.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <h4 className="text-sm font-medium text-slate-300">Preview Data ({excelData.length} rows)</h4>
                    </div>
                    <div className="overflow-x-auto border border-slate-800 rounded-lg">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-slate-800 text-slate-400">
                          <tr>
                            <th className="px-4 py-3">Phone</th>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Message</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-300">
                          {excelData.slice(0, 5).map((row, i) => (
                            <tr key={i} className="bg-slate-900/50">
                              <td className="px-4 py-3 font-mono">{row.Phone}</td>
                              <td className="px-4 py-3">{row.Name}</td>
                              <td className="px-4 py-3 max-w-[200px] truncate" title={row.Message}>{row.Message}</td>
                              <td className="px-4 py-3">{row.Date || "-"}</td>
                              <td className="px-4 py-3">{row.Time || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {excelData.length > 5 && (
                      <p className="text-xs text-slate-500 text-center">Showing first 5 rows only.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="pt-4 border-t border-slate-800">
              <Button 
                type="submit" 
                disabled={loading || uploading || (mode === "excel" && excelData.length === 0)} 
                className="w-full h-12 text-base font-medium bg-green-600 hover:bg-green-700 text-white shadow-[0_0_20px_rgba(22,163,74,0.15)] transition-all hover:shadow-[0_0_25px_rgba(22,163,74,0.25)] hover:-translate-y-0.5"
              >
                {loading || uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {uploading ? "Uploading media..." : "Processing..."}
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    {mode === "excel" ? `Launch Excel Campaign (${excelData.length} contacts)` : "Launch Campaign"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
