const sequelize = require("../config/database");
const Shoe = require("./Shoe"); // Virtual model, no table
const SaleTransaction = require("./SaleTransaction");
const SalesTransactionDetail = require("./SaleTransactionDetail");

// Associations - Note: Shoe is now virtual, associations are for query compatibility only
SaleTransaction.hasMany(SalesTransactionDetail, {
  foreignKey: "transactionId",
  as: "details",
});
SalesTransactionDetail.belongsTo(SaleTransaction, {
  foreignKey: "transactionId",
});

// Note: SalesTransactionDetail.belongsTo(Shoe) removed since Shoe is virtual
// Shoe data will be fetched from IMS and merged in controllers

// Sync function - only syncs actual database tables
const syncDB = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("✅ All models were synchronized successfully.");
  } catch (error) {
    console.error("❌ Error syncing models:", error);
  }
};

module.exports = { sequelize, Shoe, SaleTransaction, SalesTransactionDetail, syncDB };
