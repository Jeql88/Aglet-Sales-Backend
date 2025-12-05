const express = require("express");
const cors = require("cors");
const WebSocket = require("ws");
const { sequelize, syncDB } = require("./models");
const shoeRoutes = require("./routes/shoe");
const saleRoutes = require("./routes/sales");
const { specs, swaggerUi } = require("./config/swagger");
const imsService = require("./services/ims");

const app = express();
app.use(cors());
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

    const server = app.listen(3000, () => {
      console.log("🚀 Server running at http://localhost:3000");
      console.log("📚 Swagger docs at http://localhost:3000/api-docs");
    });

    // WebSocket server for POS clients
    const wss = new WebSocket.Server({ server, path: "/ws" });

    wss.on("connection", (ws) => {
      console.log("[WS] POS client connected");
      imsService.addPOSClient(ws);

      ws.on("close", () => {
        console.log("[WS] POS client disconnected");
        imsService.removePOSClient(ws);
      });

      ws.on("error", (error) => {
        console.error("[WS] Client error:", error);
      });
    });

    console.log("🔌 WebSocket server running at ws://localhost:3000/ws");
  } catch (err) {
    console.error("❌ Unable to start server:", err);
  }
};

startServer();
