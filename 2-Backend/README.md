# SACCO Management System — Backend API

Production-ready, multi-tenant REST API for Kenyan SACCOs. Built with Node.js, Express, MySQL, Sequelize, JWT, Redis, Socket.IO, BullMQ, and Docker.

---

## Architecture

```
Clean Architecture
├── Routes          → HTTP entry points, Swagger annotations
├── Middleware      → Auth (JWT + RBAC), validation, audit logging, error handling
├── Controllers     → HTTP glue — parse request, call service, return response
├── Services        → Business logic (all decisions live here)
├── Repositories    → Data access layer (Sequelize queries, org-scoped)
├── Models          → Sequelize models + associations
├── Validators      → Joi schemas (input validation)
└── Utils           → Helpers, error classes, response builders
```

---

## Modules

| Module | Status | Description |
|---|---|---|
| **Authentication** | ✅ Full | Register, Login, Logout, Refresh, Email Verify, Forgot/Reset/Change Password, Account Lockout |
| **Organizations** | ✅ Full | Multi-tenant SACCO setup, settings, subscription plans |
| **Branches** | ✅ Full | Multi-branch CRUD, manager assignment, stats |
| **Members** | ✅ Full | Registration, documents, next of kin, activation/suspension, statements |
| **Savings** | ✅ Full | Ordinary/Share Capital/Fixed Deposit accounts, Deposit/Withdraw/Transfer, Reversals, Interest Accrual |
| **Loans** | 🔧 Stub | Full lifecycle: apply → approve → disburse → repay → close + guarantors |
| **Accounting** | 🔧 Stub | Double-entry: chart of accounts, journal entries, trial balance, P&L, balance sheet |
| **Reports** | 🔧 Stub | PDF/Excel/CSV exports for members, savings, loans, financials |
| **M-Pesa** | 🔧 Stub | STK Push, paybill callback, B2C, reconciliation |
| **Notifications** | 🔧 Stub | In-app + email + SMS, Socket.IO real-time |
| **Audit Logs** | 🔧 Stub | Full action tracking with IP, user, module, timestamps |

---

## Quick Start

### Prerequisites
- Node.js 20+
- MySQL 8
- Redis 7

```bash
# 1. Clone and install
git clone <repo-url>
cd sacco-backend
npm install

# 2. Configure environment
cp .env.example .env
# → Edit .env with your MySQL and Redis credentials

# 3. Run migrations and seed demo data
npm run migrate
npm run seed

# 4. Start development server
npm run dev
```

API: http://localhost:5000/api/v1  
Swagger: http://localhost:5000/api-docs  
Health: http://localhost:5000/api/v1/health

---

## Docker (recommended)

```bash
cp .env.example .env
docker compose up --build
```

Starts: MySQL 8 + Redis 7 + Express API + Nginx reverse proxy

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| SACCO Admin | admin@umojasacco.co.ke | Admin@1234 |
| Cashier | cashier@umojasacco.co.ke | Cash@1234 |
| Member | member@umojasacco.co.ke | Member@1234 |

---

## API Endpoints

### Auth
```
POST   /api/v1/auth/register               Register new SACCO + admin
POST   /api/v1/auth/login                  Login (returns JWT pair)
POST   /api/v1/auth/logout                 Logout (blacklists token)
POST   /api/v1/auth/refresh                Rotate refresh token
GET    /api/v1/auth/me                     Current user profile
POST   /api/v1/auth/verify-email           Verify email with token
POST   /api/v1/auth/resend-verification    Resend verification email
POST   /api/v1/auth/forgot-password        Request password reset
POST   /api/v1/auth/reset-password         Reset with token
POST   /api/v1/auth/change-password        Change password (auth required)
```

### Members
```
GET    /api/v1/members                     List with pagination/search/filter
POST   /api/v1/members                     Register new member
GET    /api/v1/members/stats               Organization member statistics
GET    /api/v1/members/:id                 Member detail (with accounts + docs)
PUT    /api/v1/members/:id                 Update member
PATCH  /api/v1/members/:id/activate        Activate pending member
PATCH  /api/v1/members/:id/suspend         Suspend member
POST   /api/v1/members/:id/next-of-kin     Add next of kin
POST   /api/v1/members/:id/documents       Upload document (multipart)
GET    /api/v1/members/:id/statement       Account statement (date range)
```

### Savings
```
GET    /api/v1/savings/accounts                         List all accounts
POST   /api/v1/savings/accounts                         Open new account
GET    /api/v1/savings/accounts/:id                     Account details
GET    /api/v1/savings/accounts/:id/transactions        Account transactions
GET    /api/v1/savings/members/:memberId/accounts       Member's accounts
POST   /api/v1/savings/deposit                          Process deposit
POST   /api/v1/savings/withdraw                         Process withdrawal
POST   /api/v1/savings/transfer                         Transfer between accounts
GET    /api/v1/savings/transactions                     All transactions
POST   /api/v1/savings/transactions/:id/reverse         Reverse transaction
```

### Branches
```
GET    /api/v1/branches                    List branches
POST   /api/v1/branches                    Create branch
GET    /api/v1/branches/:id                Branch details
PUT    /api/v1/branches/:id                Update branch
DELETE /api/v1/branches/:id                Delete branch
GET    /api/v1/branches/:id/stats          Branch statistics
PATCH  /api/v1/branches/:id/assign-manager Assign manager
```

---

## Security

- **JWT access tokens** (30 min) + **refresh tokens** (7 days) stored in Redis
- **Token blacklisting** on logout via Redis
- **Account lockout** after 5 failed login attempts (configurable)
- **Refresh token rotation** — old token revoked on each refresh
- **Multi-tenant isolation** — every query is org-scoped via `tenantIsolation` middleware
- **Role-based access control** via `authorize(...roles)` middleware
- **Permission-based authorization** via `requirePermission(permission)` middleware
- **Helmet** (security headers), **hpp** (parameter pollution), **rate limiting**
- **Input validation** via Joi on every write endpoint
- **Audit logging** on all sensitive actions

---

## Real-time (Socket.IO)

Connect with a JWT access token:
```js
const socket = io('http://localhost:5000', {
  auth: { token: '<access_token>' }
});

// Listen for events
socket.on('notification:new', (data) => console.log('New notification:', data));
socket.on('transaction:completed', (data) => console.log('Transaction:', data));
socket.on('loan:approved', (data) => console.log('Loan approved:', data));
```

Users automatically join rooms: `user:{id}`, `org:{orgId}`, `branch:{branchId}`

---

## Background Jobs (BullMQ)

| Job | Schedule | Description |
|---|---|---|
| Interest Accrual | 1st of month, 00:05 | Credits monthly savings interest to all active accounts |
| Loan Penalty Check | Daily, 01:00 | Marks overdue loan repayments |
| Loan Reminders | Daily, 08:00 | Sends notifications for repayments due in 3 days |
| Dashboard Cache | Daily, 06:00 | Pre-computes org statistics into Redis |
| Monthly Statements | 1st of month, 00:30 | Queues statement notifications for all active members |

---

## Database Schema

```
organizations ─┬─< branches ─┬─< users
               │              └─< members ─┬─< savings_accounts ─< savings_transactions
               │                           ├─< loans ─┬─< loan_repayments
               │                           │           └─< guarantors
               │                           ├─< next_of_kin
               │                           └─< member_documents
               ├─< roles ─< role_permissions ─< permissions
               ├─< loan_products
               ├─< chart_of_accounts ─< journal_lines
               ├─< journal_entries ─< journal_lines
               ├─< audit_logs
               ├─< notifications
               └─< mpesa_transactions
```

---

## Running Tests

```bash
npm test                    # All tests
npm run test:coverage       # With coverage report
```

Test suite includes:
- **Unit tests** — AuthService (login/lockout/password), SavingsService (deposit/withdrawal/transfer/interest), MemberService (registration/activation), Utility helpers
- **Integration tests** — Joi schema validation for all API inputs (auth, members, savings, branches)

Target coverage: 90%+

---

## Environment Variables

See `.env.example` for the full list. Key variables:

| Variable | Description |
|---|---|
| `DJANGO_SECRET_KEY` → `JWT_ACCESS_SECRET` | JWT signing secret |
| `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | MySQL connection |
| `REDIS_HOST`, `REDIS_PORT` | Redis connection |
| `SMTP_*` | Email (SMTP) credentials |
| `MPESA_*` | Safaricom Daraja API credentials |
| `MAX_LOGIN_ATTEMPTS` | Before account lockout (default: 5) |
| `LOCKOUT_DURATION_MINUTES` | Lockout duration (default: 30) |

---

## Project Structure

```
src/
├── config/         database.js, redis.js, swagger.js, sequelize.cjs
├── constants/      roles, permissions, transaction types, cache TTLs
├── controllers/    one controller per module (thin — delegates to services)
├── jobs/           scheduledJobs.js (node-cron)
├── middlewares/    auth.js, validate.js, errorHandler.js, auditLog.js
├── migrations/     ordered DB migrations (01→07)
├── models/         Sequelize models + central index.js with all associations
├── queues/         BullMQ queues + workers (email, notification, interest)
├── repositories/   BaseRepository + feature repos (auth, org, member, savings)
├── routes/         Express routers with Swagger JSDoc
├── seeders/        Demo data (roles, org, members, loan products, CoA)
├── services/       authService, memberService, savingsService, branchService,
│                   organizationService, emailService, tokenService
├── socket/         Socket.IO auth + room management + event emitters
├── tests/
│   ├── unit/       authService, savingsService, memberService, utils
│   └── integration/ auth endpoints, member+savings validators, testHelpers
├── uploads/        local file storage (documents, photos)
├── utils/          logger.js, helpers.js, errors.js, response.js
├── validators/     Joi schemas for all modules
├── app.js          Express factory (middleware stack)
└── server.js       HTTP + Socket.IO bootstrap + graceful shutdown
```
