import swaggerUi from 'swagger-ui-express';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'SACCO Management System API',
    version: '1.0.0',
    description: `
Production-ready REST API for a multi-tenant SACCO management system supporting:
- Multi-organization, multi-branch operations
- Role-based access control (Super Admin → Member)
- Savings accounts (ordinary, share capital, fixed deposits)
- Full loan lifecycle management
- Double-entry accounting
- M-Pesa Daraja integration
- Real-time Socket.IO notifications
- Background job processing with BullMQ

**Demo Credentials**
| Role | Email | Password |
|---|---|---|
| SACCO Admin | admin@umojasacco.co.ke | Admin@1234 |
| Cashier | cashier@umojasacco.co.ke | Cash@1234 |
| Member | member@umojasacco.co.ke | Member@1234 |
    `,
    contact: {
      name: 'SACCO System Support',
      email: 'support@sacco-system.co.ke',
    },
    license: { name: 'MIT' },
  },
  servers: [
    { url: `http://localhost:${process.env.PORT || 5000}/api/v1`, description: 'Development' },
    { url: 'https://api.yoursacco.co.ke/api/v1', description: 'Production' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT access token obtained from POST /auth/login',
      },
    },
    schemas: {
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operation successful' },
          data: { type: 'object' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Validation failed' },
          errors: { type: 'array', items: { type: 'object', properties: { field: { type: 'string' }, message: { type: 'string' } } } },
        },
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { type: 'array' },
          meta: {
            type: 'object',
            properties: {
              page: { type: 'integer' },
              limit: { type: 'integer' },
              total: { type: 'integer' },
              totalPages: { type: 'integer' },
              hasNextPage: { type: 'boolean' },
              hasPrevPage: { type: 'boolean' },
            },
          },
        },
      },
      Member: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          memberNumber: { type: 'string', example: 'MBR-20240001' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          phone: { type: 'string' },
          email: { type: 'string', format: 'email' },
          nationalId: { type: 'string' },
          status: { type: 'string', enum: ['active', 'inactive', 'suspended', 'pending'] },
          loyaltyTier: { type: 'string', enum: ['bronze', 'silver', 'gold', 'platinum'] },
          joiningDate: { type: 'string', format: 'date' },
        },
      },
      SavingsAccount: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          accountNumber: { type: 'string', example: 'SAV-1704000001' },
          accountType: { type: 'string', enum: ['ordinary', 'share_capital', 'fixed_deposit'] },
          balance: { type: 'number', example: 45000.00 },
          availableBalance: { type: 'number' },
          interestRate: { type: 'number', example: 6.0 },
          status: { type: 'string', enum: ['active', 'dormant', 'closed', 'frozen'] },
        },
      },
      Transaction: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          reference: { type: 'string', example: 'TXN-1718000000-A3F2' },
          type: { type: 'string', enum: ['deposit', 'withdrawal', 'transfer', 'loan_repayment', 'interest_credit'] },
          amount: { type: 'number' },
          balanceBefore: { type: 'number' },
          balanceAfter: { type: 'number' },
          paymentMethod: { type: 'string', enum: ['cash', 'mpesa', 'bank_transfer', 'cheque'] },
          status: { type: 'string', enum: ['pending', 'completed', 'failed', 'reversed'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

export const setupSwagger = (app) => {
  const options = {
    customCss: `
      .swagger-ui .topbar { background-color: #16a34a; }
      .swagger-ui .topbar .link img { display: none; }
      .swagger-ui .topbar .link::after { content: "SACCO Management System API"; color: white; font-size: 1rem; font-weight: bold; }
    `,
    customSiteTitle: 'SACCO API Docs',
    swaggerOptions: { persistAuthorization: true },
  };

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDefinition, options));
  app.get('/api-docs.json', (req, res) => res.json(swaggerDefinition));
};
