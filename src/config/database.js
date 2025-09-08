require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.PGDATABASE, // Database name
  process.env.PGUSER, // Username
  process.env.PGPASSWORD, // Password
  {
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    dialect: "postgres",
    logging: false,
    pool: { max: 10, min: 0, idle: 10000 },
  }
);

module.exports = sequelize;
