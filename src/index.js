const express = require("express");
const cors = require("cors");
const { sequelize, syncDB } = require("./models");
const shoeRoutes = require("./routes/shoe");
const saleRoutes = require("./routes/sales");
const { specs, swaggerUi } = require("./config/swagger"); // <-- Add this line
const imsService = require("./services/ims");

const app = express();
app.use(cors()); // Add this before routes
app.use(express.json());

// Add Swagger UI route
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: true,
    customSiteTitle: "Aglet POS API Docs",
  })
);

app.use("/api/shoes", shoeRoutes);
app.use("/api/sales", saleRoutes);

// test route
app.get("/", (req, res) => res.send("Aglet POS Backend is running!"));

// Connect to DB and sync models
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");

    await syncDB(); // this now works!
    console.log("✅ Models synced with the database.");

    // Connect to IMS WebSocket service
    imsService.connect();

    app.listen(3000, () => {
      console.log("🚀 Server running at http://localhost:3000");
      console.log("📚 Swagger docs at http://localhost:3000/api-docs");
    });
  } catch (err) {
    console.error("❌ Unable to start server:", err);
  }
};

startServer();
