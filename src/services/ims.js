const WebSocket = require("ws");

class IMSService {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.reconnectInterval = 5000;
    this.imsHost = process.env.IMS_HOST || "localhost";
    this.imsPort = process.env.IMS_PORT || "5172";
    this.posClients = new Set();
    this.pendingRequests = new Map();
  }

  addPOSClient(client) {
    this.posClients.add(client);
    console.log(`[IMS] POS client connected. Total: ${this.posClients.size}`);
  }

  removePOSClient(client) {
    this.posClients.delete(client);
    console.log(`[IMS] POS client disconnected. Total: ${this.posClients.size}`);
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
      this.rejectPendingRequests();
      setTimeout(() => this.connect(), this.reconnectInterval);
    });

    this.ws.on("error", (error) => {
      console.error("[IMS] WebSocket error:", error);
      this.isConnected = false;
    });
  }

  rejectPendingRequests() {
    this.pendingRequests.forEach((request) => {
      clearTimeout(request.timeout);
      request.reject(new Error("Connection closed"));
    });
    this.pendingRequests.clear();
  }

  handleMessage(message) {
    console.log("[IMS] Received message:", message);

    const requestKey = `${message.type}_${message.shoeId}`;
    const pending = this.pendingRequests.get(requestKey);

    if (pending) {
      clearTimeout(pending.timeout);
      this.pendingRequests.delete(requestKey);
      pending.resolve(message);
    }

    switch (message.type) {
      case "stock_updated":
        console.log(
          `[IMS] Stock updated for shoe ${message.shoeId}: ${message.newStock}`
        );
        break;
      case "stock_changed":
        console.log(
          `[IMS] Stock changed broadcast for shoe ${message.shoeId}: ${message.currentStock} (${message.change > 0 ? "+" : ""}${message.change})`
        );
        this.broadcastToClients(message);
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

  broadcastToClients(message) {
    const deadClients = [];
    this.posClients.forEach((client) => {
      try {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
        } else {
          deadClients.push(client);
        }
      } catch (error) {
        console.error("[IMS] Error broadcasting to client:", error);
        deadClients.push(client);
      }
    });

    deadClients.forEach((client) => this.posClients.delete(client));
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
      const requestKey = `stock_updated_${shoeId}`;

      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestKey);
        reject(new Error("IMS update timeout"));
      }, 10000);

      this.pendingRequests.set(requestKey, { resolve, reject, timeout });

      this.ws.send(JSON.stringify(message), (error) => {
        if (error) {
          clearTimeout(timeout);
          this.pendingRequests.delete(requestKey);
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
      const requestKey = `stock_info_${shoeId}`;

      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestKey);
        reject(new Error("IMS query timeout"));
      }, 10000);

      this.pendingRequests.set(requestKey, { resolve, reject, timeout });

      this.ws.send(JSON.stringify(message), (error) => {
        if (error) {
          clearTimeout(timeout);
          this.pendingRequests.delete(requestKey);
          reject(error);
        }
      });
    }).then((response) => response.currentStock);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

module.exports = new IMSService();
