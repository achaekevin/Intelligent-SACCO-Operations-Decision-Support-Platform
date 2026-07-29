import React, { useState, useEffect } from 'react';
import { Sliders, ShieldAlert, CheckCircle2, Plus, Play, RefreshCw, AlertTriangle } from 'lucide-react';
import { fetchRules, fetchComplianceSummary } from '../../services/enterpriseApi';

export default function RuleEngineManager() {
  const [rules, setRules] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchRules().then(setRules);
    fetchComplianceSummary().then(setSummary);
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 rounded-2xl text-white shadow-xl flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 text-purple-400 font-semibold mb-1 text-sm uppercase">
            <Sliders className="w-4 h-4" /> Dynamic Policy Rules Engine
          </div>
          <h1 className="text-3xl font-extrabold">Rule Engine & Compliance Dashboard</h1>
          <p className="text-purple-100 text-sm mt-1">
            Define and modify SACCO business rules without developer code changes.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-purple-100 text-purple-700 rounded-xl">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Active Policy Rules</p>
              <p className="text-2xl font-black text-slate-900">{summary.activeRulesCount} / {summary.totalRulesCount}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Policy Compliance Rate</p>
              <p className="text-2xl font-black text-slate-900">99.8%</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Prevented Violations</p>
              <p className="text-2xl font-black text-slate-900">{summary.recentViolationsCount}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Policy Rules Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-800 border-b pb-3">Active Policy Rules Configurator</h2>

        <div className="space-y-4">
          {rules.map((r) => (
            <div key={r.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-2.5 py-0.5 rounded text-xs font-extrabold bg-purple-100 text-purple-800 uppercase">
                    {r.category}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{r.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{r.description}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800">
                  ACTIVE
                </span>
              </div>

              {/* IF-THEN Visual Block */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 bg-white p-3 rounded-lg border border-slate-200 font-mono text-xs">
                <div className="p-2 rounded bg-indigo-50 border border-indigo-100 text-indigo-900">
                  <span className="font-bold text-indigo-600 uppercase block mb-1">IF Condition</span>
                  {r.condition}
                </div>
                <div className="p-2 rounded bg-emerald-50 border border-emerald-100 text-emerald-900">
                  <span className="font-bold text-emerald-600 uppercase block mb-1">THEN Action</span>
                  {r.actionType}: {r.actionValue}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
