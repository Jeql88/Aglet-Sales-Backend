const express = require('express');
const router = express.Router();
const salesController = require('../controllers/sales');

router.post('/', salesController.createSale);
router.get('/report', salesController.getSales);
router.get('/dashboard-stats', salesController.getDashboardStats);

module.exports = router;