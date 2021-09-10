const pool = require("../../config/db/connectToDb");
const { dateRange } = require("../../helpers/dateRange");

const getBilling = async (req, res, next) => {
  try {
    // get the oldest print out in the system
    const oldestPrintOut = await pool.query(
      "select created_at from print_outs  order  by created_at asc limit 1"
    );
    let oldestDate = new Date(oldestPrintOut.rows[0].created_at).toISOString();
    oldestDate = oldestDate.split("T");
    let currentDate = new Date().toISOString();
    currentDate = currentDate.split("T");
    //get the months from the oldest period up to current period
    const billingCyclePeriod = dateRange(oldestDate[0], currentDate[0]);
    //const printOuts = await pool.query("select * from print_outs");

    const generateBillingCycle = (months, printOuts, unit_cost) => {
      return months.map((month) => {
        //get print outs before this month
        const printOutsBeforeThisMonth = printOuts.filter((printOut) => {
          return new Date(printOut.created_at) < new Date(month);
        });
        let totalBeforeThisMonth = 0;
        printOutsBeforeThisMonth?.forEach((printOut) => {
          totalBeforeThisMonth += printOut.print_outs;
        });
        //get printouts in this month
        const monthPrintOuts = printOuts.filter((printOut) => {
          return (
            new Date(printOut.created_at).getMonth() ===
            new Date(month).getMonth()
          );
        });
        let totalForThisMonth = 0;
        monthPrintOuts.forEach((printOut) => {
          totalForThisMonth += printOut.print_outs;
        });

        const total_cost = unit_cost * totalForThisMonth;
        return {
          period: `${new Date(month).toLocaleString("default", {
            month: "long",
          })} ${new Date(month).getFullYear()}`,
          opening: totalBeforeThisMonth,
          closing: totalForThisMonth + totalBeforeThisMonth,
          consuption: totalForThisMonth,
          total_cost,
        };
      });
    };
    const getPrinters = await pool.query(
      "select printers.id as id, printers.name as printer_name ,location,printer_types.name as printer_type,printer_types.unit_cost from printers inner join printer_types on printer_types.id = printers.printer_type"
    );
    const addBillingToPrinters = (printers, billingCyclePeriod) => {
      return Promise.all(
        printers.map(async (printer) => {
          const printOuts = await pool.query(
            "select * from print_outs where printer=$1",
            [printer.id]
          );
          const printerBillingCycle = generateBillingCycle(
            billingCyclePeriod,
            printOuts.rows,
            printer.unit_cost
          );
          return { ...printer, printerBillingCycle };
        })
      );
    };
    res.status(200).json({
      success: true,
      message: "Successfully loaded data",
      data: await addBillingToPrinters(getPrinters.rows, billingCyclePeriod),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBilling };
