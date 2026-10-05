const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/users');
const { requireAuth, requireRole } = require('../middleware/auth');
const { createUserSchema, validate } = require('../schemas/user');

router.get('/', requireAuth, ctrl.list);
router.post('/', requireAuth, requireRole('admin'), validate(createUserSchema), ctrl.create);
router.get('/:id', requireAuth, ctrl.getOne);
router.delete('/:id', requireAuth, requireRole('admin'), ctrl.remove);
module.exports = router;
