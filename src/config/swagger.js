const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Aglet POS API',
      version: '1.0.0',
      description: 'API for Aglet Point of Sale system - Shoe resell inventory and sales management',
      contact: {
        name: 'Josh Edward Lui',
        email: 'your-email@example.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
        Shoe: {
          type: 'object',
          required: ['brand', 'model', 'price'],
          properties: {
            id: {
              type: 'integer',
              description: 'Auto-generated unique identifier'
            },
            brand: {
              type: 'string',
              description: 'Shoe brand name',
              example: 'Nike'
            },
            model: {
              type: 'string',
              description: 'Shoe model name',
              example: 'Air Jordan 1'
            },
            colorway: {
              type: 'string',
              description: 'Shoe colorway',
              example: 'Bred'
            },
            size: {
              type: 'string',
              description: 'Shoe size',
              example: '10.5'
            },
            condition: {
              type: 'string',
              enum: ['New', 'Used', 'Like New'],
              description: 'Condition of the shoe'
            },
            purchasePrice: {
              type: 'number',
              format: 'decimal',
              description: 'Price paid for the shoe',
              example: 150.00
            },
            price: {
              type: 'number',
              format: 'decimal',
              description: 'Selling price',
              example: 250.00
            },
            currentStock: {
              type: 'integer',
              description: 'Current stock quantity',
              example: 5
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        SaleTransaction: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Transaction ID'
            },
            transactionDateTime: {
              type: 'string',
              format: 'date-time',
              description: 'Date and time of transaction'
            },
            totalAmount: {
              type: 'number',
              format: 'decimal',
              description: 'Total amount of the transaction'
            },
            paymentMethod: {
              type: 'string',
              description: 'Payment method used',
              example: 'cash'
            },
            notes: {
              type: 'string',
              description: 'Additional notes for the transaction'
            },
            details: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/SaleTransactionDetail'
              }
            }
          }
        },
        SaleTransactionDetail: {
          type: 'object',
          properties: {
            id: {
              type: 'integer'
            },
            transactionId: {
              type: 'integer'
            },
            shoeId: {
              type: 'integer'
            },
            quantity: {
              type: 'integer',
              example: 2
            },
            priceAtSale: {
              type: 'number',
              format: 'decimal',
              example: 250.00
            },
            subtotal: {
              type: 'number',
              format: 'decimal',
              example: 500.00
            },
            Shoe: {
              $ref: '#/components/schemas/Shoe'
            }
          }
        },
        CreateSaleRequest: {
          type: 'object',
          required: ['items'],
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                required: ['shoeId', 'quantity', 'price'],
                properties: {
                  shoeId: {
                    type: 'integer',
                    description: 'ID of the shoe being sold'
                  },
                  quantity: {
                    type: 'integer',
                    description: 'Quantity being sold',
                    minimum: 1
                  },
                  price: {
                    type: 'number',
                    format: 'decimal',
                    description: 'Price per unit'
                  }
                }
              }
            }
          }
        },
        DashboardStats: {
          type: 'object',
          properties: {
            totalSales: {
              type: 'number',
              format: 'decimal',
              description: 'Total sales amount'
            },
            revenue: {
              type: 'number',
              format: 'decimal',
              description: 'Total revenue (profit)'
            },
            topProduct: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                brand: { type: 'string' },
                model: { type: 'string' },
                totalSold: { type: 'integer' }
              }
            },
            recentTransactions: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/SaleTransaction'
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js'] // Path to the API docs
};

const specs = swaggerJSDoc(options);

module.exports = { specs, swaggerUi };