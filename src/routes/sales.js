const express = require('express');
const router = express.Router();
const salesController = require('../controllers/sales');

/**
 * @swagger
 * /api/sales:
 *   post:
 *     summary: Create a new sale transaction
 *     tags: [Sales]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSaleRequest'
 *           example:
 *             items:
 *               - shoeId: 1
 *                 quantity: 2
 *                 price: 250.00
 *               - shoeId: 3
 *                 quantity: 1
 *                 price: 180.00
 *     responses:
 *       201:
 *         description: Sale transaction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 total:
 *                   type: number
 *                   example: 680.00
 *                 date:
 *                   type: string
 *                   format: date-time
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SaleTransactionDetail'
 *       400:
 *         description: Bad request or insufficient stock
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', salesController.createSale);

/**
 * @swagger
 * /api/sales/report:
 *   get:
 *     summary: Get all sales transactions with details
 *     tags: [Sales]
 *     responses:
 *       200:
 *         description: List of all sales transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SaleTransaction'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/report', salesController.getSales);

/**
 * @swagger
 * /api/sales/dashboard-stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Sales]
 *     responses:
 *       200:
 *         description: Dashboard statistics including total sales, revenue, top product, and recent transactions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardStats'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/dashboard-stats', salesController.getDashboardStats);

module.exports = router;