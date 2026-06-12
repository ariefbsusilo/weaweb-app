const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function clearData() {
  const tenantId = 'tenant_1';
  
  console.log('Clearing messages...');
  await prisma.message.deleteMany({ where: { tenantId } });
  
  console.log('Clearing campaign messages...');
  await prisma.campaignMessage.deleteMany({});
  
  console.log('Clearing campaigns...');
  await prisma.campaign.deleteMany({ where: { tenantId } });
  
  console.log('Clearing contacts...');
  await prisma.contact.deleteMany({ where: { tenantId } });
  
  console.log('Clearing devices...');
  await prisma.device.deleteMany({ where: { tenantId } });
  
  console.log('Database cleared for ' + tenantId);
}

clearData()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
