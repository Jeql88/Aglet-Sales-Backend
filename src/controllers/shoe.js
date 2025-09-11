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
    const [affected] = await Shoe.update(updates, { where: { id } });
    if (affected) {
      console.log(`[UPDATE] Shoe id=${id} updated:`, updates);
      const updatedShoe = await Shoe.findByPk(id);
      res.json(updatedShoe);
    } else {
      res.status(404).json({ error: "Shoe not found" });
    }
  } catch (err) {
    console.error(`[UPDATE] Shoe error:`, err.message);
    res.status(400).json({ error: err.message });
  }
};

// DELETE
exports.deleteShoe = async (req, res) => {
  try {
    const { id } = req.params;
    const affected = await Shoe.destroy({ where: { id } });
    if (affected) {
      console.log(`[DELETE] Shoe id=${id} deleted`);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Shoe not found" });
    }
  } catch (err) {
    console.error(`[DELETE] Shoe error:`, err.message);
    res.status(400).json({ error: err.message });
  }
};
