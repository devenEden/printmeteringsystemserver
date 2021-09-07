const jwt = require("jsonwebtoken");
const pool = require("../../config/db/connectToDb");
const ErrorResponse = require("../../utils/errors/errorResponse");

/**
 * This function verifies the users login token using jwt synchronously
 * then it checks whether the account is confirmed and also whether the account is active
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
const protect = async (req, res, next) => {
  try {
    let token;
    let authorizationArray = [];
    if (
      !req.headers.authorization ||
      !req.headers.authorization.startsWith("Bearer")
    )
      return next(new ErrorResponse("Unauthorized access", 401));
    else authorizationArray = req.headers.authorization?.split(" ");

    // eslint-disable-next-line no-undef
    token = authorizationArray[1];

    if (!token) return next(new ErrorResponse("Unauthorized access", 401));

    // eslint-disable-next-line no-undef
    const decodedJwt = jwt.verify(token, process.env.JWT_AUTH_TOKEN);

    const userSql =
      "select email,id,role,other_names,first_name from users where id=$1 ";
    const result = await pool.query(userSql, [decodedJwt.id]);

    if (result.rowCount <= 0)
      return next(new ErrorResponse("Invalid user credentials", 403));

    if (!result.rows[0].account_confirmed)
      return next(
        new ErrorResponse(
          "Sorry your account has not yet been confirmed please check your email for a confirmation message or request a new Confirmation request",
          401
        )
      );

    // if (result.rows[0].account_status !== "active")
    //   return next(new ErrorResponse("Your account has been deactivated", 401));

    req.user = result.rows[0];

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = protect;
