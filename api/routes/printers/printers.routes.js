const express = require("express");
const {
  can_view_printers,
  can_approve_printers,
  can_add_printers,
  can_edit_printers,
  can_delete_printers,
} = require("../../config/permissions/permissions.config");
const {
  getPrinters,
  approvePrinter,
  getPrinterDetails,
  addPrinter,
  editPrinter,
  deletePrinter,
  metaData,
} = require("../../controllers/printers/printers.controller");
const protect = require("../../middlewares/auth/protect");
const checkHasPermission = require("../../middlewares/permissions/permissions");
const printerTypesRouter = require("./printerTypes/printerTypes.routes");
const printOutsRouter = require("./print_outs/printOuts.routes");

const printerRouter = express.Router();

printerRouter.use(protect);

printerRouter.use("/printOuts", printOutsRouter);
printerRouter.use("/types", printerTypesRouter);

printerRouter.get(
  "/",
  checkHasPermission(can_view_printers).permission,
  getPrinters
);
printerRouter.get("/metadata", metaData);
printerRouter.get(
  "/:printerId",
  checkHasPermission(can_view_printers).permission,
  getPrinterDetails
);
printerRouter.post(
  "/",
  checkHasPermission(can_add_printers).permission,
  addPrinter
);
printerRouter.put(
  "/:printerId",
  checkHasPermission(can_edit_printers).permission,
  editPrinter
);
printerRouter.delete(
  "/:printerId",
  checkHasPermission(can_delete_printers).permission,
  deletePrinter
);
printerRouter.patch(
  "/approve/:printerId",
  checkHasPermission(can_approve_printers).permission,
  approvePrinter
);

module.exports = printerRouter;
