const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SalesTransactionDetail = sequelize.define(
  "SalesTransactionDetail",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    transactionId: { type: DataTypes.INTEGER, allowNull: false },
    shoeId: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    priceAtSale: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    subtotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  },
  { tableName: "sales_transaction_details", timestamps: false }
);

module.exports = SalesTransactionDetail;
