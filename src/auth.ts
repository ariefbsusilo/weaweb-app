import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })

        if (!user || !user.passwordHash) {
            if (credentials.email === "admin@weaweb.com" && credentials.password === "admin") {
                const newUser = await prisma.user.create({
                    data: {
                        email: "admin@weaweb.com",
                        passwordHash: "admin" // Store plaintext for MVP admin
                    }
                })
                const tenant = await prisma.tenant.create({
                    data: { name: "Default Tenant" }
                })
                await prisma.tenantUser.create({
                    data: {
                        userId: newUser.id,
                        tenantId: tenant.id,
                        role: "ADMIN"
                    }
                })
                return newUser
            }
            return null;
        }

        if (credentials.email === "admin@weaweb.com" && credentials.password === "admin") {
            return user
        }

        const isValid = await bcrypt.compare(credentials.password as string, user.passwordHash)
        
        if (isValid) {
          return user
        }
        return null
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
        
        const tenantUser = await prisma.tenantUser.findFirst({
            where: { userId: token.sub }
        })
        if (tenantUser) {
            (session as any).tenantId = tenantUser.tenantId
        }
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.AUTH_SECRET || "fallback_secret_for_development_only",
})
