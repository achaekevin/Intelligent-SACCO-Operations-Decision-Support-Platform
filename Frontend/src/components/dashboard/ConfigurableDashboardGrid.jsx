import React, { useState } from 'react';
import { LayoutGrid, Eye, EyeOff, Settings, Check, ArrowUpRight } from 'lucide-react';

export default function ConfigurableDashboardGrid({ userRole = 'LOAN_OFFICER' }) {
  const [widgets, setWidgets] = useState([
    { id: 'w_eligibility', title: 'Intelligent Eligibility Calculator', category: 'LOAN_OFFICER', visible: true },
    { id: 'w_approvals', title: 'Pending Central Approvals Queue', category: 'ALL', visible: true },
    { id: 'w_financial_health', title: 'Financial Health & PAR Rating', category: 'ACCOUNTANT', visible: true },
    { id: 'w_smart_alerts', title: 'Smart Risk Alerts Stream', category: 'BRANCH_MANAGER', visible: true },
    { id: 'w_fraud_flags', title: 'Fraud & Anomaly Monitor', category: 'ADMIN', visible: true },
  ]);

  const [isConfiguring, setIsConfiguring] = useState(false);

  const toggleWidget = (id) => {
    setWidgets(widgets.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w)));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-indigo-600" />
          <span className="font-extrabold text-slate-800 text-sm">Role View Profile: {userRole}</span>
        </div>
        <button
          onClick={() => setIsConfiguring(!isConfiguring)}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
        >
          <Settings className="w-4 h-4" />
          {isConfiguring ? 'Done Customizing' : 'Customize Dashboard Layout'}
        </button>
      </div>

      {isConfiguring && (
        <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-2">
          <p className="text-xs font-bold text-indigo-900 uppercase">Toggle Visible Dashboard Widgets</p>
          <div className="flex flex-wrap gap-2">
            {widgets.map((w) => (
              <button
                key={w.id}
                onClick={() => toggleWidget(w.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                  w.visible
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white border border-slate-300 text-slate-500'
                }`}
              >
                {w.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {w.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
