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
    // First, drop any existing foreign key constraint to shoes table
    try {
      await sequelize.query(`
        ALTER TABLE "sales_transaction_details" 
        DROP CONSTRAINT IF EXISTS "sales_transaction_details_shoeId_fkey";
      `);
      console.log("✅ Dropped foreign key constraint to shoes table (if existed)");
    } catch (fkError) {
      // Ignore error if constraint doesn't exist
    }

    // Drop shoes table if it exists
    try {
      await sequelize.query(`DROP TABLE IF EXISTS "shoes" CASCADE;`);
      console.log("✅ Dropped shoes table (if existed)");
    } catch (dropError) {
      // Ignore error if table doesn't exist
    }

    await sequelize.sync({ alter: true });
    console.log("✅ All models were synchronized successfully.");
  } catch (error) {
    console.error("❌ Error syncing models:", error);
  }
};

module.exports = { sequelize, Shoe, SaleTransaction, SalesTransactionDetail, syncDB };
