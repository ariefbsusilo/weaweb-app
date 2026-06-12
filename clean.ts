import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const badContacts = await prisma.contact.findMany({
    where: {
      OR: [
        { phoneNumber: 'status' },
        { phoneNumber: 'status@broadcast' },
        { phoneNumber: { contains: '@newsletter' } }
      ]
    }
  });

  for (const contact of badContacts) {
    // Delete all messages associated with this contact first
    await prisma.message.deleteMany({
      where: { contactId: contact.id }
    });
    // Delete the contact
    await prisma.contact.delete({
      where: { id: contact.id }
    });
    console.log(`Deleted bad contact: ${contact.phoneNumber}`);
  }
  console.log("Cleanup complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
