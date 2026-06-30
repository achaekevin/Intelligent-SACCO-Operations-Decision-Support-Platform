// ─── User Roles ───────────────────────────────────────────────
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  SACCO_ADMIN: 'sacco_admin',
  BRANCH_MANAGER: 'branch_manager',
  LOAN_OFFICER: 'loan_officer',
  ACCOUNTANT: 'accountant',
  CASHIER: 'cashier',
  AUDITOR: 'auditor',
  MEMBER: 'member',
};

// ─── Permissions ──────────────────────────────────────────────
export const PERMISSIONS = {
  // Members
  MEMBER_CREATE: 'member:create',
  MEMBER_READ: 'member:read',
  MEMBER_UPDATE: 'member:update',
  MEMBER_DELETE: 'member:delete',
  // Savings
  SAVINGS_DEPOSIT: 'savings:deposit',
  SAVINGS_WITHDRAW: 'savings:withdraw',
  SAVINGS_READ: 'savings:read',
  // Loans
  LOAN_APPLY: 'loan:apply',
  LOAN_APPROVE: 'loan:approve',
  LOAN_DISBURSE: 'loan:disburse',
  LOAN_READ: 'loan:read',
  // Reports
  REPORT_READ: 'report:read',
  REPORT_EXPORT: 'report:export',
  // Accounting
  ACCOUNTING_READ: 'accounting:read',
  ACCOUNTING_WRITE: 'accounting:write',
  // Settings
  SETTINGS_MANAGE: 'settings:manage',
  // Users
  USER_MANAGE: 'user:manage',
  // Branches
  BRANCH_MANAGE: 'branch:manage',
  // Audit
  AUDIT_READ: 'audit:read',
};

// ─── Savings Account Types ────────────────────────────────────
export const SAVINGS_ACCOUNT_TYPES = {
  ORDINARY: 'ordinary',
  SHARE_CAPITAL: 'share_capital',
  FIXED_DEPOSIT: 'fixed_deposit',
};

// ─── Transaction Types ────────────────────────────────────────
export const TRANSACTION_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  TRANSFER: 'transfer',
  LOAN_DISBURSEMENT: 'loan_disbursement',
  LOAN_REPAYMENT: 'loan_repayment',
  INTEREST_CREDIT: 'interest_credit',
  PENALTY: 'penalty',
  REVERSAL: 'reversal',
  FEE: 'fee',
};

// ─── Transaction Statuses ─────────────────────────────────────
export const TRANSACTION_STATUSES = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REVERSED: 'reversed',
};

// ─── Loan Statuses ────────────────────────────────────────────
export const LOAN_STATUSES = {
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  DISBURSED: 'disbursed',
  COMPLETED: 'completed',
  DEFAULTED: 'defaulted',
  RESTRUCTURED: 'restructured',
};

// ─── Member Statuses ──────────────────────────────────────────
export const MEMBER_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING: 'pending',
};

// ─── Loyalty Tiers ────────────────────────────────────────────
export const LOYALTY_TIERS = {
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
  PLATINUM: 'platinum',
};

// ─── Notification Types ───────────────────────────────────────
export const NOTIFICATION_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  LOAN_APPROVED: 'loan_approved',
  LOAN_REJECTED: 'loan_rejected',
  LOAN_DISBURSED: 'loan_disbursed',
  LOAN_REMINDER: 'loan_reminder',
  LOW_BALANCE: 'low_balance',
  STATEMENT: 'statement',
  SYSTEM: 'system',
};

// ─── Audit Actions ────────────────────────────────────────────
export const AUDIT_ACTIONS = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  LOGIN_FAILED: 'login_failed',
  REGISTER: 'register',
  PASSWORD_CHANGE: 'password_change',
  PASSWORD_RESET: 'password_reset',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  APPROVE: 'approve',
  REJECT: 'reject',
  DISBURSE: 'disburse',
  DEPOSIT: 'deposit',
  WITHDRAW: 'withdraw',
  TRANSFER: 'transfer',
  EXPORT: 'export',
};

// ─── M-Pesa ───────────────────────────────────────────────────
export const MPESA_TRANSACTION_TYPES = {
  STK_PUSH: 'stk_push',
  PAYBILL: 'paybill',
  B2C: 'b2c',
};

export const MPESA_STATUSES = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
};

// ─── Cache TTLs (seconds) ─────────────────────────────────────
export const CACHE_TTL = {
  SHORT: 300,       // 5 minutes
  MEDIUM: 1800,     // 30 minutes
  LONG: 3600,       // 1 hour
  DAY: 86400,       // 24 hours
};
