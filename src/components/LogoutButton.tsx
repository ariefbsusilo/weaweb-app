"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

export function LogoutButton() {
  return (
    <Button 
      variant="ghost" 
      className="flex-1 justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-[0.35rem] h-9"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      Log out
    </Button>
  )
}
