const express = require('express');
const router = express.Router();
const shoeController = require('../controllers/shoe');

router.post('/', shoeController.createShoe);
router.get('/', shoeController.getShoes);
router.put('/:id', shoeController.updateShoe);
router.delete('/:id', shoeController.deleteShoe);

module.exports = router;
