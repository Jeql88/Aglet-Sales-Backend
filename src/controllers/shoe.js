const { Shoe } = require("../models");

// CREATE
exports.createShoe = async (req, res) => {
  try {
    const { brand, model, colorway, size, condition, purchasePrice, price, currentStock } = req.body;
    const shoe = await Shoe.create({ brand, model, colorway, size, condition, purchasePrice, price, currentStock });
    console.log(`[CREATE] Shoe added:`, shoe.toJSON());
    res.status(201).json(shoe);
  } catch (err) {
    console.error(`[CREATE] Shoe error:`, err.message);
    res.status(400).json({ error: err.message });
  }
};

// READ
exports.getShoes = async (req, res) => {
  try {
    const shoes = await Shoe.findAll();
    console.log(`[READ] Shoes fetched: count=${shoes.length}`);
    res.json(shoes);
  } catch (err) {
    console.error(`[READ] Shoes error:`, err.message);
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
exports.updateShoe = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const shoe = await Shoe.findByPk(id);
    
    if (!shoe) {
      return res.status(404).json({ error: "Shoe not found" });
    }

    await shoe.update(updates);
    console.log(`[UPDATE] Shoe ${id} updated:`, updates);
    res.json(shoe);
  } catch (err) {
    console.error(`[UPDATE] Error:`, err.message);
    res.status(400).json({ error: err.message });
  }
};

// DELETE
exports.deleteShoe = async (req, res) => {
  try {
    const { id } = req.params;
    const shoe = await Shoe.findByPk(id);
    
    if (!shoe) {
      return res.status(404).json({ error: "Shoe not found" });
    }

    await shoe.destroy();
    console.log(`[DELETE] Shoe ${id} deleted`);
    res.json({ message: "Shoe deleted successfully" });
  } catch (err) {
    console.error(`[DELETE] Error:`, err.message);
    res.status(400).json({ error: err.message });
  }
};
