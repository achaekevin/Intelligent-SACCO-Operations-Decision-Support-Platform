import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './routes/ProtectedRoute'
import { ROUTE_ACCESS } from './constants/roles'

// Layouts
import AuthLayout from './layouts/AuthLayout'
import DashboardLayout from './layouts/DashboardLayout'
import MemberLayout from './layouts/MemberLayout'

// Auth pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import MemberRegister from './pages/auth/MemberRegister'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import VerifyEmail from './pages/auth/VerifyEmail'
import ChangePassword from './pages/auth/ChangePassword'

// Dashboard
import Dashboard from './pages/dashboard/Dashboard'

// Members
import MemberList from './pages/members/MemberList'
import RegisterMember from './pages/members/RegisterMember'
import ViewMember from './pages/members/ViewMember'
import EditMember from './pages/members/EditMember'

// Branches
import BranchList from './pages/branches/BranchList'
import CreateBranch from './pages/branches/CreateBranch'
import EditBranch from './pages/branches/EditBranch'
import BranchDetails from './pages/branches/BranchDetails'

// Savings
import SavingsAccounts from './pages/savings/SavingsAccounts'
import AccountDetails from './pages/savings/AccountDetails'
import Deposits from './pages/savings/Deposits'
import Withdrawals from './pages/savings/Withdrawals'
import FixedDeposits from './pages/savings/FixedDeposits'
import ShareCapital from './pages/savings/ShareCapital'

// Loans
import LoanList from './pages/loans/LoanList'
import LoanApplication from './pages/loans/LoanApplication'
import LoanDetail from './pages/loans/LoanDetail'
import GuarantorList from './pages/loans/GuarantorList'

// Transactions
import TransactionList from './pages/transactions/TransactionList'

// Accounting
import ChartOfAccounts from './pages/accounting/ChartOfAccounts'
import Journals from './pages/accounting/Journals'
import Ledgers from './pages/accounting/Ledgers'
import IncomeExpenses from './pages/accounting/IncomeExpenses'
import TrialBalance from './pages/accounting/TrialBalance'
import ProfitAndLoss from './pages/accounting/ProfitAndLoss'
import BalanceSheet from './pages/accounting/BalanceSheet'

// Reports
import ReportsHub from './pages/reports/ReportsHub'

// Notifications
import Notifications from './pages/notifications/Notifications'

// Audit
import AuditLogs from './pages/audit/AuditLogs'

// Settings
import GeneralSettings from './pages/settings/GeneralSettings'
import LoanSettings from './pages/settings/LoanSettings'
import SavingsSettings from './pages/settings/SavingsSettings'
import InterestRates from './pages/settings/InterestRates'
import BranchSettings from './pages/settings/BranchSettings'
import NotificationSettings from './pages/settings/NotificationSettings'

// Profile
import Profile from './pages/profile/Profile'

// Teller
import TellerPerformance from './pages/teller/Performance'

// Member portal
import MemberOverview from './pages/member-portal/MemberOverview'
import MemberSavings from './pages/member-portal/MemberSavings'
import MemberLoans from './pages/member-portal/MemberLoans'
import MemberTransactions from './pages/member-portal/MemberTransactions'
import MemberStatements from './pages/member-portal/MemberStatements'

// Misc
import NotFound from './pages/NotFound'
import Unauthorized from './pages/Unauthorized'

function App() {
  return (
    <Routes>
      {/* Auth */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/join-member" element={<MemberRegister />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
      </Route>

      {/* Staff dashboard */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/members" element={<ProtectedRoute allowedRoles={ROUTE_ACCESS.members}><MemberList /></ProtectedRoute>} />
        <Route path="/members/register" element={<ProtectedRoute allowedRoles={ROUTE_ACCESS.members}><RegisterMember /></ProtectedRoute>} />
        <Route path="/members/:id" element={<ProtectedRoute allowedRoles={ROUTE_ACCESS.members}><ViewMember /></ProtectedRoute>} />
        <Route path="/members/:id/edit" element={<ProtectedRoute allowedRoles={ROUTE_ACCESS.members}><EditMember /></ProtectedRoute>} />

        <Route path="/branches" element={<ProtectedRoute allowedRoles={ROUTE_ACCESS.branches}><BranchList /></ProtectedRoute>} />
        <Route path="/branches/create" element={<ProtectedRoute allowedRoles={ROUTE_ACCESS.branches}><CreateBranch /></ProtectedRoute>} />
        <Route path="/branches/:id" element={<ProtectedRoute allowedRoles={ROUTE_ACCESS.branches}><BranchDetails /></ProtectedRoute>} />
        <Route path="/branches/:id/edit" element={<ProtectedRoute allowedRoles={ROUTE_ACCESS.branches}><EditBranch /></ProtectedRoute>} />

        <Route path="/savings" element={<ProtectedRoute allowedRoles={ROUTE_ACCESS.savings}><SavingsAccounts /></ProtectedRoute>} />
        <Route path="/savings/accounts/:id" element={<ProtectedRoute allowedRoles={ROUTE_ACCESS.savings}><AccountDetails /></ProtectedRoute>} />
        <Route path="/savings/deposits" element={<ProtectedRoute allowedRoles={ROUTE_ACCESS.savings}><Deposits /></ProtectedRoute>} />
        <Route path="/savings/withdrawals" element={<ProtectedRoute allowedRoles={ROUTE_ACCESS.savings}><Withdrawals /></ProtectedRoute>} />
        <Route path="/savings/fixed-deposits" element={<ProtectedRoute allowedRoles={ROUTE_ACCESS.savings}><FixedDeposits /></ProtectedRoute>} />
        <Route path="/savings/share-capital" element={<ProtectedRoute allowedRoles={ROUTE_ACCESS.savings}><ShareCapital /></ProtectedRoute>} />

        <Route path="/loans" element={<ProtectedRoute allowedRoles={ROUTE_ACCESS.loans}><LoanList /></ProtectedRoute>} />
        <Route path="/loans/apply" element={<ProtectedRoute allowedRoles={ROUTE_ACCESS.loans}><LoanApplication /></ProtectedRoute>} />
        <Route path="/loans/guarantors" element={<ProtectedRoute allowedRoles={ROUTE_ACCESS.loans}><GuarantorList /></ProtectedRoute>} />
        <Route path="/loans/:id" element={<ProtectedRoute allowedRoles={ROUTE_ACCESS.loans}><LoanDetail /></ProtectedRoute>} />

        <Route path="/transactions" element={<ProtectedRoute allowedRoles={ROUTE_ACCESS.transactions}><TransactionList /></ProtectedRoute>} />

        <Route path="/accounting" element={<ProtectedRoute allowedRoles={ROUTE_ACCESS.accounting}><ChartOfAccounts /></ProtectedRoute>} />
        <Route path="/accounting/journals" element={<ProtectedRoute allowedRoles={ROUTE_ACCESS.accounting}><Journals /></ProtectedRoute>} />
        <Route path="/accounting/ledgers" element={<ProtectedRoute allowedRoles={ROUTE_ACCESS.accounting}><Ledgers /></ProtectedRoute>} />
        <Route path="/accounting/income-expenses" element={<ProtectedRoute allowedRoles={ROUTE_ACCESS.accounting}><IncomeExpenses /></ProtectedRoute>} />
        <Route path="/accounting/trial-balance" element={<ProtectedRoute allowedRoles={ROUTE_ACCESS.accounting}><TrialBalance /></ProtectedRoute>} />
        <Route path="/accounting/profit-and-loss" element={<ProtectedRoute allowedRoles={ROUTE_ACCESS.accounting}><ProfitAndLoss /></ProtectedRoute>} />
        <Route path="/accounting/balance-sheet" element={<ProtectedRoute allowedRoles={ROUTE_ACCESS.accounting}><BalanceSheet /></ProtectedRoute>} />

        <Route path="/reports" element={<ProtectedRoute allowedRoles={ROUTE_ACCESS.reports}><ReportsHub /></ProtectedRoute>} />

        <Route path="/notifications" element={<Notifications />} />

        <Route path="/audit" element={<ProtectedRoute allowedRoles={ROUTE_ACCESS.audit}><AuditLogs /></ProtectedRoute>} />

        <Route path="/settings" element={<ProtectedRoute allowedRoles={ROUTE_ACCESS.settings}><GeneralSettings /></ProtectedRoute>} />
        <Route path="/settings/loans" element={<ProtectedRoute allowedRoles={ROUTE_ACCESS.settings}><LoanSettings /></ProtectedRoute>} />
        <Route path="/settings/savings" element={<ProtectedRoute allowedRoles={ROUTE_ACCESS.settings}><SavingsSettings /></ProtectedRoute>} />
        <Route path="/settings/interest-rates" element={<ProtectedRoute allowedRoles={ROUTE_ACCESS.settings}><InterestRates /></ProtectedRoute>} />
        <Route path="/settings/branches" element={<ProtectedRoute allowedRoles={ROUTE_ACCESS.settings}><BranchSettings /></ProtectedRoute>} />
        <Route path="/settings/notifications" element={<ProtectedRoute allowedRoles={ROUTE_ACCESS.settings}><NotificationSettings /></ProtectedRoute>} />

        <Route path="/teller/performance" element={<ProtectedRoute allowedRoles={['cashier', 'sacco_admin']}><TellerPerformance /></ProtectedRoute>} />

        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/change-password" element={<ChangePassword />} />
      </Route>

      {/* Member portal */}
      <Route
        element={
          <ProtectedRoute>
            <MemberLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/portal" element={<MemberOverview />} />
        <Route path="/portal/savings" element={<MemberSavings />} />
        <Route path="/portal/loans" element={<MemberLoans />} />
        <Route path="/portal/transactions" element={<MemberTransactions />} />
        <Route path="/portal/statements" element={<MemberStatements />} />
        <Route path="/portal/notifications" element={<Notifications />} />
        <Route path="/portal/profile" element={<Profile />} />
      </Route>

      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
