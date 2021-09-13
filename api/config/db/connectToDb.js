const { Pool } = require("pg");
require("dotenv").config({
  path: ".env",
});
/**
 * @description config for db connection
 */
const dbconfig = {
  user: process.env.DB_USERNAME,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
};

// const localDbConfig = {
//   user: process.env.LOCAL_DB_USERNAME,
//   host: process.env.LOCAL_DB_HOST,
//   database: process.env.LOCAL_DB_DATABASE,
//   password: process.env.LOCAL_DB_PASSWORD,
//   port: process.env.LOCAL_DB_PORT,
// };
/**
 * connect to postgres database
 * @instance of Pool module from pg dependence
 */
const pool = new Pool(dbconfig);

module.exports = pool;
