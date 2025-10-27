require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME || process.env.PGDATABASE || "aglet_sales", // Database name
  process.env.DB_USER || process.env.PGUSER || "postgres", // Username
  process.env.DB_PASSWORD || process.env.PGPASSWORD || "password", // Password

  {
    host: process.env.DB_HOST || process.env.PGHOST || "localhost",
    port: process.env.DB_PORT || process.env.PGPORT || 5432,
    dialect: "postgres",
    logging: false,
    pool: { max: 10, min: 0, idle: 10000 },
  }
);

module.exports = sequelize;
