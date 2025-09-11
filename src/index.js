const express = require("express");
const cors = require("cors");
const { sequelize, syncDB } = require("./models"); 
const shoeRoutes = require('./routes/shoe');

const app = express();
app.use(cors()); // Add this before routes
app.use(express.json());
app.use('/api/shoes', shoeRoutes);

// test route
app.get("/", (req, res) => res.send("Aglet POS Backend is running!"));

// Connect to DB and sync models
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");

    await syncDB(); // this now works!
    console.log("✅ Models synced with the database.");

    app.listen(3000, () => {
      console.log("🚀 Server running at http://localhost:3000");
    });
  } catch (err) {
    console.error("❌ Unable to start server:", err);
  }
};

startServer();
