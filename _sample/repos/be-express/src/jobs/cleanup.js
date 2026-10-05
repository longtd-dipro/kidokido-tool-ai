const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function cleanupExpiredOrders() { await prisma.order.deleteMany({ where: { status: 'EXPIRED' } }); }
cron.schedule('0 2 * * *', cleanupExpiredOrders);
cron.schedule('*/15 * * * *', async () => { await prisma.orderItem.count(); });
