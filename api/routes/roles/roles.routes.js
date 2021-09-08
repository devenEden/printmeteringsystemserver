const express = require("express");
const {
  can_add_roles,
  can_view_roles,
  can_edit_roles,
  can_approve_roles,
  can_delete_roles,
} = require("../../config/permissions/permissions.config");
const {
  addRoles,
  editRoles,
  getRoles,
  approveRole,
  deleteRoles,
} = require("../../controllers/roles/roles.controller");
const protect = require("../../middlewares/auth/protect");
const checkHasPermission = require("../../middlewares/permissions/permissions");

const rolesRouter = express.Router();

rolesRouter.use(protect);
rolesRouter.get("/", checkHasPermission(can_view_roles).permission, getRoles);
rolesRouter.post("/", checkHasPermission(can_add_roles).permission, addRoles);
rolesRouter.put(
  "/:roleId",
  checkHasPermission(can_edit_roles).permission,
  editRoles
);
rolesRouter.patch(
  "/approve/:roleId",
  checkHasPermission(can_approve_roles).permission,
  approveRole
);
rolesRouter.delete(
  "/:roleId",
  checkHasPermission(can_delete_roles).permission,
  deleteRoles
);

module.exports = rolesRouter;
