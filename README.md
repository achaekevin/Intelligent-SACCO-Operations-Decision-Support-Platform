# 🏦 Intelligent SACCO Operations & Decision-Support Platform

An enterprise-grade, automated, rule-driven SACCO Management System engineered to streamline credit operations, automate multi-tier approval workflows, enforce dynamic business policies, monitor portfolio risk in real time, and eliminate operational bottlenecks.

---

## 🌟 Executive Summary & Market Gap Addressed

### The Traditional SACCO Software Deficit
Traditional SACCO (Savings and Credit Co-operative) software solutions suffer from critical architectural limitations:
1. **Manual Credit & Eligibility Calculations**: Loan officers spend hours manually checking savings balances, debt ratios, and share capital, leading to human error and delayed disbursements.
2. **Hardcoded Approval Paths**: Approval processes are static code routines. Changing an approval threshold (e.g. requiring CEO sign-off for loans > KES 2M) requires developer intervention and code deployment.
3. **Fragmented Module Operations**: Approvals for loans, member onboarding, savings withdrawals, and expenses exist in disconnected screens, slowing down management decision-making.
4. **Lack of Proactive Risk & Fraud Detection**: Legacy systems register defaults *after* they occur. They lack early-warning radars for consecutive savings drops, abnormal withdrawal spikes, or self-approval attempts.
5. **Static Product Offerings**: Launching a new product (e.g., *Education Flexi Loan* or *12-Month Festival Savings*) requires database migrations and backend code modifications.

### How This Platform Fills the Gap
This platform transforms SACCO management into an **intelligent, automated decision-support ecosystem** by introducing:
- 🤖 **Automated Multi-Factor Loan Eligibility Engine** (Instant KES amount & policy check breakdown).
- 🔀 **Configurable Workflow Automation Engine** (Multi-tier approval chains for Loans, Memberships, Withdrawals, Expenses).
- ⚙️ **Dynamic Rule Engine** (Admins define IF-THEN policy rules without code updates).
- 📜 **Cryptographic Digital Document Workflow** (SHA-256 signatures, version control, review audit trail).
- ⏳ **Unified Member Lifecycle Timeline** (Chronological record from onboarding to dividend payouts).
- 📊 **Financial Health & PAR Risk Indicators** (PAR 30/60/90, recovery rate %, liquidity ratio).
- 🚨 **Smart Early-Warning Radar & Fraud Detection** (Proactive anomaly scanning & self-approval blocks).
- 📥 **Central Approval Center** (Single operational queue for all pending organizational requests).
- 🛍️ **Dynamic Product Builder** (No-code loan and savings product launcher).
- ⚡ **Process Automation Daemon** (Automated interest compounding, late penalties, SMS reminders, loan closures).

---

## 🚀 15 Core Enterprise Features

### 1. Intelligent Loan Eligibility Engine ⭐⭐⭐⭐⭐
- **Automated Credit Scoring**: Evaluates member history across 9 SACCO policy metrics:
  - Membership duration threshold (> 6, 12, 24 months)
  - Savings multiplier capacity (e.g., 3x savings)
  - Share capital statutory minimum (KES 10,000)
  - Savings contribution consistency
  - Active debt & Debt-to-Income (DTI) ratio (<= 50%)
  - Clean repayment history / default record
  - Employer check-off validation
- **Instant Output**: Calculates exact eligible KES amount (e.g. KES 450,000), credit score (0-100), and a structured pass/fail policy checklist.

### 2. Workflow Automation Engine ⭐⭐⭐⭐⭐
- **Multi-Step Approval Chains**: Dynamically routes requests through multi-tier approval levels:
  $$\text{Loan Officer} \longrightarrow \text{Branch Manager} \longrightarrow \text{Credit Committee} \longrightarrow \text{CEO}$$
- **Multi-Module Support**: Standardized workflow runner for Loans, Membership Onboarding, Savings Withdrawals, Expenses, and Procurement.

### 3. Dynamic Rule Engine ⭐⭐⭐⭐⭐
- **No-Code Business Policy Configurator**: Admins define dynamic business rules:
  - `IF Savings >= 100,000 AND Membership >= 12 Months THEN Max Loan = Savings * 3`
  - `IF LoanAmount > 2,000,000 THEN Require CEO Approval`
  - `IF Guarantor Exposure > 4x Shares THEN Flag Policy Breach`
- Policy rules execute dynamically at runtime without source code modifications.

### 4. Digital Document Workflow ⭐⭐⭐⭐
- **Cryptographic Document Hub**: Manages legal agreements, guarantor pledges, member contracts, and IDs.
- **Key Features**: Version history control (`v1.0`, `v2.0`), SHA-256 digital signature seals with timestamped audit logs, approval statuses, and document review history.

### 5. Member Lifecycle Timeline ⭐⭐⭐⭐⭐
- **360° Member Event Stream**: Displays a complete visual chronological timeline of each member’s journey:
  $$\text{Joined SACCO} \rightarrow \text{Bought Share Capital} \rightarrow \text{Development Loan Approved} \rightarrow \text{Loan Settled} \rightarrow \text{Dividend Paid}$$

### 6. Financial Health Dashboard ⭐⭐⭐⭐⭐
- **Executive Decision Support**: Replaces plain totals with critical financial health indicators:
  - Portfolio at Risk (PAR 30, PAR 60, PAR 90)
  - Loan Recovery Rate %
  - YoY Savings Growth %
  - Statutory Liquidity Ratio %
  - Branch Performance Matrix & Member Retention Rate

### 7. Smart Alerts System ⭐⭐⭐⭐⭐
- **Proactive Early-Warning Radar**: Automated scanners detect risks before they escalate:
  - Member likely to default (repayment score drop)
  - Savings decline for 3 consecutive months
  - Large withdrawal request (> 60% savings balance)
  - Dormant account detection (> 365 days inactive)
  - Guarantor exposure ceiling breaches

### 8. Fraud Detection Rules ⭐⭐⭐⭐
- **Financial Crime & Anomaly Monitoring**: Real-time automated flagging for:
  - Duplicate National IDs across accounts
  - Multiple accounts sharing a single phone number
  - Off-hours high-value transactions (00:00 - 05:00 AM)
  - Excessive failed login attempts (IP auto-lock)
  - **Self-Approval Violation**: Blocks users attempting to approve their own transactions.

### 9. Central Approval Center ⭐⭐⭐⭐⭐
- **Unified Operational Queue**: Consolidates pending requests across all modules into a single, high-efficiency interface:
  - Pending Loans & Disburse Requests
  - Member Onboarding KYC
  - Savings Withdrawals
  - Expense Vouchers & Branch Limit Requests
- Supports single-click approvals, batch processing, and detailed audit notes.

### 10. Dynamic Product Builder ⭐⭐⭐⭐⭐
- **No-Code Product Launcher**: Administrators create custom loan and savings products with flexible rules:
  - *Holiday Savings*: 8% interest, KES 500 min deposit, 12-month lock period.
  - *Flexi Education Loan*: 9% interest, KES 600,000 limit, 6-month grace period.

### 11. Business Rules & Compliance Dashboard ⭐⭐⭐⭐
- Real-time monitor displaying policy breaches, interest rate bounds compliance, share capital shortfalls, and prevented violation audit logs.

### 12. Process Automation Engine ⭐⭐⭐⭐⭐
- **Autonomous Operations Daemon**: Scheduled background runner for routine SACCO tasks:
  - Monthly compounded savings interest posting
  - Overdue loan late penalty application (2.5%)
  - Automated SMS/Email due date reminders (7 days & 3 days prior)
  - Dormant account auto-archiving
  - Completed loan auto-closure & guarantor pledge release
  - Annual dividend calculation & distribution report generation

### 13. Internal Secure Messaging ⭐⭐⭐⭐
- **Context-Linked Chat Desk**: Internal communication between Loan Officers, Accountants, Branch Managers, and Members linked directly to specific loan application or transaction IDs.

### 14. Executive Analytics Center ⭐⭐⭐⭐⭐
- Deep insights: Top loan products by volume, fastest-growing branches, most active members, product profitability matrix, and MoM/YoY growth trends.

### 15. Configurable Dashboard Grid ⭐⭐⭐⭐
- Role-customizable modular dashboard layout grid for System Admins, Loan Officers, Accountants, and Branch Managers.

---

## 🛠️ Technology Stack

| Layer | Technology / Library | Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | **React 18**, **Vite** | Modern, ultra-fast client single-page application framework |
| **Styling System** | **TailwindCSS**, **Vanilla CSS** | Modern design system, sleek dark/light themes, glassmorphism |
| **Icons & Charts** | **Lucide Icons**, **Recharts** | Rich visual icons and interactive financial charts |
| **State & HTTP** | **Redux Toolkit**, **Axios** | Centralized application state management & API communication |
| **Backend Runtime** | **Node.js**, **Express.js** | Scalable REST API server with middleware architecture |
| **Database & ORM** | **MySQL 8**, **Sequelize ORM** | Relational database schema with relational associations |
| **Caching & Queues** | **Redis**, **BullMQ** | In-memory key-value caching and asynchronous background job queues |
| **Real-time & Security** | **Socket.io**, **JWT**, **Bcrypt** | Real-time events, JWT auth tokens, password hashing, Helmet headers |

---

## 💻 Installation & Local Setup

### Prerequisites
- Node.js (v18.0.0 or higher)
- MySQL Server (v8.0+)
- Git

### 1. Clone Repository
```bash
git clone https://github.com/achaekevin/Intelligent-SACCO-Operations-Decision-Support-Platform.git
cd Intelligent-SACCO-Operations-Decision-Support-Platform
```

### 2. Backend Setup
```bash
cd Backend
npm install --legacy-peer-deps
```
Configure your environment variables in `Backend/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=sacco_db
DB_USER=root
DB_PASSWORD=your_password
JWT_ACCESS_SECRET=your_secure_access_secret_2026
```
Start the Backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd Frontend
npm install
npm run dev
```

The application will be accessible at `http://localhost:5173` (or `http://localhost:5174`).

---

## 📄 License
This project is licensed under the MIT License - see the `LICENSE` file for details.
