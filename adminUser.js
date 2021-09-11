const pool = require("./api/config/db/connectToDb");
require("dotenv").config({
  path: ".env",
});

try {
  pool.query(
    "insert into roles(name,status,created_by,created_at) values ($1,$2,$3,$4)",
    ["Admin", 1, 1, new Date()],
    (err) => {
      console.error(err);
    }
  );

  pool.query(
    "insert into permissions(role,permission,created_by,updated_by) values($1,$2,$3,$4)",
    [1, "can_view_roles", 1, 1],
    (err) => {
      if (err) console.error(err);
    }
  );

  pool.query(
    "insert into permissions(role,permission,created_by,updated_by) values($1,$2,$3,$4)",
    [1, "can_edit_roles", 1, 1],
    (err) => {
      if (err) console.error(err);
    }
  );

  pool.query(
    "insert into users(first_name,other_names,email,role,account_confirmed,username,created_by,updated_by,password) values($1,$2,$3,$4,$5,$6,$7,$8,$9)",
    [
      "Admin",
      "Admin",
      "deshdeven1@gmail.com",
      1,
      true,
      "admin",
      1,
      1,
      "$2b$10$cYlonJPbUnuM3Fuu6Mcm/ezPFfwjICVWVQ.PQdJlxHpJLAN9o3bwm",
    ],
    (err) => {
      if (err) console.error(err);
    }
  );
  console.log("Username: admin", "Password: devenfeta19@gmail.com");
  pool.query("");
} catch (error) {
  console.error(error);
}
