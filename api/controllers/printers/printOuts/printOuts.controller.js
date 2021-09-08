const { sanitize } = require("sanitizer");
const pool = require("../../../config/db/connectToDb");
const { trimObject } = require("../../../helpers/trim");
const checkProperties = require("../../../helpers/validateObject");
const ErrorResponse = require("../../../utils/errors/errorResponse");
const { approved, pending } = require("../../../config/config");

const getPrinterOuts = async (req, res, next) => {
  try {
    const { permission } = req;
    if (!permission)
      return next(
        new ErrorResponse("You do not have permission to view print Outs", 400)
      );
    const printOuts = await pool.query("select * from print_outs", 400);
    res.status(200).json({
      success: true,
      message: "Successfully loaded data",
      data: printOuts.rows,
    });
  } catch (error) {
    next(error);
  }
};

const addPrintOut = async (req, res, next) => {
  try {
    sanitize(req.params);
    trimObject(req.body);
    const { permission, user } = req;
    if (!permission)
      return next(
        new ErrorResponse("You do not have permission to add printer outs", 400)
      );
    if (!checkProperties(req.body))
      return next(new ErrorResponse("Please fill in all fields", 400));
    const { print_outs, printer, created_at } = req.body;

    const checkPrinterInfo = await pool.query(
      "select status from printer where id = $1",
      [printer]
    );
    if (checkPrinterInfo.rowCount < 1)
      return next(
        new ErrorResponse(
          "The printer  you selected does not exist or was deleted",
          404
        )
      );
    else if (checkPrinterInfo.rows[0].status !== approved)
      return next(
        new ErrorResponse(
          "The printer  you selected has not yet been approved",
          400
        )
      );
    const insertPrinter = await pool.query(
      "insert into print_outs (print_outs,printer,status,created_at,created_by) values($1,$2,$3,$4,$5,$6,$7) returning * ",
      [parseInt(print_outs), printer, pending, user.id, created_at]
    );

    res.status(201).json({
      success: true,
      message: "Successfully added printer",
      data: insertPrinter.rows,
    });
  } catch (error) {
    next(error);
  }
};

const editPrintOut = async (req, res, next) => {
  try {
    const { printerOutId } = req.params;
    sanitize(req.params);
    trimObject(req.body);
    const { permission, user } = req;
    if (!permission)
      return next(
        new ErrorResponse("You do not have permission to add print outs", 400)
      );
    if (!checkProperties(req.body))
      return next(new ErrorResponse("Please fill in all fields", 400));
    const { print_outs, printer, updated_at } = req.body;

    const checkPrinterInfo = await pool.query(
      "select status from printer where id = $1",
      [printer]
    );
    if (checkPrinterInfo.rowCount < 1)
      return next(
        new ErrorResponse(
          "The printer  you selected does not exist or was deleted",
          404
        )
      );
    else if (checkPrinterInfo.rows[0].status !== approved)
      return next(
        new ErrorResponse(
          "The printer  you selected has not yet been approved",
          400
        )
      );
    const editPrintOut = await pool.query(
      "update print_outs set print_outs=$1,printer=$2,status=$3,updated_by=$4,updated_at=$5 where id=$6",
      [
        parseInt(print_outs),
        printer,
        pending,
        user.id,
        updated_at,
        printerOutId,
      ]
    );
    res.status(200).json({
      success: true,
      message: "Successfully edited printer",
      data: editPrintOut.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

const deletePrintOut = async (req, res, next) => {
  try {
    const { printerOutId } = req.params;
    const { permission } = req;
    if (!permission)
      return next(
        new ErrorResponse(
          "You do not have permission to delete print outs",
          400
        )
      );
    await pool.query("delete from print_outs where id =$1", [printerOutId]);
    res.status(200).json({
      success: true,
      message: "Successfully deleted printer",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

const approvePrintOut = async (req, res, next) => {
  try {
    const { printerId } = req.params;
    const { user, permission } = req;
    const { approvedAt } = req.body;
    if (!permission)
      return next(
        new ErrorResponse(
          "You do not have permission to approve print out",
          400
        )
      );
    const checkInfo = await pool.query(
      "select status from print_outs where id=$1",
      [printerId]
    );
    if (checkInfo.rows[0].status === approved)
      return next(
        new ErrorResponse(
          "The print out you selected has already been approved",
          400
        )
      );
    await pool.query(
      "update print_outs set status=$1, approved_by=$2, approved_at=$3 where id = $1",
      [approved, user.id, approvedAt, printerId]
    );
    res
      .status(200)
      .json({ success: true, message: "Successfully approved print out" });
  } catch (error) {
    next(error);
  }
};

const getPrintOutDetails = async (req, res, next) => {
  try {
    const { printerId } = req.params;
    const { permission } = req;
    if (!permission)
      return next(
        new ErrorResponse("You do not have permission to view printers", 400)
      );
    const printerOutsDetails = await pool.query(
      "select * from printers where id=$1",
      [printerId]
    );
    if (printerOutsDetails.rowCount < 1)
      return next(
        new ErrorResponse(
          "The printer  you selected does not exist or was deleted",
          500
        )
      );
    const printers = await pool.query(
      "select * from printers where printer_type=$1",
      [printerId]
    );
    const namesSql = "select first_name, other_names from users where id=$1";
    const creator = await pool.query(namesSql, [
      printerOutsDetails.rows[0].created_by,
    ]);
    const updator = await pool.query(namesSql, [
      printerOutsDetails.rows[0].updated_by,
    ]);
    const approver = await pool.query(namesSql, [
      printerOutsDetails.rows[0].approved_by,
    ]);
    res.status(200).json({
      success: true,
      message: "Successfully loaded data",
      data: {
        ...printerOutsDetails.rows[0],
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
  getPrinterOuts,
  addPrintOut,
  editPrintOut,
  deletePrintOut,
  approvePrintOut,
  getPrintOutDetails,
};
