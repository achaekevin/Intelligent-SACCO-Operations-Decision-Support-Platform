export const ROLES = {
  SACCO_ADMIN: 'sacco_admin',
  LOAN_OFFICER: 'loan_officer',
  TELLER: 'teller',
  AUDITOR: 'auditor',
  MEMBER: 'member',
}

export const ROLE_LABELS = {
  [ROLES.SACCO_ADMIN]: 'SACCO Administrator',
  [ROLES.LOAN_OFFICER]: 'Loan Officer',
  [ROLES.TELLER]: 'Teller / Cashier',
  [ROLES.AUDITOR]: 'Auditor',
  [ROLES.MEMBER]: 'Member',
}

// Roles allowed to use the staff dashboard (everyone except Member, who gets the Member Portal)
export const STAFF_ROLES = Object.values(ROLES).filter((r) => r !== ROLES.MEMBER)

// Simple per-route role gating. '*' = any authenticated staff role.
export const ROUTE_ACCESS = {
  dashboard: STAFF_ROLES,
  members: [ROLES.SACCO_ADMIN, ROLES.LOAN_OFFICER, ROLES.TELLER],
  branches: [ROLES.SACCO_ADMIN],
  loans: [ROLES.SACCO_ADMIN, ROLES.LOAN_OFFICER],
  savings: [ROLES.SACCO_ADMIN, ROLES.TELLER],
  transactions: [ROLES.SACCO_ADMIN, ROLES.TELLER],
  accounting: [ROLES.SACCO_ADMIN, ROLES.AUDITOR],
  reports: STAFF_ROLES,
  notifications: STAFF_ROLES,
  audit: [ROLES.SACCO_ADMIN, ROLES.AUDITOR],
  settings: [ROLES.SACCO_ADMIN],
  profile: STAFF_ROLES,
}
