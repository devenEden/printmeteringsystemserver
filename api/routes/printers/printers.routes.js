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
} = require("../../controllers/printers/printers.controller");
const checkHasPermission = require("../../middlewares/permissions/permissions");
const printerTypesRouter = require("./printerTypes/printerTypes.routes");
const printOutsRouter = require("./print_outs/printOuts.routes");

const printerRouter = express.Router();

printerRouter.get(
  "/",
  checkHasPermission(can_view_printers).permission,
  getPrinters
);
printerRouter.get(
  "/:printerId",
  checkHasPermission(can_view_printers).permission,
  getPrinterDetails
);
printerRouter.post("/", checkHasPermission(can_add_printers), addPrinter);
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
printerRouter.use("/printOuts", printOutsRouter);
printOutsRouter.use("/types", printerTypesRouter);

module.exports = printerRouter;
