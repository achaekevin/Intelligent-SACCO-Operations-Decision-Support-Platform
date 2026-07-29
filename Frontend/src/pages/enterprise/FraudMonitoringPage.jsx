import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertOctagon, Lock, Eye, CheckCircle, RefreshCw } from 'lucide-react';
import { fetchFraudFlags } from '../../services/enterpriseApi';

export default function FraudMonitoringPage() {
  const [flags, setFlags] = useState([]);

  useEffect(() => {
    fetchFraudFlags().then((data) => setFlags(data || []));
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-950 via-red-900 to-slate-900 p-6 rounded-2xl text-white shadow-xl flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 text-rose-400 font-semibold mb-1 text-sm uppercase">
            <ShieldAlert className="w-4 h-4" /> Anomaly & Financial Crime Scanner
          </div>
          <h1 className="text-3xl font-extrabold">Fraud Detection & Anomaly Rules Engine</h1>
          <p className="text-rose-100 text-sm mt-1">
            Real-time automated flagging for duplicate IDs, self-approvals, unusual withdrawals, and off-hour activity.
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-800 border-b pb-3 flex items-center gap-2">
          <AlertOctagon className="w-5 h-5 text-rose-600" /> Detected Anomaly Alerts
        </h2>

        <div className="space-y-4">
          {flags.map((f) => (
            <div key={f.id} className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 space-y-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-black bg-rose-600 text-white uppercase">
                    {f.riskScore} RISK
                  </span>
                  <span className="text-xs text-slate-500 font-mono">ID: {f.id}</span>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-slate-800 text-white">
                  {f.status}
                </span>
              </div>

              <h3 className="text-md font-extrabold text-slate-900 mt-1">{f.ruleName}</h3>
              <p className="text-xs text-slate-700 font-medium">{f.details}</p>
              <div className="flex justify-between items-center text-xs text-slate-400 font-mono mt-2 pt-2 border-t border-rose-100">
                <span>Triggered By: {f.triggeredBy}</span>
                <span>{new Date(f.timestamp).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
