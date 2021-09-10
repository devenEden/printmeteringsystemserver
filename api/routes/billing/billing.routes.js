const express = require("express");
const {
  can_view_billing,
} = require("../../config/permissions/permissions.config");
const { getBilling } = require("../../controllers/billing/billing.controller");
const checkHasPermission = require("../../middlewares/permissions/permissions");

const billingRouter = express.Router();

billingRouter.get(
  "/",
  checkHasPermission(can_view_billing).permission,
  getBilling
);

module.exports = billingRouter;
