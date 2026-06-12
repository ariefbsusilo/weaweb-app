"use server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function addContact(formData: FormData) {
  const session = await auth()
  const tenantId = (session as any)?.tenantId

  if (!tenantId) {
    throw new Error("Unauthorized")
  }

  const name = formData.get("name") as string
  const phoneNumber = formData.get("phoneNumber") as string
  const tags = formData.get("tags") as string

  await prisma.contact.upsert({
    where: {
      tenantId_phoneNumber: { tenantId, phoneNumber }
    },
    update: {
      name,
      tags
    },
    create: {
      tenantId,
      name,
      phoneNumber,
      tags
    }
  })

  revalidatePath("/dashboard/contacts")
}

export async function deleteContact(formData: FormData) {
  const session = await auth()
  const tenantId = (session as any)?.tenantId

  if (!tenantId) {
    throw new Error("Unauthorized")
  }

  const id = formData.get("id") as string
  if (!id) return

  await prisma.contact.delete({
    where: { id, tenantId }
  })

  revalidatePath("/dashboard/contacts")
}
