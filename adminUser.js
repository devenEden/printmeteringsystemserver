const pool = require("./api/config/db/connectToDb");
const hashPassword = require("./api/utils/auth/hashPasswords");
require("dotenv").config({
  path: ".env",
});

const addAdminUser = async () => {
  try {
    const password = await hashPassword("admin@pms2021");
    const role = await pool.query(
      "insert into roles(name,status,created_by,created_at) values ($1,$2,$3,$4) returning *",
      ["Admin", 1, 1, new Date()]
    );
    console.log("Added Admin Role");
    pool.query(
      "insert into permissions(role,permission,created_by,updated_by) values($1,$2,$3,$4) returning *",
      [role.rows[0].id, "can_view_roles", 1, 1],
      (err) => {
        if (err) console.error(err);
      }
    );

    pool.query(
      "insert into permissions(role,permission,created_by,updated_by) values($1,$2,$3,$4)",
      [role.rows[0].id, "can_edit_roles", 1, 1],
      (err) => {
        if (err) console.error(err);
      }
    );
    console.log("Added Permissions");
    pool.query(
      "insert into users(first_name,other_names,email,role,account_confirmed,username,created_by,updated_by,password) values($1,$2,$3,$4,$5,$6,$7,$8,$9)",
      [
        "Admin",
        "Admin",
        "deshdeven@gmail.com",
        role.rows[0].id,
        true,
        "admin",
        1,
        1,
        password,
      ],
      (err) => {
        if (err) console.error(err);
      }
    );
    console.log("====================================");
    console.log("Username: admin", "Password: admin@pms2021");
    console.log("====================================");
  } catch (error) {
    console.error(error);
  }
};

addAdminUser();
