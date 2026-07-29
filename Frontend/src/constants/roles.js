export const ROLES = {
  SACCO_ADMIN: 'sacco_admin',
  LOAN_OFFICER: 'loan_officer',
  TELLER: 'teller',
  AUDITOR: 'auditor',
  MEMBER: 'member',
}

export const ADMIN_ROLE_VARIANTS = ['sacco_admin', 'admin', 'system_admin', 'super_admin', 'SYSTEM_ADMIN', 'ADMIN']

export const ROLE_LABELS = {
  [ROLES.SACCO_ADMIN]: 'SACCO Administrator',
  [ROLES.LOAN_OFFICER]: 'Loan Officer',
  [ROLES.TELLER]: 'Teller / Cashier',
  [ROLES.AUDITOR]: 'Auditor',
  [ROLES.MEMBER]: 'Member',
}

// Roles allowed to use the staff dashboard
export const STAFF_ROLES = [...ADMIN_ROLE_VARIANTS, ROLES.LOAN_OFFICER, ROLES.TELLER, ROLES.AUDITOR, 'cashier', 'credit_officer', 'accountant', 'branch_manager']

// Per-route role gating
export const ROUTE_ACCESS = {
  dashboard: STAFF_ROLES,
  members: [...ADMIN_ROLE_VARIANTS, ROLES.LOAN_OFFICER, ROLES.TELLER, 'cashier'],
  branches: ADMIN_ROLE_VARIANTS,
  loans: [...ADMIN_ROLE_VARIANTS, ROLES.LOAN_OFFICER, 'credit_officer'],
  savings: [...ADMIN_ROLE_VARIANTS, ROLES.TELLER, 'cashier'],
  transactions: [...ADMIN_ROLE_VARIANTS, ROLES.TELLER, 'cashier'],
  accounting: [...ADMIN_ROLE_VARIANTS, ROLES.AUDITOR, 'accountant', 'finance_manager'],
  reports: STAFF_ROLES,
  notifications: STAFF_ROLES,
  audit: [...ADMIN_ROLE_VARIANTS, ROLES.AUDITOR],
  settings: ADMIN_ROLE_VARIANTS,
  profile: STAFF_ROLES,
}
