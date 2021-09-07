const pool = require("../../config/db/connectToDb");
const { trimObject } = require("../../helpers/trim");
const ErrorResponse = require("../../utils/errors/errorResponse");
const { status } = require("../../config/config");
const sanitize = require("../../helpers/sanitizer");

const addRoles = async (req, res, next) => {
  try {
    sanitize(req.body);
    const { role, created_at } = req.body;
    const { permission, user } = req;
    trimObject(req.body);
    if (!role) return next(new ErrorResponse("Please fill in all fields", 400));

    if (!permission)
      return next(
        new ErrorResponse("You do not have permission to add roles", 400)
      );

    const addRole = await pool.query(
      "insert into roles (name,status,created_by,created_at) values ($1,$2,$3,$4) returning * ",
      [role, status.pending, user.id, created_at]
    );

    for (const key in req.body) {
      if (
        Object.hasOwnProperty.call(req.body, key) &&
        req.body[key].startsWith("can_")
      ) {
        await pool.query(
          "insert into permissions(role,permission,created_by,created_at,updated_by) values ($1,$2,$3,$4,$5)",
          [addRole.rows[0].id, req.body[key], user.id, created_at, "4"]
        );
      }
    }

    res.status(201).json({
      success: true,
      message: "Successfully added role",
      data: addRole.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

const editRoles = async (req, res, next) => {
  try {
    const { roleId } = req.params;
    const { permission, user } = req;
    const { role, updated_at } = req.body;
    trimObject(req.body);
    if (!role) return next(new ErrorResponse("Please fill in all fields", 400));
    if (!permission)
      return next(
        new ErrorResponse("You do not have permission to edit roles", 400)
      );
    const editRole = await pool.query(
      "update roles set name=$1, updated_by=$2,updated_at=$3 where id=$4 returning *",
      [role, user.id, updated_at, roleId]
    );
    const reqBodyArray = Object.values(req.body);
    const getAllPermissions = await pool.query(
      "select permission from permissions where role=$1",
      [editRole.rows[0].id]
    );
    //delete if not in req.body object
    getAllPermissions.rows.forEach(async (permission) => {
      if (!reqBodyArray.includes(permission.permission)) {
        console.log(permission.permission);
        await pool.query(
          "delete from  permissions where permission=$1 and role=$2",
          [permission.permission, editRole.rows[0].id]
        );
      } else console.log("yes");
    });
    //add permission if it  does not exist in req.body
    for (const key in req.body) {
      if (
        Object.hasOwnProperty.call(req.body, key) &&
        req.body[key].startsWith("can_")
      ) {
        const getPermission = await pool.query(
          "select permission from permissions where role=$1 and permission=$2",
          [editRole.rows[0].id, req.body[key]]
        );
        if (getPermission.rowCount < 1) {
          await pool.query(
            "insert into permissions(role,permission,created_by,created_at,updated_by) values ($1,$2,$3,$4,$5)",
            [editRole.rows[0].id, req.body[key], user.id, updated_at, user.id]
          );
        }
      }
    }
    res.status(200).json({
      success: true,
      message: "Successully updated role",
      data: editRole.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

const getRoles = async (req, res, next) => {
  try {
    const rolesRecords = await pool.query("select * from roles ");
    const { permission } = req;
    if (!permission)
      return next(
        new ErrorResponse("You do not have permission to view roles", 400)
      );
    const getPermissions = (roles) => {
      return Promise.all(
        roles.map(async (role) => {
          const permissions = await pool.query(
            "select * from permissions where role=$1",
            [role.id]
          );
          return { ...role, permissions: permissions.rows };
        })
      );
    };
    const roles = await getPermissions(rolesRecords.rows);
    res.status(200).json({
      success: true,
      message: "Successfully loaded all roles",
      data: roles,
    });
  } catch (error) {
    next(error);
  }
};

const deleteRoles = async (req, res, next) => {
  try {
    const { roleId } = req.params;
    await pool.query("delete from permissions where role=$1", [roleId]);
    await pool.query("delete from roles where id=$2", [roleId]);
    res
      .status(200)
      .json({ success: true, message: "Successfully delete role" });
  } catch (error) {
    next(error);
  }
};

const approveRole = async (req, res, next) => {
  try {
    const { roleId } = req.params;
    const { user, permission } = req;
    const { approvedAt } = req.body;
    if (!permission)
      return next(
        new ErrorResponse("You do not have permission to approve roles", 400)
      );
    const checkRoleInfo = await pool.query(
      "select status from roles where id=$1",
      [roleId]
    );
    if (checkRoleInfo.rows[0].status === status.approved)
      return next(
        new ErrorResponse(
          "The role you selected has already been approved",
          400
        )
      );
    await pool.query(
      "update roles set status=$1, approved_by=$2, approved_at=$3 where id = $1",
      [status.approved, user.id, approvedAt, roleId]
    );
    res
      .status(200)
      .json({ success: true, message: "Successfully approved roles" });
  } catch (error) {
    next(error);
  }
};

module.exports = { addRoles, editRoles, getRoles, deleteRoles, approveRole };
