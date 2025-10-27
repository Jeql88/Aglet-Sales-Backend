const { Shoe } = require("../models");
const imsService = require("../services/ims");

// CREATE - Now syncs with IMS
exports.createShoe = async (req, res) => {
  try {
    const {
      brand,
      model,
      colorway,
      size,
      condition,
      purchasePrice,
      price,
      currentStock,
    } = req.body;

    // First create in local database for POS operations
    const shoe = await Shoe.create({
      brand,
      model,
      colorway,
      size,
      condition,
      purchasePrice,
      price,
      currentStock,
    });
    console.log(`[CREATE] Shoe added locally:`, shoe.toJSON());

    // Note: In production, shoe creation should happen in IMS first
    // This is a simplified implementation where POS creates locally
    // but ideally IMS should be the source of truth

    res.status(201).json(shoe);
  } catch (err) {
    console.error(`[CREATE] Shoe error:`, err.message);
    res.status(400).json({ error: err.message });
  }
};

// READ - Fetches from IMS and syncs to local database
exports.getShoes = async (req, res) => {
  try {
    // First try to sync shoes from IMS
    await syncShoesFromIMS();

    // Get local shoes with IMS inventory data
    const localShoes = await Shoe.findAll();

    // For each shoe, query current stock from IMS
    const shoesWithInventory = await Promise.all(
      localShoes.map(async (shoe) => {
        try {
          const currentStock = await imsService.queryStock(shoe.id);
          return {
            ...shoe.toJSON(),
            currentStock: currentStock, // Override with IMS stock
          };
        } catch (error) {
          console.warn(
            `[IMS] Could not get stock for shoe ${shoe.id}:`,
            error.message
          );
          // Fall back to local stock if IMS is unavailable
          return shoe.toJSON();
        }
      })
    );

    console.log(
      `[READ] Shoes fetched with IMS inventory: count=${shoesWithInventory.length}`
    );
    res.json(shoesWithInventory);
  } catch (err) {
    console.error(`[READ] Shoes error:`, err.message);
    res.status(500).json({ error: err.message });
  }
};

// Sync shoes from IMS to local database
async function syncShoesFromIMS() {
  try {
    // Import axios for HTTP requests to IMS
    const axios = require("axios");

    const imsUrl =
      process.env.IMS_PORT === "7183"
        ? `https://localhost:${process.env.IMS_PORT}`
        : `http://localhost:${process.env.IMS_PORT || "5172"}`;

    const response = await axios.get(
      `${imsUrl}/api/Shoes?pageNumber=1&pageSize=1000`,
      {
        timeout: 5000,
        // Skip SSL verification for development
        httpsAgent:
          process.env.IMS_PORT === "7183"
            ? new (require("https").Agent)({
                rejectUnauthorized: false,
              })
            : undefined,
      }
    );

    console.log("[SYNC] IMS Response:", JSON.stringify(response.data, null, 2));

    // Handle different response formats from IMS
    let imsShoes = [];
    if (response.data.data && Array.isArray(response.data.data)) {
      imsShoes = response.data.data; // lowercase 'data'
    } else if (response.data.Data && Array.isArray(response.data.Data)) {
      imsShoes = response.data.Data; // uppercase 'Data'
    } else if (Array.isArray(response.data)) {
      imsShoes = response.data;
    } else {
      console.warn(
        "[SYNC] Unexpected IMS response format:",
        typeof response.data
      );
      return;
    }

    // Sync each IMS shoe to local database
    for (const imsShoe of imsShoes) {
      await Shoe.upsert(
        {
          id: imsShoe.shoeId, // lowercase property names
          brand: imsShoe.brand,
          model: imsShoe.model,
          colorway: imsShoe.colorway,
          size: imsShoe.size,
          condition: imsShoe.condition,
          purchasePrice: imsShoe.purchasePrice,
          price: imsShoe.purchasePrice * 1.5, // Default markup, can be adjusted
          currentStock: imsShoe.currentStock,
        },
        {
          // Update existing records
          fields: [
            "brand",
            "model",
            "colorway",
            "size",
            "condition",
            "purchasePrice",
            "price",
            "currentStock",
          ],
        }
      );
    }

    console.log(`[SYNC] Synced ${imsShoes.length} shoes from IMS`);
  } catch (error) {
    console.error("[SYNC] Failed to sync shoes from IMS:", error.message);
    // Don't throw error - allow fallback to local data
  }
}

// UPDATE - Updates local POS data, stock changes go through IMS
exports.updateShoe = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const shoe = await Shoe.findByPk(id);

    if (!shoe) {
      return res.status(404).json({ error: "Shoe not found" });
    }

    // If stock is being updated, send to IMS instead of local DB
    if (updates.currentStock !== undefined) {
      const stockChange = updates.currentStock - shoe.currentStock;
      if (stockChange !== 0) {
        try {
          await imsService.updateStock(id, stockChange);
          // Update local stock to match IMS
          updates.currentStock = await imsService.queryStock(id);
        } catch (error) {
          console.error(`[IMS] Failed to update stock:`, error.message);
          return res
            .status(500)
            .json({ error: "Failed to update inventory in IMS" });
        }
      }
      // Remove currentStock from local updates since it's managed by IMS
      delete updates.currentStock;
    }

    // Update other fields locally (pricing, etc.)
    if (Object.keys(updates).length > 0) {
      await shoe.update(updates);
    }

    // Return shoe with current IMS stock
    const currentStock = await imsService
      .queryStock(id)
      .catch(() => shoe.currentStock);
    const updatedShoe = {
      ...shoe.toJSON(),
      currentStock: currentStock,
    };

    console.log(`[UPDATE] Shoe ${id} updated:`, updates);
    res.json(updatedShoe);
  } catch (err) {
    console.error(`[UPDATE] Error:`, err.message);
    res.status(400).json({ error: err.message });
  }
};

// DELETE - Note: Deletion should be handled carefully, ideally only in IMS
exports.deleteShoe = async (req, res) => {
  try {
    const { id } = req.params;
    const shoe = await Shoe.findByPk(id);

    if (!shoe) {
      return res.status(404).json({ error: "Shoe not found" });
    }

    // Check current stock in IMS before deletion
    try {
      const currentStock = await imsService.queryStock(id);
      if (currentStock > 0) {
        return res.status(400).json({
          error:
            "Cannot delete shoe with existing inventory. Please clear stock first.",
        });
      }
    } catch (error) {
      console.warn(
        `[IMS] Could not check stock before deletion:`,
        error.message
      );
      // Continue with deletion if IMS is unavailable
    }

    await shoe.destroy();
    console.log(`[DELETE] Shoe ${id} deleted`);
    res.json({ message: "Shoe deleted successfully" });
  } catch (err) {
    console.error(`[DELETE] Error:`, err.message);
    res.status(400).json({ error: err.message });
  }
};
