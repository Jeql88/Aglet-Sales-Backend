# Aglet Sales Backend

Backend API for the Aglet shoe resale Point of Sale (POS) system. Built with Express.js, Sequelize ORM, and PostgreSQL, featuring real-time WebSocket integration with an external Inventory Management System (IMS).

## Overview

This backend provides RESTful APIs for managing shoe inventory and sales transactions for a shoe resale business. It integrates with a React frontend and communicates with an external IMS service for real-time inventory synchronization.

### Key Features

- **RESTful API**: Comprehensive endpoints for shoes and sales management
- **Database**: PostgreSQL with Sequelize ORM for robust data management
- **Real-time Sync**: WebSocket integration with external IMS for inventory updates
- **API Documentation**: Interactive Swagger UI for API exploration
- **Auto-reconnection**: Built-in reconnection logic for IMS service
- **Flexible Configuration**: Supports multiple environment variable formats

## Tech Stack

- **Runtime**: Node.js (>=18.0.0)
- **Framework**: Express.js 5.x
- **Database**: PostgreSQL with Sequelize ORM
- **Documentation**: Swagger/OpenAPI 3.0
- **WebSocket**: ws library for IMS integration
- **Development**: Nodemon for hot reload

## Prerequisites

Before setting up the backend, ensure you have:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
- **npm** or **yarn** package manager
- **Git** for version control

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Jeql88/Aglet-Sales-Backend.git
   cd Aglet-Sales-Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up PostgreSQL database**
   
   Create a new database for the application:
   ```sql
   CREATE DATABASE aglet_sales;
   ```

4. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration (Standard format)
   DB_NAME=aglet_sales
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=5432

   # OR use PostgreSQL format
   # PGDATABASE=aglet_sales
   # PGUSER=postgres
   # PGPASSWORD=your_password
   # PGHOST=localhost
   # PGPORT=5432

   # IMS Service Configuration (Optional)
   IMS_HOST=localhost
   IMS_PORT=5000

   # Server Configuration
   PORT=3000
   ```

   **Note**: The application supports both standard (`DB_*`) and PostgreSQL (`PG*`) environment variable formats for flexible deployment.

## Running the Application

### Development Mode (with hot reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000` by default.

## API Documentation

Once the server is running, access the interactive Swagger UI documentation at:

```
http://localhost:3000/api-docs
```

This provides a complete overview of all available endpoints, request/response schemas, and allows you to test the API directly from your browser.

### Main API Endpoints

#### Shoes
- `GET /api/shoes` - Get all shoes
- `GET /api/shoes/:id` - Get shoe by ID
- `POST /api/shoes` - Create a new shoe
- `PUT /api/shoes/:id` - Update shoe details
- `DELETE /api/shoes/:id` - Delete a shoe

#### Sales
- `GET /api/sales` - Get all sale transactions
- `GET /api/sales/:id` - Get sale transaction by ID
- `POST /api/sales` - Create a new sale transaction
- `PUT /api/sales/:id` - Update sale transaction
- `DELETE /api/sales/:id` - Delete sale transaction

## Database Schema

### Shoe Model
```javascript
{
  id: INTEGER (Primary Key),
  brand: STRING,
  model: STRING,
  colorway: STRING,
  size: FLOAT,
  condition: ENUM("New", "Used", "Like New"),
  purchasePrice: DECIMAL(12, 2),
  price: DECIMAL(12, 2),
  currentStock: INTEGER,
  createdAt: DATE,
  updatedAt: DATE
}
```

### SaleTransaction Model
```javascript
{
  id: INTEGER (Primary Key),
  totalAmount: DECIMAL(12, 2),
  transactionDate: DATE,
  createdAt: DATE,
  updatedAt: DATE
}
```

### SaleTransactionDetail Model
```javascript
{
  id: INTEGER (Primary Key),
  transactionId: INTEGER (Foreign Key),
  shoeId: INTEGER (Foreign Key),
  quantity: INTEGER,
  priceAtSale: DECIMAL(12, 2),
  subtotal: DECIMAL(12, 2),
  createdAt: DATE,
  updatedAt: DATE
}
```

## Project Structure

```
Aglet-Sales-Backend/
├── src/
│   ├── index.js                    # Application entry point
│   ├── config/
│   │   ├── database.js             # PostgreSQL connection config
│   │   └── swagger.js              # Swagger/OpenAPI setup
│   ├── controllers/
│   │   ├── shoe.js                 # Shoe business logic
│   │   └── sales.js                # Sales business logic
│   ├── models/
│   │   ├── index.js                # Model associations
│   │   ├── Shoe.js                 # Shoe model definition
│   │   ├── SaleTransaction.js      # Sale transaction model
│   │   └── SaleTransactionDetail.js # Sale detail model
│   ├── routes/
│   │   ├── shoe.js                 # Shoe API routes
│   │   └── sales.js                # Sales API routes
│   └── services/
│       └── ims.js                  # External IMS WebSocket client
├── .env                            # Environment variables (create this)
├── package.json                    # Dependencies and scripts
└── README.md                       # This file
```

## Development Workflow

1. **Start the backend server**
   ```bash
   npm run dev
   ```

2. **Check database connection**
   
   The console will show database sync status on startup

3. **Access API documentation**
   
   Navigate to `http://localhost:3000/api-docs`

4. **Start the frontend** (in separate terminal)
   ```bash
   cd ../aglet-pos-frontend/frontend
   npm run dev
   ```

## External Integration

### IMS Service (Inventory Management System)

The backend connects to an external IMS service via WebSocket for real-time inventory synchronization:

- **Auto-connect**: Service starts automatically on server launch
- **Auto-reconnect**: Reconnects every 5 seconds if connection is lost
- **Configuration**: Set `IMS_HOST` and `IMS_PORT` in `.env`
- **Default**: `ws://localhost:5000`

The IMS integration is optional and the API will function without it, though inventory sync features will be disabled.

## Environment Variable Reference

| Variable | Format | Default | Description |
|----------|--------|---------|-------------|
| `DB_NAME` / `PGDATABASE` | String | `aglet_sales` | Database name |
| `DB_USER` / `PGUSER` | String | `postgres` | Database username |
| `DB_PASSWORD` / `PGPASSWORD` | String | `password` | Database password |
| `DB_HOST` / `PGHOST` | String | `localhost` | Database host |
| `DB_PORT` / `PGPORT` | Number | `5432` | Database port |
| `IMS_HOST` | String | `localhost` | IMS service host |
| `IMS_PORT` | Number | `5000` | IMS service port |
| `PORT` | Number | `3000` | Server port |

## Troubleshooting

### Database Connection Issues

1. Verify PostgreSQL is running:
   ```bash
   # Windows (PowerShell)
   Get-Service postgresql*
   ```

2. Check database credentials in `.env` file

3. Ensure database exists:
   ```sql
   \l  -- List all databases in psql
   ```

### IMS Connection Issues

- Check if IMS service is running on configured host/port
- Verify firewall settings allow WebSocket connections
- Check console logs for WebSocket connection status

### Port Already in Use

If port 3000 is occupied, change the `PORT` in `.env`:
```env
PORT=3001
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

ISC

## Related Projects

- **Frontend**: [Aglet POS Frontend](https://github.com/realjeeyo/aglet-pos-frontend)
- **IMS Service**: External inventory management system (separate repository)
