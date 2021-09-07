const pool = require("../../config/db/connectToDb");
const validateEmail = require("../../helpers/emailValidator");
const sanitize = require("../../helpers/sanitizer");
const { trimObject } = require("../../helpers/trim");
const checkProperties = require("../../helpers/validateObject");
const comparePasswords = require("../../utils/auth/comparePassword.util");
const hashPassword = require("../../utils/auth/hashPasswords");
const {
  confirmationToken,
  authToken,
} = require("../../utils/auth/jwtGenerator");
const { resetPasswordToken } = require("../../utils/auth/resetToken.util");
const emailConfirmationHtml = require("../../utils/email/html/emailConfirmation.html");
const sendMail = require("../../utils/email/sendEmail.util");
const ErrorResponse = require("../../utils/errors/errorResponse");
const jwt = require("jsonwebtoken");
const resetPasswordHtml = require("../../utils/email/html/resetPassword.html");

const registerUser = async (req, res, next) => {
  sanitize(req.body);
  trimObject(req.body);
  //const { user } = req;
  const { email, first_name, other_names, role, created_at } = req.body;
  const emailVerified = false;
  const password = await hashPassword(email);
  try {
    if (!checkProperties(req.body))
      return next(new ErrorResponse("Please fill in all fields", 400));

    if (!validateEmail(email))
      return next(new ErrorResponse("Please enter a valid email", 400));

    const confirmToken = confirmationToken(email);
    const username =
      `${first_name}${other_names}`.toLowerCase() +
      Math.floor(Math.random() * 10000);
    await pool.query(
      "insert into users(username,email,first_name,other_names,password,role,account_confirmed,created_by,created_at) values ($1,$2,$3,$4,$5,$6,$7,$8,$9) returning * ",
      [
        username,
        email,
        first_name,
        other_names,
        password,
        role,
        emailVerified,
        "me",
        created_at,
      ]
    );
    const emailMsgConfig = {
      to: email,
      subject: "Printer Tracker Account Confirmation",
      text: "Confirm your account",
      html: emailConfirmationHtml(
        // eslint-disable-next-line no-undef
        `${process.env.CLIENT_URL}/confirmAccount/${confirmToken}`,
        {
          username,
          password: email,
        }
      ),
    };

    sendMail(emailMsgConfig);
    res
      .status(201)
      .json({ success: true, message: "Successfully Registered User" });
  } catch (error) {
    next(error);
  }
};

/**
 * This function confirms the users account using jwt through sending an email to the user and updating the account confirmed  status to true
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
const confirmAccount = async (req, res, next) => {
  const { confirmationToken } = req.params;

  try {
    const decodedJwt = jwt.verify(
      confirmationToken,
      // eslint-disable-next-line no-undef
      process.env.JWT_ACCOUNT_CONFIRMATION_TOKEN
    );

    const checkAccountConfirmedSql =
      "select email from users where email = $1 and account_confirmed = $2 ";
    const checkConfirmed = await pool.query(checkAccountConfirmedSql, [
      decodedJwt.email,
      true,
    ]);

    if (checkConfirmed.rows.length > 0)
      return next(
        new ErrorResponse("Your account is all ready confirmed", 401)
      );

    const updateSql =
      "update users set account_confirmed = $1  where email = $2 returning email ";
    const result = await pool.query(updateSql, [true, decodedJwt.email]);

    if (result.rows.length <= 0)
      return next(
        new ErrorResponse("Sorry unable to confirm your account ...", 403)
      );

    res.status(200).json({
      success: true,
      data: "Your  account has successfully been confirmed you can now login",
    });
  } catch (error) {
    next(error);
  }
};
/**
 * This function generate a new token for account confirmation
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
const generateNewConfirmationToken = (req, res, next) => {
  sanitize(req.body);
  trimObject(req.body);
  const { email } = req.body;

  if (!email) return next(new ErrorResponse("Please fill in all fields", 400));

  try {
    const reConfirmToken = confirmationToken(email);

    const emailMsgConfig = {
      to: email,
      subject: "Your Printer Tracker Account Confirmation Request",
      text: "Your New account confirmation email ",
      html: emailConfirmationHtml(
        // eslint-disable-next-line no-undef
        `${process.env.CLIENT_URL}/confirmAccount/${reConfirmToken}`
      ),
    };

    sendMail(emailMsgConfig);

    res
      .status(200)
      .json({ success: true, message: `Email has been sent to ${email}` });
  } catch (error) {
    next(error);
  }
};
/**
 * This function logs in a user with valid credentials
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns returns an error incase an error occurs and response with json if there is no error
 *
 */
const loginUser = async (req, res, next) => {
  sanitize(req.body);
  trimObject(req.body);
  const { username, password } = req.body;

  try {
    if (!username || !password)
      return next(new ErrorResponse("Please fill in all fields", 400));

    const result = await pool.query(
      "select id,username,role,account_confirmed,password from users where username = $1",
      [username]
    );

    if (result.rowCount < 1)
      return next(new ErrorResponse("Invalid login Credentials", 401));

    if (!result.rows[0].account_confirmed)
      return next(
        new ErrorResponse(
          "Please check your email for a confirmation message sent to you  to confirm your account. Or Request a new confirmation message ",
          401
        )
      );

    const isPasswordValid = await comparePasswords(
      result.rows[0].password,
      password
    );

    if (!isPasswordValid)
      return next(new ErrorResponse("Invalid login credentials", 401));

    const auth_token = authToken({
      userId: result.rows[0].id,
      role: result.rows[0].role_id,
    });

    res.status(200).json({
      success: true,
      data: {
        user_credentials: auth_token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * This function generates an email for the user  to reset their password
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns returns an error incase an error occurs and response with json if there is no error
 */
const forgotPassword = async (req, res, next) => {
  sanitize(req.body);
  const { email } = req.body;
  const resetPasswordExpire = new Date(Date.now() + 1000 * 60 * 60 * 24 * 2);
  const resetToken = resetPasswordToken();
  const createdAt = new Date();

  try {
    if (!validateEmail(email))
      return next(new ErrorResponse("Please enter a valid email address", 400));

    if (!email)
      return next(new ErrorResponse("Please fill in all fields", 400));

    const result = await pool.query(
      "select email,id from users where email = $1 ",
      [email]
    );

    if (result.rowCount <= 0)
      return next(new ErrorResponse("Email Provided does not exist", 403));

    const resetPasswordSql =
      "insert into password_resets (user_id,reset_password_token,reset_password_expires,created_at) values ($1,$2,$3,$4)";
    await pool.query(resetPasswordSql, [
      result.rows[0].id,
      resetToken,
      resetPasswordExpire,
      createdAt,
    ]);

    const emailMsgConfig = {
      to: email,
      subject: "Reset your  account password",
      text: "You requested to reset your  password",
      html: resetPasswordHtml(
        // eslint-disable-next-line no-undef
        `${process.env.CLIENT_URL}/resetPassword/${resetToken}`
      ),
    };

    sendMail(emailMsgConfig);

    res.status(200).json({
      success: true,
      data: "An Email to reset your password has been sent to your account",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * This function resets the users password
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
const resetPassword = async (req, res, next) => {
  const { resetToken } = req.params;
  sanitize(req.body);
  const { password } = req.body;

  try {
    if (!password.trim() || !resetToken)
      return next(new ErrorResponse("Please fill in all fields", 400));

    if (password.length < 8)
      return next(
        new ErrorResponse(
          "Your password should have more than 8 characted ",
          400
        )
      );
    const result = await pool.query(
      "select reset_password_expires,user_id  from password_resets where reset_password_token=$1",
      [resetToken]
    );

    if (result.rowCount <= 0)
      return next(new ErrorResponse("Invalid password reset request", 403));

    const rightNow = new Date();
    const resetPasswordExpires = new Date(
      result.rows[0].reset_password_expires
    );

    if (rightNow >= resetPasswordExpires)
      return next(
        new ErrorResponse(
          "Your password reset request has expired please request another",
          400
        )
      );
    const hashedPassword = await hashPassword(password);
    const updatePasswordSql = "update users set password=$1 where id = $2 ";
    const deleteTokenSql =
      "update password_resets set reset_password_token = $2 where reset_password_token=$1";

    await pool.query(updatePasswordSql, [
      hashedPassword,
      result.rows[0].user_id,
    ]);
    await pool.query(deleteTokenSql, [resetToken, true]);

    res.status(200).json({
      success: true,
      data: "Your password has been reset you can now login into your account",
    });
  } catch (error) {
    next(error);
  }
};

// const logoutUser = async (req, res, next) => {
//   try {
//     const { id } = req.user;
//     const logDetailsSql =
//       "insert into log_details(user_id,activity,created_at) values ($1,$2,$3)";
//     await pool.query(logDetailsSql, [id, "logout", new Date()]);

//     res.status(200).json({ success: true });
//   } catch (error) {
//     next(error);
//   }
// };

/**
 * This controller is used to verify the users credential
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */

const verifyToken = async (req, res, next) => {
  try {
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  confirmAccount,
  generateNewConfirmationToken,
  loginUser,
  forgotPassword,
  resetPassword,
  verifyToken,
  // logoutUser,
};
