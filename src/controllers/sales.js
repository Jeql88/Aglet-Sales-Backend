const { SaleTransaction, SalesTransactionDetail, Shoe, sequelize } = require('../models');
const { QueryTypes } = require('sequelize');

exports.createSale = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { items } = req.body;
    const total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    // Create sale transaction with timestamp
    const sale = await SaleTransaction.create({
      totalAmount: total,
      date: new Date(),
      status: 'completed'
    }, { transaction: t });

    // Create detailed entries for each item
    const details = await Promise.all(items.map(item => 
      SalesTransactionDetail.create({
        transactionId: sale.id,
        shoeId: item.shoeId,
        quantity: item.quantity,
        priceAtSale: item.price,
        subtotal: item.quantity * item.price
      }, { transaction: t })
    ));

    // Update stock levels
    await Promise.all(items.map(item =>
      Shoe.decrement('currentStock', {
        by: item.quantity,
        where: { id: item.shoeId },
        transaction: t
      })
    ));

    await t.commit();
    console.log(`[SALE] New transaction #${sale.id} created for ₱${total}`);
    
    res.status(201).json({
      id: sale.id,
      total: total,
      date: sale.date,
      items: details
    });
  } catch (err) {
    await t.rollback();
    console.error('[SALE] Error:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.getSales = async (req, res) => {
  try {
    const sales = await SaleTransaction.findAll({
      include: [{
        model: SalesTransactionDetail,
        as: 'details',
        include: [{
          model: Shoe,
          attributes: ['brand', 'model']
        }]
      }],
      order: [['transactionDateTime', 'DESC']] // Changed from 'date' to 'transactionDateTime'
    });

    console.log(`[REPORT] Fetched ${sales.length} sales`);
    res.json(sales);
  } catch (err) {
    console.error('[REPORT] Error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    // Get total sales amount
    const totalSales = await SaleTransaction.sum('totalAmount');

    // Calculate revenue using correct column names
    const revenueQuery = `
      SELECT 
        SUM(std.quantity * std."priceAtSale") - SUM(std.quantity * s."purchasePrice") as revenue
      FROM sales_transaction_details std
      JOIN shoes s ON std."shoeId" = s.id
    `;
    const [revenueResult] = await sequelize.query(revenueQuery);
    const revenue = revenueResult[0]?.revenue || 0;

    // Get top selling product with correct column names
    const topProductQuery = `
      SELECT 
        s.id,
        s.brand,
        s.model,
        SUM(std.quantity) as "totalSold"
      FROM sales_transaction_details std
      JOIN shoes s ON std."shoeId" = s.id
      GROUP BY s.id, s.brand, s.model
      ORDER BY "totalSold" DESC
      LIMIT 1
    `;
    const [topProduct] = await sequelize.query(topProductQuery);

    // Get recent transactions
    const recentTransactions = await SaleTransaction.findAll({
      include: [{
        model: SalesTransactionDetail,
        as: 'details',
        include: [Shoe]
      }],
      order: [['transactionDateTime', 'DESC']],
      limit: 5
    });

    res.json({
      totalSales: totalSales || 0,
      revenue,
      topProduct: topProduct[0] || null,
      recentTransactions
    });

  } catch (err) {
    console.error('[DASHBOARD] Error:', err);
    res.status(500).json({ error: err.message });
  }
};