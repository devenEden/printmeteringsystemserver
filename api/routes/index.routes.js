const express = require("express");
const authRouter = require("./auth/auth.routes");
const rolesRouter = require("./roles/roles.routes");

const router = express.Router();

router.use("/auth", authRouter);
router.use("/roles", rolesRouter);

module.exports = router;
