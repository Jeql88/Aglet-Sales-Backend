const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Shoe = sequelize.define(
  "Shoe",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    brand: { type: DataTypes.STRING, allowNull: false },
    model: { type: DataTypes.STRING, allowNull: false },
    colorway: { type: DataTypes.STRING },
    size: { type: DataTypes.STRING },
    condition: { type: DataTypes.STRING }, // New | Used | Like New
    purchasePrice: { type: DataTypes.DECIMAL(12, 2) },
    price: { type: DataTypes.DECIMAL(12, 2), allowNull: false }, // selling price
    currentStock: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  {
    tableName: "shoes",
    timestamps: true,
  }
);

module.exports = Shoe;
