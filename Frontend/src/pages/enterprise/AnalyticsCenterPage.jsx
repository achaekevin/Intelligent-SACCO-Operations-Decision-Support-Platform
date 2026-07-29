import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Award, Building2, Users, PieChart, ArrowUpRight } from 'lucide-react';
import { fetchAnalyticsOverview } from '../../services/enterpriseApi';

export default function AnalyticsCenterPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchAnalyticsOverview().then(setData);
  }, []);

  if (!data) return <div className="p-6 text-slate-500">Loading analytics matrix...</div>;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 p-6 rounded-2xl text-white shadow-xl flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1 text-sm uppercase">
            <BarChart3 className="w-4 h-4" /> SACCO Intelligence Hub
          </div>
          <h1 className="text-3xl font-extrabold">Executive Analytics Center</h1>
          <p className="text-blue-100 text-sm mt-1">
            Data-driven insights into product performance, branch growth, profitability matrix, and risk exposures.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Loan Products */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-800 border-b pb-3 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" /> Top Performing Loan Products
          </h2>
          <div className="space-y-3">
            {data.topLoanProducts?.map((p, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{p.name}</h4>
                  <p className="text-xs text-slate-500 font-semibold">{p.activeCount} Active Loans</p>
                </div>
                <div className="text-right">
                  <p className="text-md font-black text-indigo-700">KES {p.totalDisbursedKES?.toLocaleString()}</p>
                  <p className="text-xs text-emerald-600 font-semibold">Default: {p.defaultRate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fastest Growing Branches */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-800 border-b pb-3 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" /> Fastest Growing Branches
          </h2>
          <div className="space-y-3">
            {data.fastestGrowingBranches?.map((b, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{b.name}</h4>
                  <p className="text-xs text-slate-500 font-semibold">{b.newLoansCount} New Loans Originated</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-black text-xs rounded-full">
                    {b.memberGrowthPct} Growth
                  </span>
                  <p className="text-xs text-slate-500 mt-1">Net Savings: KES {b.netSavingsDepositKES?.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
