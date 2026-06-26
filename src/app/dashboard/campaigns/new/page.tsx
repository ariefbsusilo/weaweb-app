"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft, Loader2, Send, Paperclip, CalendarClock, Upload, Download,
  FileSpreadsheet, ListChecks, CheckCheck, Plus, Trash2, Users, X
} from "lucide-react";
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

type ManualContact = {
  phone: string;
  name: string;
};

export default function NewCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"standard" | "official" | "excel">("standard");

  // Official API Devices & Templates
  const [officialDevices, setOfficialDevices] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});

  // Common State
  const [name, setName] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");

  // Standard Mode State
  const [targetTags, setTargetTags] = useState("");
  const [content, setContent] = useState("Halo {{name}}, \n\n");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Official Mode - Manual Contacts
  const [manualContacts, setManualContacts] = useState<ManualContact[]>([{ phone: "", name: "" }]);
  const [officialTemplateId, setOfficialTemplateId] = useState<string>("");

  // Excel Mode State
  const [excelData, setExcelData] = useState<ExcelRow[]>([]);
  const [excelError, setExcelError] = useState("");

  // Excel Official Mode - template vars
  const [excelTemplateVars, setExcelTemplateVars] = useState<Record<string, string>>({});

  // Device Selection
  const [allDevices, setAllDevices] = useState<any[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");

  useEffect(() => {
    const fetchDevices = async () => {
      const res = await fetch("/api/devices");
      const json = await res.json();
      if (json.success) {
        const connectedDevices = json.data.filter((d: any) => d.status === "connect");
        setAllDevices(connectedDevices);
        
        const officials = connectedDevices.filter((d: any) => d.provider === "official");
        setOfficialDevices(officials);
        if (officials.length > 0) {
          setSelectedDeviceId(officials[0].id);
          handleFetchTemplates(officials[0].id);
        } else if (connectedDevices.length > 0) {
          setSelectedDeviceId(connectedDevices[0].id);
        }
      }
    };
    fetchDevices();
  }, []);

  const handleFetchTemplates = async (deviceId: string) => {
    setLoadingTemplates(true);
    try {
      const res = await fetch(`/api/v1/meta-templates?deviceId=${deviceId}`);
      const json = await res.json();
      if (json.success) {
        setTemplates(json.data);
      }
    } catch (err) {
      console.error("Error fetching templates", err);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleTemplateSelect = (templateId: string, isOfficial = false) => {
    const tmpl = templates.find(t => t.id === templateId);
    setSelectedTemplate(tmpl || null);
    if (tmpl) {
      const bodyComponent = tmpl.components.find((c: any) => c.type === "BODY");
      const text = bodyComponent?.text || "";
      const matches = text.match(/\{\{(\d+)\}\}/g) || [];
      const vars: Record<string, string> = {};
      matches.forEach((m: string) => { vars[m] = ""; });
      if (isOfficial) {
        setExcelTemplateVars(vars);
      } else {
        setTemplateVariables(vars);
      }
      setContent(text);
    } else {
      if (isOfficial) {
        setExcelTemplateVars({});
      } else {
        setTemplateVariables({});
      }
      setContent("Halo {{name}}, \n\n");
    }
  };

  // Manual contacts helpers
  const addManualContact = () => {
    setManualContacts([...manualContacts, { phone: "", name: "" }]);
  };

  const removeManualContact = (idx: number) => {
    setManualContacts(manualContacts.filter((_, i) => i !== idx));
  };

  const updateManualContact = (idx: number, field: "phone" | "name", value: string) => {
    const updated = [...manualContacts];
    updated[idx][field] = value;
    setManualContacts(updated);
  };

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
    const f = e.target.files?.[0];
    if (!f) return;
    setExcelError("");
    setExcelData([]);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = ev.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<any>(worksheet);
        if (json.length === 0) throw new Error("Excel file is empty");
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
        setExcelError("Gagal membaca Excel: " + err.message);
      }
    };
    reader.readAsBinaryString(f);
  };

  const handleOfficialCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = ev.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<any>(worksheet);
        if (json.length > 0) {
           const newContacts = json.map(row => ({
              phone: String(row.Phone || row.phone || row.Nomor || ""),
              name: String(row.Name || row.name || row.Nama || "")
           })).filter(c => c.phone);
           setManualContacts(prev => {
              const filteredPrev = prev.filter(p => p.phone);
              return [...filteredPrev, ...newContacts, {phone: "", name: ""}]; // add 1 empty row at end
           });
        }
      } catch (err: any) {
        setError("Gagal membaca Excel: " + err.message);
      }
      e.target.value = ""; // reset input
    };
    reader.readAsBinaryString(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let payload: any;

      if (mode === "official") {
        // Meta Official: send to manual contacts using template
        if (!selectedTemplate) throw new Error("Pilih template Meta terlebih dahulu.");
        const validContacts = manualContacts.filter(c => c.phone.trim());
        if (validContacts.length === 0) throw new Error("Masukkan minimal 1 nomor penerima.");

        // Convert manual contacts to excel rows format
        const rows: ExcelRow[] = validContacts.map(c => ({
          Phone: c.phone.trim(),
          Name: c.name.trim() || c.phone.trim(),
          Message: "",
        }));

        payload = {
          name,
          mode: "excel",
          deviceId: selectedDeviceId,
          excelRows: rows,
          metaTemplateName: selectedTemplate.name,
          metaTemplateLanguage: selectedTemplate.language,
          metaTemplateVariables: Object.keys(excelTemplateVars).length > 0
            ? JSON.stringify(excelTemplateVars) : null,
          scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        };

      } else if (mode === "excel") {
        if (excelData.length === 0) throw new Error("Upload file Excel terlebih dahulu.");
        payload = {
          name,
          mode: "excel",
          deviceId: selectedDeviceId,
          excelRows: excelData,
          metaTemplateName: selectedTemplate?.name || null,
          metaTemplateLanguage: selectedTemplate?.language || null,
          metaTemplateVariables: Object.keys(templateVariables).length > 0
            ? JSON.stringify(templateVariables) : null,
        };

      } else {
        // Standard
        let mediaUrl = null;
        let mediaType = null;
        if (file) {
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
        payload = {
          name,
          content,
          targetTags,
          deviceId: selectedDeviceId,
          scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
          mediaUrl,
          mediaType,
          mode: "standard",
          metaTemplateName: selectedTemplate?.name || null,
          metaTemplateLanguage: selectedTemplate?.language || null,
          metaTemplateVariables: Object.keys(templateVariables).length > 0
            ? JSON.stringify(templateVariables) : null,
        };
      }

      const res = await fetch("/api/v1/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat campaign");

      router.push("/dashboard/campaigns");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const approvedTemplates = templates.filter(t => t.status === "APPROVED");

  const tabs = [
    { id: "standard", label: "Standard Broadcast", icon: <ListChecks className="w-4 h-4" /> },
    { id: "official", label: "Meta Official API", icon: <CheckCheck className="w-4 h-4" />, badge: officialDevices.length > 0 },
    { id: "excel", label: "Import Excel", icon: <FileSpreadsheet className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/campaigns">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">New Campaign</h1>
          <p className="text-muted-foreground text-sm">Buat dan kirim pesan broadcast ke kontak Anda</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
        {/* Tabs */}
        <div className="flex border-b border-border">
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMode(tab.id as any)}
              className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative ${
                mode === tab.id
                  ? "bg-secondary text-foreground border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.id === "official" && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  officialDevices.length > 0
                    ? "bg-blue-500/20 text-blue-500"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {officialDevices.length > 0 ? "READY" : "NO DEVICE"}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm font-medium border border-destructive/20 flex items-start gap-2">
                <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Device Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Device Pengirim</label>
              <select
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                value={selectedDeviceId}
                onChange={(e) => {
                  setSelectedDeviceId(e.target.value);
                  if (mode === "official") handleFetchTemplates(e.target.value);
                }}
                required
              >
                <option value="">-- Pilih Device Pengirim --</option>
                {allDevices
                  .filter(d => mode === "official" ? d.provider === "official" : d.provider !== "official")
                  .map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.phoneNumber})</option>
                  ))}
              </select>
            </div>

            {/* Campaign Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Campaign Name</label>
              <Input
                required
                placeholder="e.g., Promo Akhir Tahun 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
              />
            </div>

            {/* ===== META OFFICIAL MODE ===== */}
            {mode === "official" && (
              <div className="space-y-6">
                {officialDevices.length === 0 ? (
                  <div className="p-6 border-2 border-dashed border-border rounded-xl text-center text-muted-foreground">
                    <CheckCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Belum ada device Official Meta API</p>
                    <p className="text-sm mt-1">Tambahkan Official API device di menu <strong>Devices</strong> terlebih dahulu.</p>
                  </div>
                ) : (
                  <>
                    {/* Template Selector */}
                    <div className="bg-blue-500/5 border border-blue-500/20 p-5 rounded-xl space-y-4">
                      <div className="flex items-center gap-2">
                        <CheckCheck className="w-5 h-5 text-blue-500" />
                        <div>
                          <h4 className="font-bold text-sm text-foreground">Pilih Template Meta</h4>
                          <p className="text-xs text-muted-foreground">Hanya template berstatus APPROVED yang bisa digunakan.</p>
                        </div>
                        {loadingTemplates && <Loader2 className="w-4 h-4 animate-spin text-blue-500 ml-auto" />}
                      </div>

                      {approvedTemplates.length === 0 && !loadingTemplates ? (
                        <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-500/10 p-3 rounded-lg">
                          Tidak ada template yang APPROVED. Buat template di menu <strong>Templates</strong> dan tunggu persetujuan Meta.
                        </p>
                      ) : (
                        <select
                          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          onChange={(e) => { setOfficialTemplateId(e.target.value); handleTemplateSelect(e.target.value, true); }}
                          value={officialTemplateId}
                          required
                        >
                          <option value="">-- Pilih Template --</option>
                          {approvedTemplates.map(t => (
                            <option key={t.id} value={t.id}>{t.name} ({t.language})</option>
                          ))}
                        </select>
                      )}

                      {selectedTemplate && (
                        <div className="bg-background border border-border rounded-lg p-3 text-sm text-foreground font-mono whitespace-pre-wrap">
                          {selectedTemplate.components?.find((c: any) => c.type === "BODY")?.text || ""}
                        </div>
                      )}

                      {selectedTemplate && Object.keys(excelTemplateVars).length > 0 && (
                        <div className="space-y-2 p-4 bg-background rounded-md border border-border">
                          <h5 className="font-bold text-sm text-foreground">Set Template Variables</h5>
                          <p className="text-xs text-muted-foreground">Gunakan <code className="bg-secondary px-1 rounded">{"{{name}}"}</code> untuk nama kontak otomatis.</p>
                          {Object.keys(excelTemplateVars).map(variable => (
                            <div key={variable} className="flex items-center gap-2">
                              <span className="font-mono text-xs bg-secondary px-2 py-1 rounded text-foreground flex-shrink-0">{variable}</span>
                              <Input
                                size={1}
                                className="flex-1 h-8 bg-background border-border text-foreground"
                                placeholder={`Nilai untuk ${variable}`}
                                value={excelTemplateVars[variable]}
                                onChange={(e) => setExcelTemplateVars({ ...excelTemplateVars, [variable]: e.target.value })}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Manual Contacts */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-foreground" />
                          <label className="text-sm font-medium text-foreground">Penerima</label>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                            {manualContacts.filter(c => c.phone.trim()).length} kontak
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div>
                            <input type="file" id="official-csv" accept=".csv, .xlsx, .xls" className="hidden" onChange={handleOfficialCsvUpload} />
                            <label htmlFor="official-csv" className="inline-flex h-7 cursor-pointer items-center justify-center rounded-md border border-border bg-transparent px-3 text-xs font-medium hover:bg-accent hover:text-accent-foreground text-foreground">
                               <FileSpreadsheet className="w-3.5 h-3.5 mr-1" /> Import CSV
                            </label>
                          </div>
                          <Button type="button" size="sm" variant="outline" onClick={addManualContact} className="border-border h-7 text-xs">
                            <Plus className="w-3.5 h-3.5 mr-1" /> Tambah
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {manualContacts.map((contact, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-xs text-muted-foreground font-bold flex-shrink-0">
                              {idx + 1}
                            </div>
                            <Input
                              placeholder="Nomor HP (e.g. 628123456789)"
                              value={contact.phone}
                              onChange={(e) => updateManualContact(idx, "phone", e.target.value)}
                              className="flex-1 h-9 font-mono text-sm bg-background border-border text-foreground placeholder:text-muted-foreground"
                            />
                            <Input
                              placeholder="Nama (opsional)"
                              value={contact.name}
                              onChange={(e) => updateManualContact(idx, "name", e.target.value)}
                              className="flex-1 h-9 text-sm bg-background border-border text-foreground placeholder:text-muted-foreground"
                            />
                            {manualContacts.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                                onClick={() => removeManualContact(idx)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">Format: 628xxx (tanpa + atau 0 di depan)</p>
                    </div>

                    {/* Schedule */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <CalendarClock className="w-4 h-4 text-muted-foreground" /> Jadwal Kirim
                      </label>
                      <Input
                        type="datetime-local"
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        className="bg-background border-border text-foreground focus-visible:ring-primary dark:[color-scheme:dark]"
                      />
                      <p className="text-xs text-muted-foreground">Kosongkan untuk kirim segera.</p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ===== STANDARD MODE ===== */}
            {mode === "standard" && (
              <>
                {/* Optional: Use Meta Template for standard too */}
                {officialDevices.length > 0 && (
                  <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-sm text-foreground">Meta Message Templates <span className="text-muted-foreground font-normal">(Opsional)</span></h4>
                        <p className="text-xs text-muted-foreground">Gunakan template resmi untuk bypass 24-jam.</p>
                      </div>
                      <Button
                        type="button" variant="outline" size="sm"
                        onClick={() => handleFetchTemplates(officialDevices[0].id)}
                        disabled={loadingTemplates}
                        className="border-border"
                      >
                        {loadingTemplates ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                        {loadingTemplates ? "Loading..." : "Fetch Templates"}
                      </Button>
                    </div>
                    {templates.length > 0 && (
                      <select
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        onChange={(e) => handleTemplateSelect(e.target.value)}
                        value={selectedTemplate?.id || ""}
                      >
                        <option value="">-- Tidak pakai template --</option>
                        {templates.map(t => (
                          <option key={t.id} value={t.id}>{t.name} ({t.language}) {t.status !== "APPROVED" ? `[${t.status}]` : ""}</option>
                        ))}
                      </select>
                    )}
                    {selectedTemplate && Object.keys(templateVariables).length > 0 && (
                      <div className="space-y-2 p-3 bg-background rounded-md border border-border">
                        {Object.keys(templateVariables).map(variable => (
                          <div key={variable} className="flex items-center gap-2">
                            <span className="font-mono text-xs bg-secondary px-2 py-1 rounded text-foreground">{variable}</span>
                            <Input
                              size={1} className="flex-1 h-8 bg-background border-border text-foreground"
                              placeholder="e.g. {{name}} atau DISKON50"
                              value={templateVariables[variable]}
                              onChange={(e) => setTemplateVariables({ ...templateVariables, [variable]: e.target.value })}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Target Tags <span className="text-muted-foreground font-normal">(Opsional)</span></label>
                  <Input
                    placeholder="e.g., VIP, promo (kosongkan untuk semua kontak)"
                    value={targetTags}
                    onChange={(e) => setTargetTags(e.target.value)}
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground">Kosongkan untuk mengirim ke semua kontak.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <CalendarClock className="w-4 h-4 text-muted-foreground" /> Jadwal Kirim
                    </label>
                    <Input
                      type="datetime-local" value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className="bg-background border-border text-foreground focus-visible:ring-primary dark:[color-scheme:dark]"
                    />
                    <p className="text-xs text-muted-foreground">Kosongkan untuk kirim segera.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-muted-foreground" /> Media Attachment
                    </label>
                    <Input
                      type="file"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="bg-background border-border text-foreground file:text-foreground file:bg-secondary cursor-pointer focus-visible:ring-primary"
                    />
                    <p className="text-xs text-muted-foreground">Image, Video, atau PDF.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex justify-between">
                    Isi Pesan
                    {!selectedTemplate && <span className="text-muted-foreground font-normal text-xs">Variabel: {"{{name}}"}</span>}
                  </label>
                  <Textarea
                    required={!selectedTemplate}
                    disabled={!!selectedTemplate}
                    rows={8}
                    placeholder="Tulis pesan Anda di sini..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className={`bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary resize-none font-mono text-sm ${selectedTemplate ? "opacity-50 cursor-not-allowed" : ""}`}
                  />
                  {selectedTemplate && <p className="text-xs text-muted-foreground">Preview saja. Konten asli dari template.</p>}
                </div>
              </>
            )}

            {/* ===== EXCEL MODE ===== */}
            {mode === "excel" && (
              <div className="space-y-6">
                {/* Optional: Template for excel */}
                {officialDevices.length > 0 && (
                  <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-sm text-foreground">Meta Template <span className="text-muted-foreground font-normal">(Opsional)</span></h4>
                        <p className="text-xs text-muted-foreground">Gunakan <code className="bg-secondary px-1 rounded">{"{{custom_message}}"}</code> untuk injeksi kolom Message dari Excel.</p>
                      </div>
                    </div>
                    {templates.length > 0 && (
                      <select
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        onChange={(e) => handleTemplateSelect(e.target.value)}
                        value={selectedTemplate?.id || ""}
                      >
                        <option value="">-- Tidak pakai template (Free-form) --</option>
                        {templates.map(t => (
                          <option key={t.id} value={t.id}>{t.name} ({t.language}) {t.status !== "APPROVED" ? `[${t.status}]` : ""}</option>
                        ))}
                      </select>
                    )}
                    {selectedTemplate && Object.keys(templateVariables).length > 0 && (
                      <div className="space-y-2 p-3 bg-background rounded-md border border-border">
                        {Object.keys(templateVariables).map(variable => (
                          <div key={variable} className="flex items-center gap-2">
                            <span className="font-mono text-xs bg-secondary px-2 py-1 rounded text-foreground">{variable}</span>
                            <Input
                              size={1} className="flex-1 h-8 bg-background border-border text-foreground"
                              placeholder={`e.g. {{name}} atau {{custom_message}}`}
                              value={templateVariables[variable]}
                              onChange={(e) => setTemplateVariables({ ...templateVariables, [variable]: e.target.value })}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="p-6 border-2 border-dashed border-border rounded-xl bg-secondary/20 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-medium">Upload File Excel</h3>
                    <p className="text-muted-foreground text-sm mt-1">.xlsx, .xls, atau .csv</p>
                  </div>
                  <Input
                    type="file" accept=".xlsx,.xls,.csv"
                    onChange={handleExcelUpload}
                    className="max-w-xs bg-background border-border text-foreground file:text-foreground file:bg-secondary cursor-pointer"
                  />
                  {excelError && <p className="text-destructive text-sm">{excelError}</p>}
                </div>

                <div className="flex items-center justify-between bg-secondary/30 p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-8 h-8 text-primary" />
                    <div>
                      <h4 className="text-foreground text-sm font-medium">Download Template</h4>
                      <p className="text-muted-foreground text-xs">Kolom wajib: Phone, Name, Message</p>
                    </div>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={downloadTemplate} className="border-border">
                    <Download className="w-4 h-4 mr-2" /> Download
                  </Button>
                </div>

                {excelData.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-foreground">Preview Data</h4>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">{excelData.length} baris</span>
                    </div>
                    <div className="overflow-x-auto border border-border rounded-lg">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-secondary text-muted-foreground">
                          <tr>
                            <th className="px-4 py-3">Phone</th>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Message</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border text-foreground">
                          {excelData.slice(0, 5).map((row, i) => (
                            <tr key={i} className="hover:bg-secondary/30">
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
                      <p className="text-xs text-muted-foreground text-center">Menampilkan 5 baris pertama dari {excelData.length} total.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Submit */}
            <div className="pt-4 border-t border-border">
              <Button
                type="submit"
                disabled={
                  loading || uploading ||
                  (mode === "excel" && excelData.length === 0) ||
                  (mode === "official" && (!selectedTemplate || manualContacts.filter(c => c.phone.trim()).length === 0))
                }
                className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all hover:shadow-lg"
              >
                {loading || uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {uploading ? "Mengupload media..." : "Memproses..."}
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    {mode === "official"
                      ? `Kirim via Meta API (${manualContacts.filter(c => c.phone.trim()).length} kontak)`
                      : mode === "excel"
                      ? `Launch Excel Campaign (${excelData.length} kontak)`
                      : "Launch Campaign"
                    }
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
