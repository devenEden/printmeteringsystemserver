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
        new ErrorResponse("You Do not Have Permission to view Users", 400)
      );

    const users = await pool.query(
      "select first_name,other_names,username,email,role,id from users  "
    );
    const getUserRoles = async (users) => {
      return Promise.all(
        users.map(async (user) => {
          const role = await pool.query("select name from roles where id=$1", [
            user.role,
          ]);
          user.roleName = role.rows[0].name;
          return user;
        })
      );
    };
    res.status(200).json({
      success: true,
      message: "Succesfully loaded data",
      data: await getUserRoles(users.rows),
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
  try {
    const password = await hashPassword(username);
    if (!checkProperties(req.body))
      return next(new ErrorResponse("Please fill in all fields", 400));

    if (!validateEmail(email))
      return next(new ErrorResponse("Please enter a valid email", 400));

    /*     const confirmToken = confirmationToken(email); */

    const result = await pool.query(
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
          password: username,
        }
      ),
    };

    sendMail(emailMsgConfig);
    res.status(201).json({
      success: true,
      message: "Successfully Registered User",
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

const deleteUsers = async (req, res, next) => {
  try {
    const { userId } = req.params;
    await pool.query("delete from users where id = $1", [userId]);
    res
      .status(200)
      .json({ success: true, message: "Successfully deleted user" });
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
    const { email, first_name, other_names, role, created_at } = req.body;
    if (!checkProperties(req.body))
      return next(new ErrorResponse("Please fill in all fields", 400));

    if (!validateEmail(email))
      return next(new ErrorResponse("Please enter a valid email", 400));

    const result = await pool.query(
      "update users set email=$1,first_name=$2,other_names=$3,role=$4,updated_by=$5,updated_at=$6 where id=$7 returning * ",
      [email, first_name, other_names, role, user.id, created_at, userId]
    );

    res.status(200).json({
      success: true,
      message: "Successfully edited user data",
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};
const metaData = async (req, res, next) => {
  try {
    const roles = await pool.query("select name,id from roles");
    res.status(200).json({ success: true, data: { roles: roles.rows } });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  getUsers,
  registerUser,
  deleteUsers,
  updateUser,
  metaData,
};
