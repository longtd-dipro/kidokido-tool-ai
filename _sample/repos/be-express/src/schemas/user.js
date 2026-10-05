const Joi = require('joi');
const createUserSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  role: Joi.string().valid('admin', 'staff'),
});
function validate(schema) { return (req, res, next) => { const r = schema.validate(req.body); if (r.error) return res.status(400).end(); next(); }; }
module.exports = { createUserSchema, validate };
