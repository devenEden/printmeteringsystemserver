const pool = require("../../config/db/connectToDb");

const checkHasPermission = (permission) => {
  return {
    permission: async (req, res, next) => {
      try {
        const { user } = req;
        const getPermission = await pool.query(
          "select role,permission from permissions where role=$1 and permission=$2",
          [user.role, permission]
        );
        getPermission.rowCount > 0 && getPermission.rows[0].permission
          ? (req.permission = true)
          : (req.permission = false);
        next();
      } catch (error) {
        next(error);
      }
    },
  };
};

module.exports = checkHasPermission;
