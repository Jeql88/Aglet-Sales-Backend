const sequelize = require("../config/database");
const Shoe = require("./Shoe");
const SaleTransaction = require("./SaleTransaction");
const SalesTransactionDetail = require("./SaleTransactionDetail");

// Associations
SaleTransaction.hasMany(SalesTransactionDetail, {
  foreignKey: "transactionId",
  as: "details", // Add this alias
});
SalesTransactionDetail.belongsTo(SaleTransaction, {
  foreignKey: "transactionId",
});

SalesTransactionDetail.belongsTo(Shoe, {
  foreignKey: "shoeId",
});

// 🔹 Sync function
const syncDB = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("✅ All models were synchronized successfully.");
  } catch (error) {
    console.error("❌ Error syncing models:", error);
  }
};

module.exports = { sequelize, Shoe, SaleTransaction, SalesTransactionDetail, syncDB };
