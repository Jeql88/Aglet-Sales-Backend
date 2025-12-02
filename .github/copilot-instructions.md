# Aglet Sales Backend - AI Coding Agent Instructions

## Project Overview
Backend API for Aglet shoe resale POS system. Express.js + Sequelize + PostgreSQL with WebSocket integration to external Inventory Management System (IMS). Serves the React frontend at `../aglet-pos-frontend`.

## Architecture & Key Components

### Backend Stack
- **Express.js**: RESTful API with Swagger documentation at `/api-docs`
- **Sequelize ORM**: PostgreSQL with auto-sync models (`{ alter: true }`)
- **WebSocket Service**: Real-time integration with external IMS for inventory sync
- **Models**: `Shoe`, `SaleTransaction`, `SaleTransactionDetail` with proper associations

### Critical Model Associations
```javascript
SaleTransaction.hasMany(SalesTransactionDetail, { foreignKey: "transactionId", as: "details" });
SalesTransactionDetail.belongsTo(Shoe, { foreignKey: "shoeId" });
```
**Always use the `"details"` alias** when querying transactions with includes.

## Development Workflows

### Startup Sequence
```bash
npm run dev          # Start with nodemon for hot reload
npm start           # Production start
```
Backend must start before frontend (runs on `localhost:3000`).

### API Documentation
- **Swagger UI**: `http://localhost:3000/api-docs`
- All routes use JSDoc comments for OpenAPI spec
- Example pattern:
```javascript
/**
 * @swagger
 * /api/shoes:
 *   post:
 *     summary: Create a new shoe
 *     tags: [Shoes]
 */
```

## Project-Specific Patterns

### Environment Configuration
Supports dual environment variable formats for flexible deployment:
```javascript
// Standard format OR PostgreSQL format
DB_NAME || PGDATABASE || "aglet_sales"
DB_USER || PGUSER || "postgres"
```

### IMS WebSocket Integration
- **Auto-connect**: Service starts automatically in `src/index.js`
- **Auto-reconnect**: 5-second intervals on connection loss
- **Environment**: `IMS_HOST`, `IMS_PORT` (defaults: localhost:5000)
- **Protocol**: Auto-detects `ws://` or `wss://` based on port 7183

### Error Handling Pattern
Controllers use consistent try-catch with structured responses:
```javascript
try {
  const result = await Model.operation();
  res.status(201).json(result);
} catch (err) {
  console.error(`[OPERATION] Error:`, err.message);
  res.status(400).json({ error: err.message });
}
```

### Database Schema Conventions
- **Monetary Values**: `DECIMAL(12, 2)` for all prices
- **Condition Enum**: "New", "Used", "Like New" 
- **Timestamps**: Auto-added to all models
- **Stock Management**: `currentStock` integer field

## Key Files & Integration Points

### Core Structure
- `src/models/index.js`: **Central associations** - modify here for relationship changes
- `src/services/ims.js`: **External integration** - WebSocket client for inventory sync
- `src/config/database.js`: **Multi-environment** PostgreSQL connection
- `src/config/swagger.js`: **API documentation** setup

### Controllers Pattern
- `src/controllers/shoe.js`: Local DB operations + IMS sync
- `src/controllers/sales.js`: Transaction processing with proper associations

## Development Guidelines

1. **Database First**: Always ensure models sync before API testing
2. **IMS Integration**: Check WebSocket connection status for inventory operations
3. **Swagger Documentation**: Document all new endpoints with JSDoc comments
4. **Association Queries**: Use `include` for eager loading with proper aliases
5. **Environment Variables**: Support both standard and PostgreSQL formats

## Frontend Integration
- **CORS**: Enabled for frontend at different port
- **API Base**: Frontend expects `http://localhost:3000/api`
- **JSON Responses**: All endpoints return consistent JSON structure

When working with this codebase:
1. Start backend before frontend development
2. Check IMS WebSocket connection in logs for inventory features
3. Use Swagger docs for API endpoint specifications
4. Follow existing JSDoc patterns for new routes
5. Test model associations with proper `include` syntax