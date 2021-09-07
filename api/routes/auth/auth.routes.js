const express = require("express");
const {
  verifyToken,
  registerUser,
  generateNewConfirmationToken,
  loginUser,
  forgotPassword,
  confirmAccount,
  resetPassword,
} = require("../../controllers/auth/auth.controller");
const protect = require("../../middlewares/auth/protect");

const authRouter = express.Router();

authRouter.get("/verifyToken", verifyToken);
//authRouter.get("/logout",  logoutUser);

authRouter.post("/register", registerUser);
authRouter.post(
  "/generateNewConfirmToken",
  protect,
  generateNewConfirmationToken
);
authRouter.post("/login", loginUser);
authRouter.post("/forgotPassword", forgotPassword);

authRouter.patch("/confirmAccount/:confirmationToken", confirmAccount);
authRouter.patch("/resetPassword/:resetToken", resetPassword);

module.exports = authRouter;
