const router = require('express').Router();
const { body } = require('express-validator');
const { requireAuth } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const Stripe = require('stripe');

router.get('/', requireAuth, async (req, res) => {
  res.json(await prisma.order.findMany({ include: { items: true } }));
});
router.put('/:id/status', requireAuth, body('status').isIn(['PAID', 'SHIPPED']), async (req, res) => {
  const { status, note } = req.body;
  res.json(await prisma.order.update({ where: { id: +req.params.id }, data: { status, note } }));
});
router.post('/webhooks/stripe', async (req, res) => { res.end(); });
module.exports = router;
