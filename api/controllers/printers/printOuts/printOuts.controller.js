const { sanitize } = require("sanitizer");
const pool = require("../../../config/db/connectToDb");
const { trimObject } = require("../../../helpers/trim");
const checkProperties = require("../../../helpers/validateObject");
const ErrorResponse = require("../../../utils/errors/errorResponse");
const { approved, status } = require("../../../config/config");
const xlsx = require("xlsx");
const fs = require("fs");

const getPrinterOuts = async (req, res, next) => {
  try {
    const { permission } = req;
    if (!permission)
      return next(
        new ErrorResponse("You do not have permission to view print Outs", 400)
      );
    const printOuts = await pool.query(
      "select * from print_outs order by created_at desc"
    );
    const getPrintOutCosts = (printOuts) => {
      return Promise.all(
        printOuts.map(async (printOut) => {
          const printerData = await pool.query(
            "select printers.name,unit_cost from printer_types inner join printers on printers.printer_type = printer_types.id where printers.id=$1",
            [printOut.printer]
          );

          return {
            ...printOut,
            printerName: printerData.rows[0].name,
            total_cost:
              parseInt(printerData.rows[0].unit_cost) * printOut.print_outs,
            unit_cost: printerData.rows[0].unit_cost,
          };
        })
      );
    };
    res.status(200).json({
      success: true,
      message: "Successfully loaded data",
      data: await getPrintOutCosts(printOuts.rows),
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
      "select status from printers where id = $1",
      [printer]
    );
    if (checkPrinterInfo.rowCount < 1)
      return next(
        new ErrorResponse(
          "The printer  you selected does not exist or was deleted",
          404
        )
      );
    /* else if (parseInt(checkPrinterInfo.rows[0].status) !== status.approved)
      return next(
        new ErrorResponse(
          "The printer  you selected has not yet been approved",
          400
        )
      ); */
    const insertPrinter = await pool.query(
      "insert into print_outs (print_outs,printer,status,created_at,created_by) values($1,$2,$3,$4,$5) returning * ",
      [parseInt(print_outs), printer, status.pending, created_at, user.id]
    );

    res.status(201).json({
      success: true,
      message: "Successfully added print out",
      data: insertPrinter.rows,
    });
  } catch (error) {
    next(error);
  }
};

const editPrintOut = async (req, res, next) => {
  try {
    const { printOutId } = req.params;
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
      "select status from printers where id = $1",
      [printer]
    );
    if (checkPrinterInfo.rowCount < 1)
      return next(
        new ErrorResponse(
          "The printer  you selected does not exist or was deleted",
          404
        )
      );
    else if (parseInt(checkPrinterInfo.rows[0].status) !== status.approved)
      return next(
        new ErrorResponse(
          "The printer  you selected has not yet been approved",
          400
        )
      );
    const editPrintOut = await pool.query(
      "update print_outs set print_outs=$1,printer=$2,updated_by=$3,updated_at=$4 where id=$5 returning *",
      [parseInt(print_outs), printer, user.id, updated_at, printOutId]
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
    const { printOutId } = req.params;
    const { permission } = req;
    if (!permission)
      return next(
        new ErrorResponse(
          "You do not have permission to delete print outs",
          400
        )
      );
    await pool.query("delete from print_outs where id=$1", [printOutId]);

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
    const { printOutId } = req.params;
    const { permission } = req;
    if (!permission)
      return next(
        new ErrorResponse("You do not have permission to view printers", 400)
      );
    const printerOutsDetails = await pool.query(
      "select * from print_outs where id=$1",
      [printOutId]
    );
    if (printerOutsDetails.rowCount < 1)
      return next(
        new ErrorResponse(
          "The printer  you selected does not exist or was deleted",
          500
        )
      );
    const printers = await pool.query(
      "select printers.name,unit_cost from printer_types inner join printers on printers.printer_type = printer_types.id where printers.id=$1",
      [printerOutsDetails.rows[0].printer]
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
        printerDetails: printers.rows[0],
        creator: creator.rows[0],
        approver: approver.rows[0],
        updator: updator.rows[0],
      },
    });
  } catch (error) {
    next(error);
  }
};

const importPrintOuts = async (req, res, next) => {
  try {
    const { file, permission, user } = req;
    if (!file) return next(new ErrorResponse("Please select a file", 400));
    if (!permission)
      return next(
        new ErrorResponse("You do not have permission to add print outs", 400)
      );
    const workBook = xlsx.readFile(file.path);
    let errors = [];
    let printOut = {};
    const printOuts = [];
    const workSheets = workBook.Sheets[workBook.SheetNames[0]];
    for (const cell in workSheets) {
      const cellAsString = cell.toString();
      if (!cellAsString.startsWith("!")) {
        if (cellAsString[0] === "A") printOut.printer = workSheets[cell].v;
        if (cellAsString[0] === "B") printOut.printOuts = workSheets[cell].v;
        if (cellAsString[0] === "C") {
          printOut.createdAt = workSheets[cell].w;
          if (!checkProperties(printOut))
            errors.push(`${workSheets[cell].v} had  empty values`);
          else printOuts.push(printOut);
          printOut = {};
        }
      }
    }
    console.log(printOuts);
    printOuts.forEach(async (printOut) => {
      try {
        console.log(printOut.printer);
        const printerId = await pool.query(
          "select id from printers where name=$1",
          [printOut.printer]
        );
        if (printerId.rowCount < 1) {
          errors.push(`Printer had an Invalid Printer Name`);
          console.log(errors);
        } else {
          await pool.query(
            "insert into print_outs (created_by,created_at,print_outs,printer,status) values($1,$2,$3,$4,$5)",
            [
              user.id,
              printOut.createdAt,
              printOut.printOuts,
              parseInt(printerId.rows[0].id),
              status.approved,
            ]
          );
        }
      } catch (error) {
        next(error);
      }
    });
    fs.unlink(file.path, (err) => {
      if (err) console.error(err);
    });
    res.status(200).json({
      success: true,
      message: "Successfully Imported records",
      data: { file, errors },
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
  importPrintOuts,
};
