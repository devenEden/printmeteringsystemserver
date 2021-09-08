const express = require("express");
const {
  can_view_print_outs,
  can_add_print_outs,
  can_edit_print_outs,
  can_delete_print_outs,
  can_approve_print_outs,
} = require("../../../config/permissions/permissions.config");
const {
  getPrinterOuts,
  getPrintOutDetails,
  addPrintOut,
  editPrintOut,
  deletePrintOut,
  approvePrintOut,
} = require("../../../controllers/printers/printOuts/printOuts.controller");
const checkHasPermission = require("../../../middlewares/permissions/permissions");
const printOutsRouter = express.Router();

printOutsRouter.get(
  "/",
  checkHasPermission(can_view_print_outs).permission,
  getPrinterOuts
);
printOutsRouter.get(
  "/:printOutId",
  checkHasPermission(can_view_print_outs).permission,
  getPrintOutDetails
);
printOutsRouter.post(
  "/",
  checkHasPermission(can_add_print_outs).permission,
  addPrintOut
);
printOutsRouter.put(
  "/:printOutId",
  checkHasPermission(can_edit_print_outs).permission,
  editPrintOut
);
printOutsRouter.delete(
  "/:printOutId",
  checkHasPermission(can_delete_print_outs).permission,
  deletePrintOut
);
printOutsRouter.patch(
  "/approve/:printOutId",
  checkHasPermission(can_approve_print_outs).permission,
  approvePrintOut
);

module.exports = printOutsRouter;
