const express = require("express");
const authRouter = require("./auth/auth.routes");
const billingRouter = require("./billing/billing.routes");
const printerRouter = require("./printers/printers.routes");
const rolesRouter = require("./roles/roles.routes");
const usersRouter = require("./users/users.routes");

const router = express.Router();

router.use("/auth", authRouter);
router.use("/roles", rolesRouter);
router.use("/printers", printerRouter);
router.use("/users", usersRouter);
router.use("/billing", billingRouter);

module.exports = router;
