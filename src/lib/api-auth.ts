import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function authenticateApiKey(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const key = authHeader.split(" ")[1];
  const apiKey = await prisma.apiKey.findUnique({ 
    where: { key }, 
    include: { tenant: true } 
  });
  return apiKey;
}
