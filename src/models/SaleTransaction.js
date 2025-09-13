const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SaleTransaction = sequelize.define(
  "SaleTransaction",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    transactionDateTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    totalAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    paymentMethod: {
      type: DataTypes.STRING,
      defaultValue: 'cash'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    tableName: "sales_transactions",
    timestamps: true
  }
);

module.exports = SaleTransaction;
