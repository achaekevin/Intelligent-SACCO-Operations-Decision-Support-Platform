# Intelligent SACCO Operations & Decision-Support Platform

An enterprise-grade, automated SACCO Management System designed to streamline credit operations, automate multi-tier approval workflows, enforce dynamic business policies, monitor portfolio risk, and eliminate manual operational bottlenecks.

---

## Executive Summary & Problem Addressed

### Traditional SACCO Software Deficit
Legacy SACCO software relies heavily on manual calculations, rigid hardcoded approval paths, static business logic, fragmented operational screens, and reactive risk management.

### Platform Solution
This platform automates core SACCO operations with 15 integrated decision-support modules:
- Automated Multi-Factor Loan Eligibility Calculations
- Configurable Workflow Automation for Loans, Memberships, Withdrawals, and Expenses
- Dynamic Rule Engine for No-Code Business Policy Configuration
- Cryptographic Digital Document Workflow with Versioning and SHA-256 Signatures
- Unified Member Lifecycle Timeline
- Financial Health Analytics (PAR 30/60/90, Recovery Rate, Liquidity Ratio)
- Proactive Smart Risk Alerts and Automated Fraud Detection
- Central Approval Center for Multi-Module Queue Management
- Dynamic Product Builder for Savings and Loan Offerings
- Background Process Automation Daemon for Scheduled Tasks

---

## Core Enterprise Modules

### 1. Intelligent Loan Eligibility Engine
Automates credit scoring using 9 SACCO metrics: membership duration, 3x savings multiplier, share capital floor, contribution consistency, DTI ratio (<= 50%), default history, and employer check-off. Returns eligible KES amount, credit score, and policy check breakdown.

### 2. Workflow Automation Engine
Configurable multi-tier approval chains supporting Loans, Member Onboarding, Savings Withdrawals, Expenses, and Procurement.
- Example: Loan Officer -> Branch Manager -> Credit Committee -> CEO

### 3. Dynamic Rule Engine
Allows administrators to configure dynamic IF-THEN business policies at runtime without source code modifications (e.g. IF Savings >= 100,000 AND Membership >= 12 Months THEN Max Loan = Savings * 3).

### 4. Digital Document Workflow
Manages legal agreements, guarantor forms, contracts, and IDs with version control (`v1.0`, `v2.0`), SHA-256 digital signatures, audit logs, and review history.

### 5. Member Lifecycle Timeline
Displays a unified chronological event stream per member tracking onboarding, share capital purchases, loan applications, repayments, loan clearance, and dividend payouts.

### 6. Financial Health Dashboard
Executive decision-support dashboard tracking Portfolio at Risk (PAR 30/60/90), Loan Recovery Rate, YoY Savings Growth, Statutory Liquidity Ratio, and Branch Performance Matrix.

### 7. Smart Alerts System
Proactive early-warning radar detecting default risk indicators, 3-consecutive-month savings drops, large withdrawals, dormant accounts (>365 days), and guarantor exposure limits.

### 8. Fraud Detection Rules
Automated anomaly scanning for duplicate national IDs, multi-account single phone numbers, off-hours transactions, excessive failed login attempts, and self-approval attempts.

### 9. Central Approval Center
Unified queue interface for reviewing and processing pending requests across Loans, Memberships, Savings Withdrawals, Expenses, and Branch Limit requests.

### 10. Dynamic Product Builder
No-code creator for custom loan and savings products with dynamic interest rates, grace periods, minimum deposits, and lock periods.

### 11. Business Rules & Compliance Dashboard
Real-time compliance monitor displaying policy breaches, interest rate bounds compliance, share capital shortfalls, and violation audit logs.

### 12. Process Automation Engine
Background daemon executing scheduled operational tasks: monthly interest posting, 2.5% late default penalties, SMS/Email due date reminders, dormant account archiving, loan auto-closures, and dividend reports.

### 13. Internal Secure Messaging
Contextual messaging thread linked directly to specific loan application, withdrawal, or member IDs.

### 14. Executive Analytics Center
Analytics reporting on top loan products by volume, fastest-growing branches, most active members, profitability matrix, and YoY growth trends.

### 15. Configurable Dashboard Grid
Role-customizable modular dashboard layout grid for Admins, Loan Officers, Accountants, and Branch Managers.

---

## Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, TailwindCSS, Lucide Icons, Recharts, Redux Toolkit |
| **Backend** | Node.js, Express.js, Sequelize ORM, MySQL 8, Redis, Socket.io, BullMQ |

---

## Author & Copyright Notice

**Developed & Maintained by**: Kevin Achae  
**GitHub**: [achaekevin](https://github.com/achaekevin)  
**Email**: achaekevin@gmail.com  

© 2026 Kevin Achae. All Rights Reserved.
