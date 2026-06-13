"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Key, Trash2, Plus, Loader2, Smartphone } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function TokenPage() {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const res = await fetch("/api/v1/api-keys");
      const data = await res.json();
      setKeys(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateKey = async () => {
    setGenerating(true);
    try {
      await fetch("/api/v1/api-keys", { method: "POST" });
      await fetchKeys();
    } catch (error) {
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const deleteKey = async (id: string) => {
    if (!confirm("Revoke this API Key? Any system using it will stop working immediately.")) return;
    try {
      await fetch(`/api/v1/api-keys?id=${id}`, { method: "DELETE" });
      await fetchKeys();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">API Tokens</h2>
        <p className="text-muted-foreground mt-1">Manage your developer API keys and integrations.</p>
      </div>



      <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Key className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Developer API Keys</h3>
              <p className="text-sm text-muted-foreground">Use these keys to authenticate via the WEAWEB REST API.</p>
            </div>
          </div>
          <Button 
            onClick={generateKey} 
            disabled={generating}
            className="shadow-md transition-all hover:-translate-y-0.5"
          >
            {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            Generate New Key
          </Button>
        </div>

        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow>
                <TableHead>API Key</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : keys.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    No API keys generated yet.
                  </TableCell>
                </TableRow>
              ) : (
                keys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-mono text-sm text-foreground">{key.key}</TableCell>
                    <TableCell className="text-muted-foreground">{new Date(key.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => deleteKey(key.id)} className="text-red-500 hover:text-red-600 hover:bg-red-500/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
