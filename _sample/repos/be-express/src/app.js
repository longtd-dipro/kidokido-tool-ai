const express = require('express');
const usersRouter = require('./routes/users');
const app = express();
app.use(express.json());
app.use('/api/users', usersRouter);
app.use('/api/orders', require('./routes/orders'));
app.get('/health', (req, res) => res.json({ ok: true }));
module.exports = app;
