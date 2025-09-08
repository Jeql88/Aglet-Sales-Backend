const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SalesTransaction = sequelize.define(
  "SalesTransaction",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    transactionDateTime: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    totalAmount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    paymentMethod: { type: DataTypes.STRING },
    notes: { type: DataTypes.STRING },
  },
  { tableName: "sales_transactions", timestamps: true }
);

module.exports = SalesTransaction;
