"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"
import Image from "next/image"
import { Loader2, ArrowRight } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })
    
    if (result?.error) {
      setError("Email atau sandi salah.")
      setLoading(false)
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative">
      {/* Background Animated Gradient / Shapes */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-primary/20 blur-[120px] pointer-events-none"
      />
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none"
      />

      <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-5xl h-[600px] bg-card/40 backdrop-blur-2xl border border-border/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
        >
          {/* Left Panel - Branding */}
          <div className="hidden md:flex flex-col justify-between w-1/2 p-12 bg-primary/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-12">
                <Image src="/logo.png" alt="Weaweb Logo" width={48} height={48} className="rounded-xl shadow-lg bg-white p-1" />
                <span className="text-3xl font-extrabold tracking-tight text-foreground">Weaweb</span>
              </div>
              
              <h1 className="text-4xl font-black tracking-tight leading-tight text-foreground mb-4">
                Automate your <br/> WhatsApp marketing <br/> <span className="text-primary">like a pro.</span>
              </h1>
              <p className="text-lg text-muted-foreground font-medium max-w-sm">
                The most reliable and powerful WhatsApp SaaS platform for your business.
              </p>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 text-sm font-semibold text-muted-foreground">
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500" /> System Online</span>
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /> v0.1.0-beta</span>
              </div>
            </div>
          </div>

          {/* Right Panel - Login Form */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-card/60 relative">
            <div className="md:hidden flex items-center justify-center gap-3 mb-8">
              <Image src="/logo.png" alt="Weaweb Logo" width={40} height={40} className="rounded-xl shadow-sm bg-white p-1" />
              <span className="text-2xl font-extrabold tracking-tight text-foreground">Weaweb</span>
            </div>

            <div className="mb-8 text-center md:text-left">
              <h2 className="text-3xl font-bold text-foreground tracking-tight">Welcome back</h2>
              <p className="text-muted-foreground mt-2">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground/80 font-semibold">Email Address</Label>
                <div className="relative group">
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@company.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    className="h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 rounded-xl px-4"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-foreground/80 font-semibold">Password</Label>
                  <a href="#" className="text-sm font-medium text-primary hover:underline transition-all">Forgot password?</a>
                </div>
                <div className="relative group">
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    className="h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 rounded-xl px-4"
                  />
                </div>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-500 font-medium text-center">{error}</p>
                </motion.div>
              )}

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base rounded-xl shadow-[0_4px_14px_0_rgba(34,197,94,0.39)] hover:shadow-[0_6px_20px_rgba(34,197,94,0.23)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
                {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground font-medium">
              Don't have an account? <a href="#" className="text-primary hover:underline font-bold">Contact Admin</a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
