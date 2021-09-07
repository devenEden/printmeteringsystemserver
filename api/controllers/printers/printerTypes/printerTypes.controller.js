const pool = require("../../../config/db/connectToDb");
const sanitize = require("../../../helpers/sanitizer");
const { trimObject } = require("../../../helpers/trim");
const ErrorResponse = require("../../../utils/errors/errorResponse");
const { pending, status } = require("../../../config/config");

const getPrinterTypes = async (req, res, next) => {
  try {
    const { permission } = req;
    if (!permission)
      return next(
        new ErrorResponse(
          "You do not have permissions to view printer types",
          400
        )
      );
    const printerTypes = await pool.query("select * from printers");
    res.status(200).json({
      success: true,
      message: "Successfully loaded data",
      data: printerTypes.rows,
    });
  } catch (error) {
    next(error);
  }
};

const addPrinterTypes = async (req, res, next) => {
  try {
    sanitize(req.body);
    trimObject(req.body);
    const { permission, user } = req;
    const { name, unit_cost, created_at } = req.body;
    if (!permission)
      return next(
        new ErrorResponse(
          "You do not have permissions to add printer types",
          400
        )
      );
    if (!name || !unit_cost)
      return next(new ErrorResponse("Please fill in all fields", 400));
    const addPrinterType = await pool.query(
      "insert into printer_types(name,unit_cost,status,created_by,created_at) values ($1,$2,$3,$4,$5) returning *",
      [name, parseInt(unit_cost), pending, user.id, created_at]
    );
    res.status(201).json({
      success: true,
      message: "Successfully added printer type",
      data: addPrinterType.rows,
    });
  } catch (error) {
    next(error);
  }
};

const editPrinterType = async (req, res, next) => {
  try {
    const { user, permission } = req.params;
    const { printerTypeId } = req.params;
    sanitize(req.body);
    trimObject(req.body);
    const { name, unit_cost, updated_at } = req.body;
    if (!permission)
      return next(
        new ErrorResponse(
          "You do not have permissions to add printer types",
          400
        )
      );
    if (!name || !unit_cost)
      return next(new ErrorResponse("Please fill in all fields", 400));
    const editPrinterType = await pool.query(
      "update printer_types set name=$1,unit_cost=$2, updated_by=$3,updated_at=$4 where id = $5 rturning *",
      [name, parseInt(unit_cost), user.id, updated_at, printerTypeId]
    );
    res.status(200).json({
      Success: true,
      message: "Successfully edited printer type",
      data: editPrinterType.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

const deletePrinterType = async (req, res, next) => {
  try {
    const { printerTypeId } = req.params;
    const { permission } = req;
    if (!permission)
      return next(
        new ErrorResponse(
          "You do not have permission to delete printer types",
          400
        )
      );
    const checkPrinters = await pool.query(
      "select * from printers where printer_type = $1",
      [printerTypeId]
    );
    if (checkPrinters.rowCount > 0)
      return next(
        new ErrorResponse(
          `There are ${checkPrinters.rowCount} printer(s) under this printer type. please edit or delete them before you delete this printer type`,
          400
        )
      );
    await pool.query("delete from printer_types where id =$1", [printerTypeId]);
    res.status(200).json({
      success: true,
      message: "Successfully deleted printer_type",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

const approvePrinterType = async (req, res, next) => {
  try {
    const { printerTypeId } = req.params;
    const { user, permission } = req;
    const { approvedAt } = req.body;
    if (!permission)
      return next(
        new ErrorResponse(
          "You do not have permission to approve printer types",
          400
        )
      );
    const checkRoleInfo = await pool.query(
      "select status from printer_type where id=$1",
      [printerTypeId]
    );
    if (checkRoleInfo.rows[0].status === status.approved)
      return next(
        new ErrorResponse(
          "The printer_type you selected has already been approved",
          400
        )
      );
    await pool.query(
      "update printer_types set status=$1, approved_by=$2, approved_at=$3 where id = $1",
      [status.approved, user.id, approvedAt, printerTypeId]
    );
    res
      .status(200)
      .json({ success: true, message: "Successfully approved printer_types" });
  } catch (error) {
    next(error);
  }
};

const getPrinterTypeDetails = async (req, res, next) => {
  try {
    const { printerTypeId } = req.params;
    const printerTypeDetails = await pool.query(
      "select * from printer_types where id=$1",
      [printerTypeId]
    );
    if (printerTypeDetails.rowCount < 1)
      return next(
        new ErrorResponse(
          "The printer type you selected does not exist or was deleted",
          500
        )
      );
    const printers = await pool.query(
      "select * from printers where printer_type=$1",
      [printerTypeId]
    );
    const namesSql = "select first_name, other_names from users where id=$1";
    const creator = await pool.query(namesSql, [
      printerTypeDetails.rows[0].created_by,
    ]);
    const updator = await pool.query(namesSql, [
      printerTypeDetails.rows[0].updated_by,
    ]);
    const approver = await pool.query(namesSql, [
      printerTypeDetails.rows[0].approved_by,
    ]);
    res.status(200).json({
      success: true,
      message: "Successfully loaded data",
      data: {
        ...printerTypeDetails.rows[0],
        printers: printers.rows,
        creator: creator.rows[0],
        approver: approver.rows[0],
        updator: updator.rows[0],
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPrinterTypes,
  addPrinterTypes,
  editPrinterType,
  deletePrinterType,
  approvePrinterType,
  getPrinterTypeDetails,
};
