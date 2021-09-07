const ErrorResponse = require("../../utils/errors/errorResponse");

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = {
    ...err,
  };
  error.message = err.message;
  console.log("====================================");
  console.log(error);
  console.log("====================================");

  if (err.code === "23502")
    error = new ErrorResponse(`Please fill in all fields`, 400);

  if (err.code === "23505") {
    const errDetailsArr = err.detail.split("(");
    const fieldArray = errDetailsArr[2].split(")");
    error = new ErrorResponse(
      `${fieldArray[0]} already exists, please try another`,
      409
    );
  }

  if (!error.statusCode) error.message = "Sorry internal server error occured";

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Sorry an internal server error occured",
  });
};

module.exports = errorHandler;
