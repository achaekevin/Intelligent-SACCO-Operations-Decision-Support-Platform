import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet, DollarSign, ArrowUpRight, ArrowDownLeft, FileText,
  PieChart as PieIcon, RefreshCw, BarChart3, Landmark, CheckCircle2, AlertCircle
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';
import { formatKES, formatDate } from '../../utils/format';

export default function AccountantDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const cashMetrics = {
    totalCashPosition: 48500000,
    monthlyNetProfit: 4390000,
    operatingExpenses: 2150000,
    liquidityRatio: 28.5,
    cashInBank: 34000000,
    vaultCash: 14500000,
  };

  const cashFlowTrend = [
    { month: 'Jan', Income: 4850000, Expenses: 1800000, Profit: 3050000 },
    { month: 'Feb', Income: 5200000, Expenses: 1900000, Profit: 3300000 },
    { month: 'Mar', Income: 5520000, Expenses: 1950000, Profit: 3570000 },
    { month: 'Apr', Income: 5900000, Expenses: 2000000, Profit: 3900000 },
    { month: 'May', Income: 6150000, Expenses: 2050000, Profit: 4100000 },
    { month: 'Jun', Income: 6490000, Expenses: 2100000, Profit: 4390000 },
  ];

  const recentJournals = [
    { id: 'JNL-901', date: '2026-07-28', description: 'Monthly Savings Interest Posting', amount: 1240500, type: 'DEBIT_EXPENSE' },
    { id: 'JNL-902', date: '2026-07-28', description: 'Loan Origination Processing Fee Income', amount: 385000, type: 'CREDIT_INCOME' },
    { id: 'JNL-903', date: '2026-07-27', description: 'Branch Server & IT Infrastructure Maintenance', amount: 85000, type: 'DEBIT_EXPENSE' },
    { id: 'JNL-904', date: '2026-07-27', description: 'Development Loan Principal Interest Repayment', amount: 850000, type: 'CREDIT_INCOME' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 p-6 rounded-2xl text-white shadow-xl flex justify-between items-center border border-indigo-800/40">
        <div>
          <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-bold uppercase rounded-full">
            Financial & Accounting Desk
          </span>
          <h1 className="text-3xl font-extrabold mt-2">Accountant Financial Control Dashboard</h1>
          <p className="text-indigo-200 text-sm mt-1">
            Cash position monitoring, general ledger journals, liquidity ratios, and revenue analysis.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/accounting/journals')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow transition"
          >
            Manage Journals
          </button>
          <button
            onClick={() => navigate('/accounting/trial-balance')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-indigo-500/30 text-indigo-200 font-bold text-xs rounded-xl shadow transition"
          >
            Trial Balance
          </button>
        </div>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-xs text-slate-500 font-extrabold uppercase">
            <span>Total Cash Position</span>
            <Wallet className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{formatKES(cashMetrics.totalCashPosition)}</p>
          <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Bank: {formatKES(cashMetrics.cashInBank)}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-xs text-slate-500 font-extrabold uppercase">
            <span>Monthly Net Profit</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{formatKES(cashMetrics.monthlyNetProfit)}</p>
          <p className="text-xs text-emerald-600 font-semibold">+12.4% vs last month</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-xs text-slate-500 font-extrabold uppercase">
            <span>Operating Expenses</span>
            <ArrowDownLeft className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{formatKES(cashMetrics.operatingExpenses)}</p>
          <p className="text-xs text-slate-500 font-semibold">Budget utilization: 72%</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-xs text-slate-500 font-extrabold uppercase">
            <span>Liquidity Ratio</span>
            <Landmark className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{cashMetrics.liquidityRatio}%</p>
          <p className="text-xs text-indigo-600 font-semibold">Statutory floor >= 20.0%</p>
        </div>
      </div>

      {/* Cash Flow Chart & Journal Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-md font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" /> Income vs Expenses Monthly Performance
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatKES(value)} />
                <Area type="monotone" dataKey="Income" stroke="#4f46e5" fill="#e0e7ff" fillOpacity={0.6} />
                <Area type="monotone" dataKey="Expenses" stroke="#f43f5e" fill="#ffe4e6" fillOpacity={0.4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ledger Summary Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-md font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" /> Recent General Ledger Postings
          </h3>
          <div className="space-y-3">
            {recentJournals.map((j) => (
              <div key={j.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono text-slate-400">{j.id}</span>
                  <span className={`font-bold ${j.type.includes('INCOME') ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {j.type.includes('INCOME') ? '+' : '-'}{formatKES(j.amount)}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-800">{j.description}</p>
                <p className="text-[10px] text-slate-400">{j.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
