const WebSocket = require("ws");

class IMSService {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.reconnectInterval = 5000; // 5 seconds
    this.imsHost = process.env.IMS_HOST || "localhost";
    this.imsPort = process.env.IMS_PORT || "5000"; // Assuming IMS runs on port 5000
  }

  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log("[IMS] Already connected");
      return;
    }

    const protocol = this.imsPort === "7183" ? "wss" : "ws";
    const wsUrl = `${protocol}://${this.imsHost}:${this.imsPort}/ws`;
    console.log(`[IMS] Connecting to ${wsUrl}`);

    this.ws = new WebSocket(wsUrl);

    this.ws.on("open", () => {
      console.log("[IMS] Connected to IMS WebSocket");
      this.isConnected = true;
    });

    this.ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleMessage(message);
      } catch (error) {
        console.error("[IMS] Error parsing message:", error);
      }
    });

    this.ws.on("close", () => {
      console.log("[IMS] Connection closed");
      this.isConnected = false;
      // Auto-reconnect after interval
      setTimeout(() => this.connect(), this.reconnectInterval);
    });

    this.ws.on("error", (error) => {
      console.error("[IMS] WebSocket error:", error);
      this.isConnected = false;
    });
  }

  handleMessage(message) {
    console.log("[IMS] Received message:", message);

    switch (message.type) {
      case "stock_updated":
        console.log(
          `[IMS] Stock updated for shoe ${message.shoeId}: ${message.newStock}`
        );
        // Could emit event or update local cache here
        break;
      case "stock_info":
        console.log(
          `[IMS] Stock info for shoe ${message.shoeId}: ${message.currentStock}`
        );
        break;
      case "error":
        console.error("[IMS] Error from IMS:", message.message);
        break;
      default:
        console.log("[IMS] Unknown message type:", message.type);
    }
  }

  async updateStock(shoeId, quantityChange) {
    if (!this.isConnected) {
      throw new Error("Not connected to IMS");
    }

    const message = {
      type: "stock_update",
      shoeId: shoeId,
      quantityChange: quantityChange,
      authToken: process.env.IMS_AUTH_TOKEN || "aglet_secure_token_2024",
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("IMS update timeout"));
      }, 10000); // 10 second timeout

      // Set up one-time message handler for response
      const messageHandler = (data) => {
        try {
          const response = JSON.parse(data.toString());
          if (response.type === "stock_updated" && response.shoeId === shoeId) {
            clearTimeout(timeout);
            this.ws.removeListener("message", messageHandler);
            resolve(response);
          }
        } catch (error) {
          // Ignore parsing errors for other messages
        }
      };

      this.ws.on("message", messageHandler);

      this.ws.send(JSON.stringify(message), (error) => {
        if (error) {
          clearTimeout(timeout);
          this.ws.removeListener("message", messageHandler);
          reject(error);
        }
      });
    });
  }

  async queryStock(shoeId) {
    if (!this.isConnected) {
      throw new Error("Not connected to IMS");
    }

    const message = {
      type: "stock_query",
      shoeId: shoeId,
      authToken: process.env.IMS_AUTH_TOKEN || "aglet_secure_token_2024",
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("IMS query timeout"));
      }, 10000); // 10 second timeout

      // Set up one-time message handler for response
      const messageHandler = (data) => {
        try {
          const response = JSON.parse(data.toString());
          if (response.type === "stock_info" && response.shoeId === shoeId) {
            clearTimeout(timeout);
            this.ws.removeListener("message", messageHandler);
            resolve(response.currentStock);
          }
        } catch (error) {
          // Ignore parsing errors for other messages
        }
      };

      this.ws.on("message", messageHandler);

      this.ws.send(JSON.stringify(message), (error) => {
        if (error) {
          clearTimeout(timeout);
          this.ws.removeListener("message", messageHandler);
          reject(error);
        }
      });
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

module.exports = new IMSService();
