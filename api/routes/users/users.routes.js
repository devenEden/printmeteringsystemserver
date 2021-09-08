const express = require("express");
const checkHasPermission = require("../../middlewares/permissions/permissions");
const {
  can_view_users,
  can_add_users,
  can_delete_users,
  can_edit_users,
} = require("../../config/config");
const {
  getUsers,
  registerUser,
  updateUser,
  deleteUsers,
} = require("../../controllers/users/users.controller");

const usersRouter = express.Router();

usersRouter.get("/", checkHasPermission(can_view_users).permission, getUsers);
usersRouter.post(
  "/",
  checkHasPermission(can_add_users).permission,
  registerUser
);
usersRouter.put(
  "/:userId",
  checkHasPermission(can_edit_users).permission,
  updateUser
);
usersRouter.delete(
  checkHasPermission(can_delete_users).permission,
  deleteUsers
);

module.exports = usersRouter;
