import { ROLES } from '../constants/roles'

export const BRANCHES = [
  { id: 'BR-001', name: 'Nairobi CBD', manager: 'Grace Wanjiru', members: 4820, savings: 182400000, activeLoans: 311, revenue: 9870000, location: 'Nairobi' },
  { id: 'BR-002', name: 'Mombasa Branch', manager: 'Omar Hassan', members: 2310, savings: 91200000, activeLoans: 154, revenue: 4120000, location: 'Mombasa' },
  { id: 'BR-003', name: 'Kisumu Branch', manager: 'Brenda Atieno', members: 1890, savings: 64300000, activeLoans: 122, revenue: 2870000, location: 'Kisumu' },
  { id: 'BR-004', name: 'Nakuru Branch', manager: 'Peter Kimani', members: 1540, savings: 51900000, activeLoans: 98, revenue: 2210000, location: 'Nakuru' },
  { id: 'BR-005', name: 'Eldoret Branch', manager: 'Faith Chebet', members: 1120, savings: 38700000, activeLoans: 76, revenue: 1640000, location: 'Eldoret' },
]

const FIRST = ['John', 'Mary', 'Peter', 'Grace', 'James', 'Faith', 'Brian', 'Esther', 'Samuel', 'Lucy', 'David', 'Ann', 'Kevin', 'Joy', 'Daniel', 'Mercy', 'Patrick', 'Nancy', 'Joseph', 'Caroline']
const LAST = ['Mwangi', 'Otieno', 'Wanjiru', 'Kiptoo', 'Achieng', 'Njoroge', 'Wafula', 'Kamau', 'Cherono', 'Mutua', 'Wambui', 'Odhiambo', 'Kemboi', 'Akinyi', 'Maina']

const seedRand = (seed) => {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}
const rand = seedRand(42)
const pick = (arr) => arr[Math.floor(rand() * arr.length)]

export const MEMBERS = Array.from({ length: 48 }).map((_, i) => {
  const name = `${pick(FIRST)} ${pick(LAST)}`
  const branch = pick(BRANCHES)
  const statuses = ['Active', 'Active', 'Active', 'Dormant', 'Pending']
  return {
    id: `MB-${String(1000 + i)}`,
    memberNo: `AM${String(20231 + i)}`,
    name,
    email: `${name.toLowerCase().replace(' ', '.')}@mail.com`,
    phone: `+2547${Math.floor(10000000 + rand() * 89999999)}`,
    branch: branch.name,
    idNumber: `${Math.floor(20000000 + rand() * 9999999)}`,
    joinDate: `202${Math.floor(rand() * 5)}-0${Math.floor(1 + rand() * 9)}-${Math.floor(10 + rand() * 18)}`,
    status: pick(statuses),
    savings: Math.floor(15000 + rand() * 480000),
    shareCapital: Math.floor(5000 + rand() * 50000),
    activeLoans: Math.floor(rand() * 3),
    avatar: null,
    nextOfKin: `${pick(FIRST)} ${pick(LAST)}`,
    beneficiary: `${pick(FIRST)} ${pick(LAST)}`,
  }
})

export const LOAN_TYPES = [
  { id: 'LT-1', name: 'Development Loan', interestRate: 12, maxAmount: 2000000, maxTermMonths: 48 },
  { id: 'LT-2', name: 'Emergency Loan', interestRate: 10, maxAmount: 200000, maxTermMonths: 12 },
  { id: 'LT-3', name: 'School Fees Loan', interestRate: 8, maxAmount: 500000, maxTermMonths: 24 },
  { id: 'LT-4', name: 'Asset Finance Loan', interestRate: 14, maxAmount: 3000000, maxTermMonths: 60 },
  { id: 'LT-5', name: 'Salary Advance', interestRate: 6, maxAmount: 100000, maxTermMonths: 6 },
]

const LOAN_STATUSES = ['Pending', 'Approved', 'Active', 'Rejected', 'Completed', 'Defaulted']

export const LOANS = Array.from({ length: 40 }).map((_, i) => {
  const member = pick(MEMBERS)
  const type = pick(LOAN_TYPES)
  const status = pick(LOAN_STATUSES)
  const principal = Math.floor(20000 + rand() * (type.maxAmount - 20000))
  return {
    id: `LN-${String(5000 + i)}`,
    member: member.name,
    memberNo: member.memberNo,
    branch: member.branch,
    type: type.name,
    principal,
    interestRate: type.interestRate,
    termMonths: Math.max(3, Math.floor(rand() * type.maxTermMonths)),
    status,
    applicationDate: `2026-0${Math.floor(1 + rand() * 6)}-${Math.floor(1 + rand() * 27)}`,
    guarantors: Math.floor(1 + rand() * 3),
    balance: status === 'Completed' ? 0 : Math.floor(principal * (0.2 + rand() * 0.8)),
  }
})

export const TRANSACTIONS = Array.from({ length: 60 }).map((_, i) => {
  const member = pick(MEMBERS)
  const types = ['Deposit', 'Withdrawal', 'Loan Disbursement', 'Loan Repayment', 'Transfer', 'Reversal']
  const type = pick(types)
  return {
    id: `TX-${String(90000 + i)}`,
    member: member.name,
    memberNo: member.memberNo,
    branch: member.branch,
    type,
    amount: Math.floor(500 + rand() * 95000),
    date: `2026-06-${String(Math.floor(1 + rand() * 19)).padStart(2, '0')}`,
    channel: pick(['Cash', 'M-Pesa', 'Bank Transfer', 'Cheque']),
    status: pick(['Completed', 'Completed', 'Completed', 'Pending', 'Failed']),
    teller: pick(['Alice Njeri', 'Kevin Otieno', 'Sarah Wambui']),
  }
})

export const SAVINGS_GROWTH = [
  { month: 'Jan', savings: 312, shareCapital: 84 },
  { month: 'Feb', savings: 328, shareCapital: 88 },
  { month: 'Mar', savings: 341, shareCapital: 91 },
  { month: 'Apr', savings: 355, shareCapital: 97 },
  { month: 'May', savings: 379, shareCapital: 101 },
  { month: 'Jun', savings: 408, shareCapital: 109 },
]

export const MONTHLY_INCOME = [
  { month: 'Jan', interest: 18.2, fees: 4.1 },
  { month: 'Feb', interest: 19.4, fees: 3.8 },
  { month: 'Mar', interest: 20.1, fees: 4.4 },
  { month: 'Apr', interest: 21.6, fees: 4.0 },
  { month: 'May', interest: 22.8, fees: 4.7 },
  { month: 'Jun', interest: 24.3, fees: 5.1 },
]

export const LOAN_REPAYMENT_TREND = [
  { month: 'Jan', onTime: 82, late: 13, defaulted: 5 },
  { month: 'Feb', onTime: 84, late: 11, defaulted: 5 },
  { month: 'Mar', onTime: 85, late: 11, defaulted: 4 },
  { month: 'Apr', onTime: 87, late: 9, defaulted: 4 },
  { month: 'May', onTime: 88, late: 9, defaulted: 3 },
  { month: 'Jun', onTime: 90, late: 7, defaulted: 3 },
]

export const BRANCH_PERFORMANCE = BRANCHES.map((b) => ({
  name: b.name.replace(' Branch', '').replace(' CBD', ''),
  revenue: Math.round(b.revenue / 100000) / 10,
}))

export const MEMBER_GROWTH = [
  { month: 'Jan', members: 9820 },
  { month: 'Feb', members: 10120 },
  { month: 'Mar', members: 10410 },
  { month: 'Apr', members: 10780 },
  { month: 'May', members: 11240 },
  { month: 'Jun', members: 11680 },
]

export const LOAN_STATUS_BREAKDOWN = [
  { name: 'Active', value: LOANS.filter((l) => l.status === 'Active').length, color: '#0B4F4A' },
  { name: 'Pending', value: LOANS.filter((l) => l.status === 'Pending').length, color: '#D9A441' },
  { name: 'Approved', value: LOANS.filter((l) => l.status === 'Approved').length, color: '#3B6FA0' },
  { name: 'Completed', value: LOANS.filter((l) => l.status === 'Completed').length, color: '#3F8F5F' },
  { name: 'Rejected', value: LOANS.filter((l) => l.status === 'Rejected').length, color: '#C24A3D' },
  { name: 'Defaulted', value: LOANS.filter((l) => l.status === 'Defaulted').length, color: '#76561A' },
]

export const DASHBOARD_STATS = {
  totalMembers: 11680,
  totalSavings: 428600000,
  activeLoans: LOANS.filter((l) => l.status === 'Active').length * 38,
  pendingLoans: LOANS.filter((l) => l.status === 'Pending').length * 12,
  totalDeposits: 38900000,
  monthlyIncome: 24300000,
  totalBranches: BRANCHES.length,
  loanDefaults: 3.2,
}

export const NOTIFICATIONS = Array.from({ length: 14 }).map((_, i) => ({
  id: `NT-${i}`,
  title: pick([
    'Loan application submitted', 'Deposit received', 'Withdrawal request pending approval',
    'Loan repayment overdue', 'New member registered', 'Statement generated', 'Guarantor request received',
  ]),
  body: 'Tap to view full details of this notification.',
  date: `2026-06-${String(Math.floor(1 + rand() * 19)).padStart(2, '0')}`,
  read: rand() > 0.5,
  channel: pick(['System', 'SMS', 'Email']),
}))

export const AUDIT_LOGS = Array.from({ length: 30 }).map((_, i) => ({
  id: `AU-${i}`,
  user: pick(['Grace Wanjiru', 'Brian Otieno', 'Faith Chebet', 'System Admin', 'Peter Kimani']),
  action: pick(['Login', 'Approved Loan', 'Created Member', 'Edited Branch', 'Rejected Withdrawal', 'Exported Report', 'Changed Settings']),
  date: `2026-06-${String(Math.floor(1 + rand() * 19)).padStart(2, '0')} ${String(Math.floor(rand() * 23)).padStart(2, '0')}:${String(Math.floor(rand() * 59)).padStart(2, '0')}`,
  ip: `41.90.${Math.floor(rand() * 255)}.${Math.floor(rand() * 255)}`,
  status: pick(['Success', 'Success', 'Success', 'Failed']),
}))

export const MOCK_USERS = [
  { id: 'U-1', name: 'Grace Wanjiru', email: 'admin@amanasacco.co.ke', password: 'password', role: ROLES.SACCO_ADMIN, branch: 'Nairobi CBD' },
  { id: 'U-2', name: 'Brian Otieno', email: 'loans@amanasacco.co.ke', password: 'password', role: ROLES.LOAN_OFFICER, branch: 'Nairobi CBD' },
  { id: 'U-3', name: 'Faith Chebet', email: 'teller@amanasacco.co.ke', password: 'password', role: ROLES.TELLER, branch: 'Eldoret Branch' },
  { id: 'U-4', name: 'John Mwangi', email: 'member@amanasacco.co.ke', password: 'password', role: ROLES.MEMBER, branch: 'Nairobi CBD', memberNo: 'AM20231' },
  { id: 'U-5', name: 'System Auditor', email: 'auditor@amanasacco.co.ke', password: 'password', role: ROLES.AUDITOR, branch: 'Nairobi CBD' },
]
