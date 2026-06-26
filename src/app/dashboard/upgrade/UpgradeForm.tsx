"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { UploadCloud, Loader2 } from "lucide-react"

export function UpgradeForm({ planName, amount }: { planName: string, amount: number }) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setIsUploading(true)
    try {
      // 1. Upload file
      const formData = new FormData()
      formData.append("file", file)
      
      const uploadRes = await fetch("/api/v1/upload", {
        method: "POST",
        body: formData,
      })
      const uploadData = await uploadRes.json()
      
      if (!uploadData.url) throw new Error("Upload failed")

      // 2. Submit order
      const orderRes = await fetch("/api/v1/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planName,
          amount,
          proofUrl: uploadData.url
        })
      })

      if (orderRes.ok) {
        router.refresh()
      } else {
        alert("Failed to submit order.")
      }
    } catch (err) {
      console.error(err)
      alert("An error occurred.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:bg-secondary/50 transition-colors cursor-pointer relative">
        <input 
          type="file" 
          accept="image/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          disabled={isUploading}
        />
        <UploadCloud className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
        {file ? (
          <p className="text-sm font-medium text-primary">{file.name}</p>
        ) : (
          <div>
            <p className="text-sm font-medium">Click or drag image here</p>
            <p className="text-xs text-muted-foreground mt-1">JPEG, PNG up to 5MB</p>
          </div>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full font-bold" 
        disabled={!file || isUploading}
      >
        {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
        Submit Payment Proof
      </Button>
    </form>
  )
}
