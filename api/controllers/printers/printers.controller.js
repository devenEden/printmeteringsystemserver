const pool = require("../../config/db/connectToDb");
const sanitize = require("../../helpers/sanitizer");
const { trimObject } = require("../../helpers/trim");
const checkProperties = require("../../helpers/validateObject");
const ErrorResponse = require("../../utils/errors/errorResponse");
const { status } = require("../../config/config");

const getPrinters = async (req, res, next) => {
  try {
    const { permission } = req;
    if (!permission)
      return next(
        new ErrorResponse("You do not have permission to view printers", 400)
      );
    const printers = await pool.query("select * from printers");
    res.status(200).json({
      success: true,
      message: "Successfully loaded data",
      data: printers.rows,
    });
  } catch (error) {
    next(error);
  }
};

const addPrinter = async (req, res, next) => {
  try {
    sanitize(req.params);
    trimObject(req.body);
    const { permission, user } = req;
    if (!permission)
      return next(
        new ErrorResponse("You do not have permission to add printers", 400)
      );
    if (!checkProperties(req.body))
      return next(new ErrorResponse("Please fill in all fields", 400));
    const { name, ip, location, printer_type, created_at } = req.body;
    const checkPrinterTypeInfo = await pool.query(
      "select status from printer_types where id = $1",
      [printer_type]
    );
    if (checkPrinterTypeInfo.rowCount < 1)
      return next(
        new ErrorResponse(
          "The printer type you selected does not exist or was deleted",
          404
        )
      );
    /* else if (parseInt(checkPrinterTypeInfo.rows[0].status) !== status.approved)
      return next(
        new ErrorResponse(
          "The printer type you selected has not yet been approved",
          400
        )
      ); */
    const insertPrinter = await pool.query(
      "insert into printers (name,ip,location,printer_type,status,created_at,created_by) values($1,$2,$3,$4,$5,$6,$7) returning * ",
      [name, ip, location, printer_type, status.pending, created_at, user.id]
    );

    res.status(201).json({
      success: true,
      message: "Successfully added printer",
      data: insertPrinter.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

const editPrinter = async (req, res, next) => {
  try {
    const { printerId } = req.params;
    sanitize(req.params);
    trimObject(req.body);
    const { permission, user } = req;
    if (!permission)
      return next(
        new ErrorResponse("You do not have permission to edit printers", 400)
      );
    if (!checkProperties(req.body))
      return next(new ErrorResponse("Please fill in all fields", 400));
    const { name, ip, location, printer_type, updated_at } = req.body;
    const checkPrinterTypeInfo = await pool.query(
      "select status from printer_types where id = $1",
      [printer_type]
    );
    if (checkPrinterTypeInfo.rowCount < 1)
      return next(
        new ErrorResponse(
          "The printer type you selected does not exist or was deleted",
          404
        )
      );
    else if (parseInt(checkPrinterTypeInfo.rows[0].status) !== status.approved)
      return next(
        new ErrorResponse(
          "The printer type you selected has not yet been approved",
          400
        )
      );
    const editPrinter = await pool.query(
      "update printers set printer_type=$1,name=$2,ip=$3,location=$4,updated_by=$5,updated_at=$6 where id=$7 returning *",
      [printer_type, name, ip, location, user.id, updated_at, printerId]
    );
    res.status(200).json({
      success: true,
      message: "Successfully edited printer",
      data: editPrinter.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

const deletePrinter = async (req, res, next) => {
  try {
    const { printerId } = req.params;
    const { permission } = req;
    if (!permission)
      return next(
        new ErrorResponse("You do not have permission to delete printers", 400)
      );
    const checkPrinterOuts = await pool.query(
      "select * from print_outs where  printer= $1",
      [printerId]
    );
    if (checkPrinterOuts.rowCount > 0)
      return next(
        new ErrorResponse(
          `There are ${checkPrinterOuts.rowCount} print outs under this printer . please edit or delete them before you delete this printer `,
          400
        )
      );
    await pool.query("delete from printers where id =$1", [printerId]);
    res.status(200).json({
      success: true,
      message: "Successfully deleted printer",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

const approvePrinter = async (req, res, next) => {
  try {
    const { printerId } = req.params;
    const { user, permission } = req;
    const { approvedAt } = req.body;
    if (!permission)
      return next(
        new ErrorResponse("You do not have permission to approve printers", 400)
      );
    const checkInfo = await pool.query(
      "select status from printers where id=$1",
      [printerId]
    );
    if (checkInfo.rows[0].status === status.approved)
      return next(
        new ErrorResponse(
          "The printer you selected has already been approved",
          400
        )
      );
    await pool.query(
      "update printers set status=$1, approved_by=$2, approved_at=$3 where id = $4",
      [status.approved, user.id, approvedAt, printerId]
    );
    res
      .status(200)
      .json({ success: true, message: "Successfully approved printer" });
  } catch (error) {
    next(error);
  }
};

const getPrinterDetails = async (req, res, next) => {
  try {
    const { printerId } = req.params;
    const { permission } = req;
    if (!permission)
      return next(
        new ErrorResponse("You do not have permission to view printers", 400)
      );
    const printerDetails = await pool.query(
      "select * from printers where id=$1",
      [printerId]
    );
    if (printerDetails.rowCount < 1)
      return next(
        new ErrorResponse(
          "The printer  you selected does not exist or was deleted",
          500
        )
      );
    const printerType = await pool.query(
      "select name,unit_cost from printer_types where id=$1 ",
      [printerDetails.rows[0].printer_type]
    );
    const printerOuts = await pool.query(
      "select * from print_outs where printer=$1",
      [printerId]
    );
    const namesSql = "select first_name, other_names from users where id=$1";
    const creator = await pool.query(namesSql, [
      printerDetails.rows[0].created_by,
    ]);
    const updator = await pool.query(namesSql, [
      printerDetails.rows[0].updated_by,
    ]);
    const approver = await pool.query(namesSql, [
      printerDetails.rows[0].approved_by,
    ]);
    res.status(200).json({
      success: true,
      message: "Successfully loaded data",
      data: {
        ...printerDetails.rows[0],
        printerTypeDetails: printerType.rows[0],
        printOuts: printerOuts.rows,
        creator: creator.rows[0],
        approver: approver.rows[0],
        updator: updator.rows[0],
      },
    });
  } catch (error) {
    next(error);
  }
};

const metaData = async (req, res, next) => {
  try {
    const printers = await pool.query("select name,id from printers ");
    const printerTypes = await pool.query("select name,id from printer_types ");
    res.status(200).json({
      success: true,
      message: "Successfully loading data",
      data: { printers: printers.rows, printerTypes: printerTypes.rows },
    });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  getPrinters,
  addPrinter,
  editPrinter,
  approvePrinter,
  deletePrinter,
  getPrinterDetails,
  metaData,
};
