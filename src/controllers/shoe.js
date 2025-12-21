const { Shoe } = require("../models");
const imsService = require("../services/ims");

// CREATE - Creates in IMS only (POS should not create shoes, but keeping for compatibility)
exports.createShoe = async (req, res) => {
  try {
    res.status(403).json({ 
      error: "Shoe creation should be done in the Inventory Management System. This POS system only reads shoe data." 
    });
  } catch (err) {
    console.error(`[CREATE] Shoe error:`, err.message);
    res.status(400).json({ error: err.message });
  }
};

// READ - Fetches directly from IMS
exports.getShoes = async (req, res) => {
  try {
    const imsShoes = await imsService.getAllShoes();

    // Convert IMS data format to POS format
    const shoes = imsShoes.map(imsShoe => {
      const shoe = new Shoe({
        shoeId: imsShoe.shoeId,
        brand: imsShoe.brand,
        model: imsShoe.model,
        colorWay: imsShoe.colorway || imsShoe.colorWay, // IMS sends ColorWay
        size: imsShoe.size,
        condition: imsShoe.condition,
        purchasePrice: imsShoe.purchasePrice, // IMS field: PurchasePrice
        currentStock: imsShoe.currentStock,
      });
      return shoe.toJSON();
    });

    console.log(`[READ] Fetched ${shoes.length} shoes from IMS`);
    res.json(shoes);
  } catch (err) {
    console.error(`[READ] Shoes error:`, err.message);
    res.status(500).json({ error: "Failed to fetch shoes from IMS. Please ensure IMS is running." });
  }
};

// UPDATE - Not allowed, must be done in IMS
exports.updateShoe = async (req, res) => {
  try {
    res.status(403).json({ 
      error: "Shoe updates should be done in the Inventory Management System. This POS system only reads shoe data." 
    });
  } catch (err) {
    console.error(`[UPDATE] Error:`, err.message);
    res.status(400).json({ error: err.message });
  }
};

// DELETE - Not allowed, must be done in IMS
exports.deleteShoe = async (req, res) => {
  try {
    res.status(403).json({ 
      error: "Shoe deletion should be done in the Inventory Management System. This POS system only reads shoe data." 
    });
  } catch (err) {
    console.error(`[DELETE] Error:`, err.message);
    res.status(500).json({ error: err.message });
  }
};
