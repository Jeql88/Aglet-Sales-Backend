const {
  SaleTransaction,
  SalesTransactionDetail,
  Shoe,
  sequelize,
} = require("../models");
const { QueryTypes } = require("sequelize");
const imsService = require("../services/ims");

exports.createSale = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { items } = req.body;

    // Validate stock availability from IMS before creating sale
    for (const item of items) {
      const currentStock = await imsService.queryStock(item.shoeId);
      if (currentStock < item.quantity) {
        await t.rollback();
        return res.status(400).json({
          error: `Insufficient stock for shoe ID ${item.shoeId}. Available: ${currentStock}, Requested: ${item.quantity}`,
        });
      }
    }

    const total = items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    // Create sale transaction with timestamp
    const sale = await SaleTransaction.create(
      {
        totalAmount: total,
        date: new Date(),
        status: "completed",
      },
      { transaction: t }
    );

    // Create detailed entries for each item
    const details = await Promise.all(
      items.map((item) =>
        SalesTransactionDetail.create(
          {
            transactionId: sale.id,
            shoeId: item.shoeId,
            quantity: item.quantity,
            priceAtSale: item.price,
            subtotal: item.quantity * item.price,
          },
          { transaction: t }
        )
      )
    );

    await t.commit();

    // Update IMS stock levels via WebSocket
    for (const item of items) {
      try {
        await imsService.updateStock(item.shoeId, -item.quantity);
      } catch (error) {
        console.error(
          `[IMS] Failed to update stock for shoe ${item.shoeId}:`,
          error.message
        );
        // Log but don't fail the sale - stock was validated before transaction
      }
    }

    console.log(`[SALE] New transaction #${sale.id} created for ₱${total}`);

    res.status(201).json({
      id: sale.id,
      total: total,
      date: sale.date,
      items: details,
    });
  } catch (err) {
    await t.rollback();
    console.error("[SALE] Error:", err);
    res.status(400).json({ error: err.message });
  }
};

exports.getSales = async (req, res) => {
  try {
    const sales = await SaleTransaction.findAll({
      include: [
        {
          model: SalesTransactionDetail,
          as: "details",
        },
      ],
      order: [["transactionDateTime", "DESC"]],
    });

    // Fetch shoe details from IMS for each sale item
    const salesWithShoeData = await Promise.all(
      sales.map(async (sale) => {
        const saleJSON = sale.toJSON();

        // Fetch shoe data from IMS for each detail
        const detailsWithShoes = await Promise.all(
          saleJSON.details.map(async (detail) => {
            try {
              const shoeData = await imsService.getShoeById(detail.shoeId);
              return {
                ...detail,
                Shoe: new Shoe(shoeData).toJSON(),
              };
            } catch (error) {
              console.warn(
                `[IMS] Could not fetch shoe ${detail.shoeId}:`,
                error.message
              );
              return {
                ...detail,
                Shoe: {
                  id: detail.shoeId,
                  brand: "Unknown",
                  model: "Unknown",
                },
              };
            }
          })
        );

        return {
          ...saleJSON,
          details: detailsWithShoes,
        };
      })
    );

    console.log(`[REPORT] Fetched ${salesWithShoeData.length} sales`);
    res.json(salesWithShoeData);
  } catch (err) {
    console.error("[REPORT] Error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    // Get total sales amount
    const totalSales = await SaleTransaction.sum("totalAmount");

    // Get all sale details with shoe IDs
    const saleDetails = await SalesTransactionDetail.findAll({
      attributes: ["shoeId", "quantity", "priceAtSale"],
    });

    // Fetch shoe data from IMS to calculate revenue
    let totalRevenue = 0;
    for (const detail of saleDetails) {
      try {
        const shoeData = await imsService.getShoeById(detail.shoeId);
        const shoe = new Shoe(shoeData);
        const revenue = (detail.priceAtSale - shoe.purchasePrice) * detail.quantity;
        totalRevenue += revenue;
      } catch (error) {
        console.warn(
          `[DASHBOARD] Could not calculate revenue for shoe ${detail.shoeId}`
        );
      }
    }

    // Get top selling product
    const topProductQuery = `
      SELECT 
        "shoeId",
        SUM(quantity) as "totalSold"
      FROM sales_transaction_details
      GROUP BY "shoeId"
      ORDER BY "totalSold" DESC
      LIMIT 1
    `;
    const [topProductResult] = await sequelize.query(topProductQuery);

    let topProduct = null;
    if (topProductResult[0]) {
      try {
        const shoeData = await imsService.getShoeById(topProductResult[0].shoeId);
        const shoe = new Shoe(shoeData);
        topProduct = {
          id: shoe.id,
          brand: shoe.brand,
          model: shoe.model,
          totalSold: topProductResult[0].totalSold,
        };
      } catch (error) {
        console.warn("[DASHBOARD] Could not fetch top product details");
      }
    }

    // Get recent transactions with shoe data
    const recentTransactions = await SaleTransaction.findAll({
      include: [
        {
          model: SalesTransactionDetail,
          as: "details",
        },
      ],
      order: [["transactionDateTime", "DESC"]],
      limit: 5,
    });

    // Enrich with shoe data from IMS
    const recentWithShoes = await Promise.all(
      recentTransactions.map(async (transaction) => {
        const txJSON = transaction.toJSON();
        const detailsWithShoes = await Promise.all(
          txJSON.details.map(async (detail) => {
            try {
              const shoeData = await imsService.getShoeById(detail.shoeId);
              return {
                ...detail,
                Shoe: new Shoe(shoeData).toJSON(),
              };
            } catch (error) {
              return {
                ...detail,
                Shoe: { id: detail.shoeId, brand: "Unknown", model: "Unknown" },
              };
            }
          })
        );
        return {
          ...txJSON,
          details: detailsWithShoes,
        };
      })
    );

    res.json({
      totalSales: totalSales || 0,
      revenue: totalRevenue || 0,
      topProduct: topProduct,
      recentTransactions: recentWithShoes,
    });
  } catch (err) {
    console.error("[DASHBOARD] Error:", err);
    res.status(500).json({ error: err.message });
  }
};
