import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Users, Target, ShieldAlert, Award, ArrowUpRight,
  UserCheck, DollarSign, BarChart2, CheckCircle2, TrendingUp
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { formatKES } from '../../utils/format';

export default function BranchManagerDashboard() {
  const navigate = useNavigate();

  const branchKPIs = {
    branchName: 'Nairobi Central Headquarters',
    activeMembers: 1420,
    vaultBalance: 12500000,
    vaultLimit: 15000000,
    monthlyDisbursementTarget: 88, // %
    recoveryRate: 99.1,
  };

  const staffPerformance = [
    { name: 'Brian Otieno (Teller)', role: 'Cashier', transactionsCount: 142, volumeKES: 1850000, rating: '98%' },
    { name: 'Peter Kamau (Loan Officer)', role: 'Credit Officer', applicationsProcessed: 38, disbursedKES: 14200000, rating: '95%' },
    { name: 'Mary Wambui (Loan Officer)', role: 'Credit Officer', applicationsProcessed: 32, disbursedKES: 11800000, rating: '94%' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-950 via-cyan-900 to-slate-900 p-6 rounded-2xl text-white shadow-xl flex justify-between items-center border border-cyan-800/40">
        <div>
          <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-bold uppercase rounded-full">
            Branch Operations Control
          </span>
          <h1 className="text-3xl font-extrabold mt-2">{branchKPIs.branchName}</h1>
          <p className="text-cyan-100 text-sm mt-1">
            Branch operational performance, staff efficiency matrix, vault cash monitoring, and target execution.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/enterprise/approvals')}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow transition"
          >
            Branch Approvals Desk
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-cyan-100 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-xs text-slate-500 font-extrabold uppercase">
            <span>Branch Active Members</span>
            <Users className="w-4 h-4 text-cyan-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{branchKPIs.activeMembers?.toLocaleString()}</p>
          <p className="text-xs text-emerald-600 font-semibold">+42 new members this month</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-cyan-100 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-xs text-slate-500 font-extrabold uppercase">
            <span>Vault Cash Balance</span>
            <DollarSign className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{formatKES(branchKPIs.vaultBalance)}</p>
          <p className="text-xs text-slate-500 font-semibold">Limit: {formatKES(branchKPIs.vaultLimit)}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-cyan-100 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-xs text-slate-500 font-extrabold uppercase">
            <span>Monthly Target Execution</span>
            <Target className="w-4 h-4 text-cyan-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{branchKPIs.monthlyDisbursementTarget}%</p>
          <p className="text-xs text-cyan-600 font-semibold">On track to meet goal</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-cyan-100 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-xs text-slate-500 font-extrabold uppercase">
            <span>Branch Loan Recovery Rate</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{branchKPIs.recoveryRate}%</p>
          <p className="text-xs text-emerald-600 font-semibold">Top performing branch</p>
        </div>
      </div>

      {/* Staff Performance Matrix Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-md font-bold text-slate-800 border-b pb-3 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-cyan-600" /> Branch Staff Operational Performance Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-extrabold uppercase text-slate-500 bg-slate-50">
                <th className="p-3">Staff Name</th>
                <th className="p-3">Role</th>
                <th className="p-3">Activity Volume</th>
                <th className="p-3">Total Value</th>
                <th className="p-3">Efficiency Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-800">
              {staffPerformance.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">{s.name}</td>
                  <td className="p-3 text-xs text-slate-500 uppercase">{s.role}</td>
                  <td className="p-3">{s.transactionsCount || s.applicationsProcessed} Items</td>
                  <td className="p-3">{formatKES(s.volumeKES || s.disbursedKES)}</td>
                  <td className="p-3">
                    <span className="px-2.5 py-1 rounded text-xs font-extrabold bg-cyan-100 text-cyan-800">
                      {s.rating}
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
