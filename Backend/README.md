# Amana SACCO Management System - Backend

A comprehensive, production-ready RESTful API for managing SACCO (Savings and Credit Cooperative) operations built with Node.js, Express, MySQL, and Redis.

## 🚀 Features

### Core Modules
- ✅ **Authentication & Authorization** - JWT-based auth, role-based access control (RBAC), email verification, password reset
- ✅ **Member Management** - Registration, activation, profile management, KYC, next of kin, beneficiaries
- ✅ **Branch Management** - Multi-branch support, branch performance tracking, manager assignment
- ✅ **Savings Management** - Multiple account types (Ordinary, Share Capital, Fixed Deposit), deposits, withdrawals
- ✅ **Loan Management** - Loan products, applications, approvals, disbursements, repayments, guarantors
- ✅ **Transaction Engine** - Comprehensive transaction recording, reversals, receipts, audit trail
- ✅ **Guarantor System** - Add guarantors, validate shares, liability tracking, acceptance/decline
- ✅ **Notifications** - Multi-channel (In-app, Email, SMS), real-time updates, admin broadcast
- ✅ **Reports & Analytics** - Members, Savings, Loans, Transactions, Financial reports (JSON/CSV/Excel/PDF)
- ✅ **Dashboard** - Admin and Member dashboards with charts, statistics, recent activity
- ✅ **Accounting** - Chart of accounts, journal entries, trial balance, income statements
- ✅ **Audit Logging** - Complete audit trail of all system activities

### Technical Features
- RESTful API architecture
- JWT authentication with refresh tokens
- Multi-tenancy (Organization isolation)
- Role-based permissions
- Request validation (Joi)
- API documentation (Swagger/OpenAPI)
- Real-time features (Socket.IO)
- Background jobs (BullMQ - optional)
- File uploads
- Email service (Nodemailer)
- SMS service (Africa's Talking/Twilio)
- Database migrations & seeders

## 🛠 Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** MySQL 8.0
- **Cache/Session:** Redis 3.0+ (5.0+ recommended for BullMQ)
- **ORM:** Sequelize
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** Joi
- **File Upload:** Multer
- **Email:** Nodemailer
- **SMS:** Africa's Talking, Twilio
- **Documentation:** Swagger/OpenAPI
- **Real-time:** Socket.IO
- **Queue:** BullMQ (optional)
- **Logging:** Winston

## 📋 Prerequisites

- Node.js 18.x or higher
- MySQL 8.0 or higher
- Redis 3.0 or higher (5.0+ recommended)
- npm or yarn

## 🔧 Installation

### 1. Clone the repository
```bash
git clone https://github.com/achaekevin/Sacco-Management-Platform.git
cd "Sacco Management System/Backend"
```

### 2. Install dependencies
```bash
npm install --legacy-peer-deps
```

### 3. Configure environment variables
```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# App Configuration
NODE_ENV=development
PORT=5000
APP_NAME=Amana SACCO Management System
FRONTEND_URL=http://localhost:5174

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=sacco_management_system
DB_USER=sacco_user
DB_PASSWORD=NewSecurePassword2026!
DB_DIALECT=mysql

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-this-too
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=Amana SACCO <noreply@amanasacco.com>

# SMS Configuration (Optional)
SMS_ENABLED=false
SMS_PROVIDER=africas_talking
SMS_API_KEY=your-api-key
SMS_USERNAME=sandbox
SMS_SENDER_ID=AMANA

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads

# Logging
LOG_LEVEL=info
```

### 4. Database Setup

**Create the database:**
```sql
CREATE DATABASE sacco_management_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'sacco_user'@'localhost' IDENTIFIED BY 'NewSecurePassword2026!';
GRANT ALL PRIVILEGES ON sacco_management_system.* TO 'sacco_user'@'localhost';
FLUSH PRIVILEGES;
```

**Run migrations:**
```bash
npx sequelize-cli db:migrate
```

**Run seeders (creates roles, permissions, and demo data):**
```bash
npx sequelize-cli db:seed:all
```

### 5. Start the server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will start on `http://localhost:5000`

## 🔐 Default Login Credentials

After running the seeders, use these credentials to login:

### SACCO Admin
- **Email:** admin@sacco.co.ke
- **Password:** admin123

### Loan Officer
- **Email:** loans@sacco.co.ke
- **Password:** loans123

### Teller/Cashier
- **Email:** teller@sacco.co.ke
- **Password:** teller123

### Auditor
- **Email:** auditor@sacco.co.ke
- **Password:** auditor123

### Member (Sample)
- **Email:** member@sacco.co.ke
- **Password:** member123

> **Note:** Please change these default passwords immediately after first login in production environments.

## 📚 API Documentation

Once the server is running, access the Swagger API documentation at:

**http://localhost:5000/api-docs**

## 🏗 Project Structure

```
Backend/
├── src/
│   ├── config/          # Configuration files (database, redis, swagger)
│   ├── constants/       # Application constants (roles, statuses)
│   ├── controllers/     # Request handlers
│   ├── middlewares/     # Auth, validation, error handling
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── validators/      # Joi validation schemas
│   ├── utils/           # Helper functions
│   ├── jobs/            # Background jobs (optional)
│   ├── events/          # Event emitters
│   ├── migrations/      # Database migrations
│   ├── seeders/         # Database seeders
│   └── server.js        # Application entry point
├── uploads/             # Uploaded files (generated)
├── logs/                # Application logs (generated)
├── .env                 # Environment variables
├── .sequelizerc         # Sequelize configuration
├── package.json
└── README.md
```

## 🔒 User Roles & Permissions

### SACCO Admin
- Full system access
- Manage organizations, branches, users
- Approve/reject loans
- Access all reports and analytics
- System configuration

### Loan Officer
- Manage loan applications
- Process loan disbursements
- View loan portfolios
- Generate loan reports

### Teller/Cashier
- Process deposits and withdrawals
- Handle transactions
- View transaction history
- Generate transaction reports

### Auditor
- View-only access to all modules
- Access audit logs
- Generate compliance reports
- Monitor system activities

### Member
- View personal dashboard
- Apply for loans
- View savings accounts
- Check transaction history
- Download statements

## 🌐 API Endpoints

### Authentication
```
POST   /api/v1/auth/register              # Register organization
POST   /api/v1/auth/login                 # Login
POST   /api/v1/auth/refresh-token         # Refresh JWT token
POST   /api/v1/auth/logout                # Logout
POST   /api/v1/auth/forgot-password       # Request password reset
POST   /api/v1/auth/reset-password        # Reset password
POST   /api/v1/auth/verify-email          # Verify email
POST   /api/v1/auth/change-password       # Change password
```

### Members
```
GET    /api/v1/members                    # List members
POST   /api/v1/members                    # Register member
GET    /api/v1/members/:id                # Get member details
PATCH  /api/v1/members/:id                # Update member
DELETE /api/v1/members/:id                # Delete member
PATCH  /api/v1/members/:id/activate       # Activate member
POST   /api/v1/members/self-register      # Member self-registration
```

### Savings
```
GET    /api/v1/savings/accounts           # List savings accounts
POST   /api/v1/savings/accounts           # Create savings account
POST   /api/v1/savings/deposit            # Process deposit
POST   /api/v1/savings/withdraw           # Process withdrawal
GET    /api/v1/savings/transactions       # Transaction history
GET    /api/v1/savings/accounts/:id       # Account details
```

### Loans
```
GET    /api/v1/loans                      # List loans
POST   /api/v1/loans/apply                # Apply for loan
PATCH  /api/v1/loans/:id/approve          # Approve loan
PATCH  /api/v1/loans/:id/reject           # Reject loan
PATCH  /api/v1/loans/:id/disburse         # Disburse loan
POST   /api/v1/loans/:id/repay            # Loan repayment
GET    /api/v1/loans/:id/schedule         # Repayment schedule
POST   /api/v1/loans/:id/guarantors       # Add guarantor
GET    /api/v1/loans/guarantors           # List guarantors
```

### Dashboard
```
GET    /api/v1/dashboard/admin/stats      # Admin statistics
GET    /api/v1/dashboard/member/stats     # Member statistics
GET    /api/v1/dashboard/admin/transactions
GET    /api/v1/dashboard/member/transactions
GET    /api/v1/dashboard/charts/savings-growth
GET    /api/v1/dashboard/charts/member-growth
```

### Reports
```
GET    /api/v1/reports/members            # Members report
GET    /api/v1/reports/savings            # Savings report
GET    /api/v1/reports/loans              # Loans report
GET    /api/v1/reports/transactions       # Transactions report
GET    /api/v1/reports/financial          # Financial report
GET    /api/v1/reports/statement/:memberId # Member statement
```

### Notifications
```
GET    /api/v1/notifications              # List notifications
GET    /api/v1/notifications/unread-count
PATCH  /api/v1/notifications/:id/read
PATCH  /api/v1/notifications/read-all
POST   /api/v1/notifications              # Send notification (Admin)
```

### Branches
```
GET    /api/v1/branches                   # List branches
POST   /api/v1/branches                   # Create branch
PATCH  /api/v1/branches/:id               # Update branch
DELETE /api/v1/branches/:id               # Delete branch
```

Full API documentation available at `/api-docs`

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Production Checklist
- [ ] Change all default passwords
- [ ] Update JWT secrets in `.env`
- [ ] Configure production database
- [ ] Set up SSL/TLS certificates
- [ ] Configure email SMTP settings
- [ ] Set up SMS provider (if using)
- [ ] Configure Redis for production
- [ ] Set `NODE_ENV=production`
- [ ] Enable error tracking (Sentry, etc.)
- [ ] Set up backup strategy
- [ ] Configure firewall rules
- [ ] Set up monitoring (PM2, New Relic, etc.)

### Using PM2 (Recommended)
```bash
npm install -g pm2
pm2 start src/server.js --name sacco-backend
pm2 save
pm2 startup
```

## 🐛 Troubleshooting

### Redis BullMQ Errors
If you see Redis version errors with BullMQ:
- Upgrade Redis to 5.0+ for full BullMQ support
- Or disable background jobs (system works fine without them)
- Core features (auth, members, savings, loans) work with Redis 3.0+

### Database Connection Issues
```bash
# Test MySQL connection
mysql -u sacco_user -p sacco_management_system

# Check if migrations ran
npx sequelize-cli db:migrate:status
```

### Port Already in Use
```bash
# Change PORT in .env file or kill existing process
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5000
kill -9 <PID>
```

## 📝 License

Copyright © 2026 Amana SACCO. All rights reserved.

## 👥 Support

For issues and questions:
- GitHub Issues: https://github.com/achaekevin/Sacco-Management-Platform/issues
- Email: support@amanasacco.com

## 🙏 Acknowledgments

Built with ❤️ for SACCO organizations across Kenya.
