const sequelize = require("../config/database");
const Shoe = require("./Shoe");
const SalesTransaction = require("./SalesTransaction");
const SalesTransactionDetail = require("./SalesTransactionDetail");

SalesTransaction.hasMany(SalesTransactionDetail, {
  foreignKey: "transactionId",
  as: "details",
});
SalesTransactionDetail.belongsTo(SalesTransaction, {
  foreignKey: "transactionId",
});

Shoe.hasMany(SalesTransactionDetail, { foreignKey: "shoeId" });
SalesTransactionDetail.belongsTo(Shoe, { foreignKey: "shoeId" });

module.exports = { sequelize, Shoe, SalesTransaction, SalesTransactionDetail };
