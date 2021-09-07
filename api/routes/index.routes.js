const express = require('express');
const authRouter = require('./auth/auth.routes');

const router = express.Router();

router.use("/auth", authRouter);

module.exports = router