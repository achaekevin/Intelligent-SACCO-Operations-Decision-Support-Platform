import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, ShieldCheck, DollarSign, Building2, Users, ArrowUpRight, BarChart3 } from 'lucide-react';
import { fetchFinancialHealth } from '../../services/enterpriseApi';

export default function FinancialHealthPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchFinancialHealth().then(setData);
  }, []);

  if (!data) return <div className="p-6 text-slate-500">Loading financial metrics...</div>;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 p-6 rounded-2xl text-white shadow-xl flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1 text-sm uppercase">
            <Activity className="w-4 h-4" /> Executive Decision-Support Tool
          </div>
          <h1 className="text-3xl font-extrabold">Financial Health & Portfolio Quality Dashboard</h1>
          <p className="text-emerald-100 text-sm mt-1">
            Real-time portfolio indicators, PAR metrics, liquidity ratios, and branch operational performance.
          </p>
        </div>
        <div className="bg-emerald-500/20 border border-emerald-400/30 px-4 py-2 rounded-xl text-right backdrop-blur">
          <p className="text-xs text-emerald-200 uppercase font-semibold">Portfolio Quality Rating</p>
          <p className="text-2xl font-black text-emerald-300">{data.portfolioAtRisk?.portfolioQualityScore}</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-500 font-bold uppercase">
            <span>Portfolio at Risk (PAR &gt; 30)</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">{data.portfolioAtRisk?.par30}%</p>
          <p className="text-xs text-emerald-600 font-semibold">Target &lt; 5.0% (Well Managed)</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-500 font-bold uppercase">
            <span>Loan Recovery Rate</span>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">{data.loanRecoveryRate}%</p>
          <p className="text-xs text-teal-600 font-semibold">+1.2% higher than previous quarter</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-500 font-bold uppercase">
            <span>Liquidity Ratio</span>
            <DollarSign className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">{data.liquidityRatio}%</p>
          <p className="text-xs text-indigo-600 font-semibold">Statutory floor is 20.0%</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-500 font-bold uppercase">
            <span>Member Retention</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">{data.memberRetentionRate}%</p>
          <p className="text-xs text-purple-600 font-semibold">Active monthly retention</p>
        </div>
      </div>

      {/* Branch Performance Matrix */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-800 border-b pb-3 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-emerald-600" /> Branch Operational Performance Matrix
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-extrabold uppercase text-slate-500 bg-slate-50">
                <th className="p-3">Branch Name</th>
                <th className="p-3">Active Loans</th>
                <th className="p-3">Total Savings (KES)</th>
                <th className="p-3">Recovery Rate</th>
                <th className="p-3">Performance Tag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-800">
              {data.branchPerformance?.map((b, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">{b.name}</td>
                  <td className="p-3">{b.activeLoans}</td>
                  <td className="p-3">KES {b.totalSavings?.toLocaleString()}</td>
                  <td className="p-3 text-emerald-600">{b.recoveryRate}%</td>
                  <td className="p-3">
                    <span className="px-2.5 py-1 rounded text-xs font-extrabold bg-emerald-100 text-emerald-800">
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
