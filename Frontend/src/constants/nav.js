import {
  LayoutDashboard, Users, Landmark, Banknote, HandCoins, ShieldCheck,
  ArrowLeftRight, Calculator, FileBarChart, Bell, ScrollText, Settings, UserCircle,
} from 'lucide-react'
import { ROLES } from './roles'

export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, key: 'dashboard' },
  { label: 'Loan Eligibility Engine', path: '/enterprise/eligibility', icon: Calculator, key: 'dashboard' },
  { label: 'Central Approval Center', path: '/enterprise/approvals', icon: ShieldCheck, key: 'dashboard' },
  { label: 'Financial Health', path: '/enterprise/financial-health', icon: FileBarChart, key: 'dashboard' },
  { label: 'Workflow Engine', path: '/enterprise/workflows', icon: ScrollText, key: 'dashboard' },
  { label: 'Rule Engine', path: '/enterprise/rules', icon: Settings, key: 'dashboard' },
  { label: 'Digital Documents', path: '/enterprise/documents', icon: ScrollText, key: 'dashboard' },
  { label: 'Smart Alerts', path: '/enterprise/smart-alerts', icon: Bell, key: 'dashboard' },
  { label: 'Fraud Detection', path: '/enterprise/fraud-monitoring', icon: ShieldCheck, key: 'dashboard' },
  { label: 'Product Builder', path: '/enterprise/product-builder', icon: Landmark, key: 'dashboard' },
  { label: 'Process Automation', path: '/enterprise/automation', icon: Settings, key: 'dashboard' },
  { label: 'Internal Messaging', path: '/enterprise/messaging', icon: Bell, key: 'dashboard' },
  { label: 'Analytics Center', path: '/enterprise/analytics', icon: FileBarChart, key: 'dashboard' },
  { label: 'Members', path: '/members', icon: Users, key: 'members' },
  { label: 'Savings', path: '/savings', icon: Banknote, key: 'savings' },
  { label: 'Loans', path: '/loans', icon: HandCoins, key: 'loans' },
  { label: 'Guarantors', path: '/loans/guarantors', icon: ShieldCheck, key: 'loans' },
  { label: 'Transactions', path: '/transactions', icon: ArrowLeftRight, key: 'transactions' },
  { label: 'Accounting', path: '/accounting', icon: Calculator, key: 'accounting' },
  { label: 'Reports', path: '/reports', icon: FileBarChart, key: 'reports' },
  { label: 'Branches', path: '/branches', icon: Landmark, key: 'branches' },
  { label: 'Notifications', path: '/notifications', icon: Bell, key: 'notifications' },
  { label: 'Audit Logs', path: '/audit', icon: ScrollText, key: 'audit' },
  { label: 'Settings', path: '/settings', icon: Settings, key: 'settings' },
  { label: 'Profile', path: '/profile', icon: UserCircle, key: 'profile' },
]

export const MEMBER_NAV_ITEMS = [
  { label: 'Overview', path: '/portal', icon: LayoutDashboard },
  { label: 'Savings', path: '/portal/savings', icon: Banknote },
  { label: 'Loans', path: '/portal/loans', icon: HandCoins },
  { label: 'Transactions', path: '/portal/transactions', icon: ArrowLeftRight },
  { label: 'Statements', path: '/portal/statements', icon: FileBarChart },
  { label: 'Notifications', path: '/portal/notifications', icon: Bell },
  { label: 'Profile', path: '/portal/profile', icon: UserCircle },
]

export { ROLES }
