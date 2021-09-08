const express = require("express");
const {
  can_view_printer_types,
  can_add_printer_types,
  can_edit_printer_types,
  can_delete_printer_types,
  can_approve_printer_types,
} = require("../../../config/permissions/permissions.config");
const {
  getPrinterTypes,
  getPrinterTypeDetails,
  addPrinterTypes,
  editPrinterType,
  approvePrinterType,
  deletePrinterType,
} = require("../../../controllers/printers/printerTypes/printerTypes.controller");
const checkHasPermission = require("../../../middlewares/permissions/permissions");
const printerTypesRouter = express.Router();

printerTypesRouter.get(
  "/",
  checkHasPermission(can_view_printer_types).permission,
  getPrinterTypes
);
printerTypesRouter.get(
  "/:printerTypeId",
  checkHasPermission(can_view_printer_types).permission,
  getPrinterTypeDetails
);
printerTypesRouter.post(
  "/",
  checkHasPermission(can_add_printer_types).permission,
  addPrinterTypes
);
printerTypesRouter.put(
  "/:printerTypeId",
  checkHasPermission(can_edit_printer_types).permission,
  editPrinterType
);
printerTypesRouter.patch(
  "/approve/:printerTypeId",
  checkHasPermission(can_approve_printer_types).permission,
  approvePrinterType
);
printerTypesRouter.delete(
  "/:printerTypeId",
  checkHasPermission(can_delete_printer_types).permission,
  deletePrinterType
);

module.exports = printerTypesRouter;
