export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  SACCO_ADMIN: 'sacco_admin',
  BRANCH_MANAGER: 'branch_manager',
  LOAN_OFFICER: 'loan_officer',
  ACCOUNTANT: 'accountant',
  TELLER: 'teller',
  AUDITOR: 'auditor',
  MEMBER: 'member',
}

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.SACCO_ADMIN]: 'SACCO Administrator',
  [ROLES.BRANCH_MANAGER]: 'Branch Manager',
  [ROLES.LOAN_OFFICER]: 'Loan Officer',
  [ROLES.ACCOUNTANT]: 'Accountant',
  [ROLES.TELLER]: 'Teller / Cashier',
  [ROLES.AUDITOR]: 'Auditor',
  [ROLES.MEMBER]: 'Member',
}

// Roles allowed to use the staff dashboard (everyone except Member, who gets the Member Portal)
export const STAFF_ROLES = Object.values(ROLES).filter((r) => r !== ROLES.MEMBER)

// Simple per-route role gating. '*' = any authenticated staff role.
export const ROUTE_ACCESS = {
  dashboard: STAFF_ROLES,
  members: [ROLES.SUPER_ADMIN, ROLES.SACCO_ADMIN, ROLES.BRANCH_MANAGER, ROLES.LOAN_OFFICER, ROLES.TELLER],
  branches: [ROLES.SUPER_ADMIN, ROLES.SACCO_ADMIN],
  loans: [ROLES.SUPER_ADMIN, ROLES.SACCO_ADMIN, ROLES.BRANCH_MANAGER, ROLES.LOAN_OFFICER],
  savings: [ROLES.SUPER_ADMIN, ROLES.SACCO_ADMIN, ROLES.BRANCH_MANAGER, ROLES.TELLER, ROLES.ACCOUNTANT],
  transactions: [ROLES.SUPER_ADMIN, ROLES.SACCO_ADMIN, ROLES.BRANCH_MANAGER, ROLES.TELLER, ROLES.ACCOUNTANT],
  accounting: [ROLES.SUPER_ADMIN, ROLES.SACCO_ADMIN, ROLES.ACCOUNTANT],
  reports: STAFF_ROLES,
  notifications: STAFF_ROLES,
  audit: [ROLES.SUPER_ADMIN, ROLES.SACCO_ADMIN, ROLES.AUDITOR],
  settings: [ROLES.SUPER_ADMIN, ROLES.SACCO_ADMIN],
  profile: STAFF_ROLES,
}
