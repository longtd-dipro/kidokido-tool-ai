const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const audit = require('../services/audit');

async function list(req, res) {
  const { page, keyword } = req.query;
  res.json(await prisma.user.findMany({ where: { name: { contains: keyword } } }));
}
async function create(req, res) {
  const u = await prisma.user.create({ data: { name: req.body.name, email: req.body.email } });
  await audit.log(u.id, 'create');
  res.status(201).json(u);
}
async function getOne(req, res) { res.json(await prisma.user.findUnique({ where: { id: +req.params.id } })); }
async function remove(req, res) { await prisma.user.delete({ where: { id: +req.params.id } }); res.status(204).end(); }
module.exports = { list, create, getOne, remove };
