const pool = require("../../config/db/connectToDb");
const validateEmail = require("../../helpers/emailValidator");
const sanitize = require("../../helpers/sanitizer");
const { trimObject } = require("../../helpers/trim");
const checkProperties = require("../../helpers/validateObject");
const hashPassword = require("../../utils/auth/hashPasswords");
const emailConfirmationHtml = require("../../utils/email/html/emailConfirmation.html");
const sendMail = require("../../utils/email/sendEmail.util");
const ErrorResponse = require("../../utils/errors/errorResponse");

const getUsers = async (req, res, next) => {
  try {
    const { permission } = req;
    if (!permission)
      return next(
        new ErrorResponse("You Do not Have Permission to view Users")
      );

    const users = await pool.query(
      "select first_name, other_names,username,email from users "
    );
    res.status(200).json({
      success: true,
      message: "Succesfully loaded data",
      data: users.rows,
    });
  } catch (error) {
    next(error);
  }
};

const registerUser = async (req, res, next) => {
  sanitize(req.body);
  trimObject(req.body);
  const { user } = req;
  const { email, first_name, other_names, role, created_at } = req.body;
  const emailVerified = false;
  const username =
    `${first_name}${other_names}`.toLowerCase() +
    Math.floor(Math.random() * 10000);
  const password = await hashPassword(username);
  try {
    if (!checkProperties(req.body))
      return next(new ErrorResponse("Please fill in all fields", 400));

    if (!validateEmail(email))
      return next(new ErrorResponse("Please enter a valid email", 400));

    /*     const confirmToken = confirmationToken(email); */

    await pool.query(
      "insert into users(username,email,first_name,other_names,password,role,account_confirmed,created_by,created_at) values ($1,$2,$3,$4,$5,$6,$7,$8,$9) returning * ",
      [
        email,
        email,
        first_name,
        other_names,
        password,
        role,
        emailVerified,
        user.id,
        created_at,
      ]
    );
    const emailMsgConfig = {
      to: email,
      subject: "Printer Tracker Account Confirmation",
      text: "Confirm your account",
      html: emailConfirmationHtml(
        // eslint-disable-next-line no-undef
        `${process.env.CLIENT_URL}/login/`,
        {
          username: email,
          password,
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

const deleteUsers = async (req, res, next) => {
  try {
    const { userId } = req;
    await pool.query("delete from users where id = $1", [userId]);
    res
      .status(200)
      .json({ success: true, message: "Successfully deleted users" });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    sanitize(req.body);
    trimObject(req.body);
    const { user } = req;
    const { email, first_name, other_names, role, created_at, username } =
      req.body;
    if (!checkProperties(req.body))
      return next(new ErrorResponse("Please fill in all fields", 400));

    if (!validateEmail(email))
      return next(new ErrorResponse("Please enter a valid email", 400));

    await pool.query(
      "update users set username=$1,email=$2,first_name=$3,other_names=$4,role=$5,updated_by=$6,updated_at=$7 where id=$8 returning * ",
      [
        username,
        email,
        first_name,
        other_names,
        role,
        user.id,
        created_at,
        userId,
      ]
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  registerUser,
  deleteUsers,
  updateUser,
};
