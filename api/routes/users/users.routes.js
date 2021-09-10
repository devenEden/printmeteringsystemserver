const express = require("express");
const checkHasPermission = require("../../middlewares/permissions/permissions");
const {
  can_view_users,
  can_add_users,
  can_delete_users,
  can_edit_users,
} = require("../../config/permissions/permissions.config");
const protect = require("../../middlewares/auth/protect");
const {
  getUsers,
  registerUser,
  updateUser,
  deleteUsers,
  metaData,
} = require("../../controllers/users/users.controller");

const usersRouter = express.Router();
usersRouter.use(protect);

usersRouter.get("/", checkHasPermission(can_view_users).permission, getUsers);
usersRouter.get(
  "/metaData",
  checkHasPermission(can_add_users).permission,
  metaData
);
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
  "/:userId",
  checkHasPermission(can_delete_users).permission,
  deleteUsers
);

module.exports = usersRouter;
