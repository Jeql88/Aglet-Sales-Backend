const { Shoe } = require("../models");

exports.list = async (req, res) => {
  try {
    const rows = await Shoe.findAll();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const s = await Shoe.create(req.body);
    res.status(201).json(s);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// to add more controller methods (update, delete, getById)
// to also add more controllers transactions.js, with link to ims service
