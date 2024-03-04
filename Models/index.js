const { Pool } = require("pg");
const env = process.env.NODE_ENV || "development";
const config = require("../config/config")[env];
const db = {};

let pool;
if (config.use_env_variable) {
  //   sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  pool = new Pool({
    host: config.host,
    user: config.username,
    password: config.password,
    database: config.database,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
}

module.exports = pool;
