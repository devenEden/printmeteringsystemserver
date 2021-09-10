const express = require("express");
const { getBilling } = require("../../controllers/billing/billing.controller");

const billingRouter = express.Router();

billingRouter.get("/", getBilling);

module.exports = billingRouter;
