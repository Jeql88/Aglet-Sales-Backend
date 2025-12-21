const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// Virtual Shoe model - data fetched from IMS, not stored locally
// This model is used for type consistency but no database table is created

class Shoe {
  constructor(data) {
    this.id = data.shoeId || data.id;
    this.brand = data.brand;
    this.model = data.model;
    this.colorway = data.colorway || data.colorWay; // IMS uses ColorWay
    this.size = data.size;
    this.condition = data.condition;
    this.purchasePrice = data.purchasePrice; // IMS field: PurchasePrice
    this.price = data.price || data.purchasePrice * 1.5; // Default markup if price not provided
    this.currentStock = data.currentStock;
  }

  toJSON() {
    return {
      id: this.id,
      brand: this.brand,
      model: this.model,
      colorway: this.colorway,
      size: this.size,
      condition: this.condition,
      purchasePrice: this.purchasePrice,
      price: this.price,
      currentStock: this.currentStock,
    };
  }
}

module.exports = Shoe;
