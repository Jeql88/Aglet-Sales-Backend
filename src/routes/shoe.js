const express = require('express');
const router = express.Router();
const shoeController = require('../controllers/shoe');

/**
 * @swagger
 * /api/shoes:
 *   post:
 *     summary: Create a new shoe
 *     tags: [Shoes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - brand
 *               - model
 *               - price
 *             properties:
 *               brand:
 *                 type: string
 *                 example: "Nike"
 *               model:
 *                 type: string
 *                 example: "Air Jordan 1"
 *               colorway:
 *                 type: string
 *                 example: "Bred"
 *               size:
 *                 type: string
 *                 example: "10.5"
 *               condition:
 *                 type: string
 *                 enum: [New, Used, Like New]
 *                 example: "New"
 *               purchasePrice:
 *                 type: number
 *                 example: 150.00
 *               price:
 *                 type: number
 *                 example: 250.00
 *               currentStock:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       201:
 *         description: Shoe created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Shoe'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', shoeController.createShoe);

/**
 * @swagger
 * /api/shoes:
 *   get:
 *     summary: Get all shoes
 *     tags: [Shoes]
 *     responses:
 *       200:
 *         description: List of all shoes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Shoe'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', shoeController.getShoes);

/**
 * @swagger
 * /api/shoes/{id}:
 *   put:
 *     summary: Update a shoe by ID
 *     tags: [Shoes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Shoe ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               brand:
 *                 type: string
 *               model:
 *                 type: string
 *               colorway:
 *                 type: string
 *               size:
 *                 type: string
 *               condition:
 *                 type: string
 *               purchasePrice:
 *                 type: number
 *               price:
 *                 type: number
 *               currentStock:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Shoe updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Shoe'
 *       404:
 *         description: Shoe not found
 *       400:
 *         description: Bad request
 */
router.put('/:id', shoeController.updateShoe);

/**
 * @swagger
 * /api/shoes/{id}:
 *   delete:
 *     summary: Delete a shoe by ID
 *     tags: [Shoes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Shoe ID
 *     responses:
 *       200:
 *         description: Shoe deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Shoe deleted successfully"
 *       404:
 *         description: Shoe not found
 *       400:
 *         description: Bad request
 */
router.delete('/:id', shoeController.deleteShoe);

module.exports = router;
