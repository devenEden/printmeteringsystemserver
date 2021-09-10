const express = require("express");
const {
  can_view_billing,
} = require("../../config/permissions/permissions.config");
const { getBilling } = require("../../controllers/billing/billing.controller");
const protect = require("../../middlewares/auth/protect");
const checkHasPermission = require("../../middlewares/permissions/permissions");

const billingRouter = express.Router();

billingRouter.use(protect);
billingRouter.get(
  "/",
  checkHasPermission(can_view_billing).permission,
  getBilling
);

module.exports = billingRouter;
