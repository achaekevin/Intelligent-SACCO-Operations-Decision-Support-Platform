# Amana SACCO — Management System (Frontend)

A modern, responsive frontend for a Kenyan SACCO management platform, built with React, Vite, Tailwind CSS, Material UI, Redux Toolkit, React Hook Form + Yup, Recharts, and React Toastify.

## What's fully built

- **Auth**: Login, Forgot Password, Reset Password, Change Password — JWT-style mock auth, remember me, protected + role-based routes, 20-minute inactivity session timeout.
- **Dashboard**: stat cards, savings/income/repayment/branch/member charts, recent transactions table, loading skeletons.
- **Members**: list (search/sort/pagination/export), register (multi-section form), view (profile + loans + transactions), edit.
- **Loans**: applications list with inline approve/reject, multi-step application form (loan details → guarantors → review) with live EMI calculator, loan detail page with generated repayment schedule, guarantor liability tracking.
- **Branches, Notifications, Audit Logs**: fully working list/detail pages wired to mock data.
- **Profile / Settings**: profile editing, change password.
- **Member Portal**: separate layout with overview, savings, loans, transactions, statements, notifications, profile.
- **Reusable components**: DataTable (search, sort, pagination, Excel/PDF export), StatCard, ChartCard, Badge, Modal, ConfirmDialog, Skeletons, EmptyState, form fields, Sidebar (collapsible + mobile), Navbar (dark mode, notifications, profile menu).
- **Dark/light mode** via Tailwind `class` strategy, persisted to localStorage.

## What's scaffolded as stubs

Savings (accounts/deposits/withdrawals/fixed deposits/share capital), Transactions list, Accounting (chart of accounts/journals/ledgers/income-expenses/trial balance/P&L/balance sheet), Reports hub, and the remaining Settings pages are routed, sidebar-linked, and role-gated, but render a placeholder (`StubPage`) instead of full content. They follow the exact same patterns as the Members/Loans modules — wire in a `DataTable`/`ChartCard`/form using `src/utils/mockData.js` (or your real API) to flesh them out.

## Getting started

```bash
npm install
cp .env.example .env
npm run dev
```

The app runs entirely on **mock data** (`src/utils/mockData.js`) — no backend required to explore it.

### Demo accounts (password: `password`)

| Role | Email |
|---|---|
| SACCO Administrator | admin@amanasacco.co.ke |
| Loan Officer | loans@amanasacco.co.ke |
| Teller / Cashier | teller@amanasacco.co.ke |
| Auditor | auditor@amanasacco.co.ke |
| Member | member@amanasacco.co.ke |

## Connecting a real backend

1. Set `VITE_API_BASE_URL` in `.env`.
2. `src/services/api.js` is a ready-to-use Axios instance with auth header injection and 401 handling.
3. Replace the mock logic inside `src/redux/slices/*.js` (e.g. `loginUser` in `authSlice.js`) with real `api.get/post/put/delete` calls.
4. Replace imports from `src/utils/mockData.js` in page components with API calls (e.g. via `useEffect` + a slice thunk, or React Query if you add it).

## Project structure

```
src/
├── assets/
├── components/      # common, forms, tables, cards, charts, modals, notifications, sidebar, navbar, loaders
├── layouts/         # DashboardLayout, AuthLayout, MemberLayout
├── pages/           # auth, dashboard, members, branches, loans, savings, transactions,
│                     # accounting, reports, notifications, audit, settings, profile, member-portal
├── routes/          # ProtectedRoute (role-based)
├── services/        # axios instance
├── hooks/           # useAuth, useSessionTimeout
├── redux/           # store + slices (auth, ui, members, loans, notifications)
├── utils/           # format helpers, mockData
└── constants/        # roles, nav, route access map
```

## Roles

Super Admin, SACCO Administrator, Branch Manager, Loan Officer, Accountant, Teller/Cashier, Auditor, Member — each gated per-route via `src/constants/roles.js` (`ROUTE_ACCESS`). Members are automatically routed to `/portal` instead of the staff dashboard.

## Notes

- No network access was available while generating this project, so dependencies were **not** installed — run `npm install` locally.
- Tailwind theme tokens (teal/gold/ink palette, `Sora`/`Inter` fonts) live in `tailwind.config.js`.
- Export-to-Excel/PDF uses `xlsx` and `jspdf` + `jspdf-autotable`, wired into the shared `DataTable` component.
