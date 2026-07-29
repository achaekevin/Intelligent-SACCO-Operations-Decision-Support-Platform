import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, Bell, CheckCircle2, Clock, Filter, AlertCircle } from 'lucide-react';
import { fetchSmartAlerts, resolveSmartAlert } from '../../services/enterpriseApi';

export default function SmartAlertsCenter() {
  const [alerts, setAlerts] = useState([]);
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const loadAlerts = () => {
    fetchSmartAlerts().then((data) => setAlerts(data || []));
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleResolve = async (id) => {
    await resolveSmartAlert(id, 'Staff reviewed and took corrective action');
    loadAlerts();
  };

  const filtered = severityFilter === 'ALL' ? alerts : alerts.filter((a) => a.severity === severityFilter);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-950 via-orange-900 to-slate-900 p-6 rounded-2xl text-white shadow-xl flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-semibold mb-1 text-sm uppercase">
            <Bell className="w-4 h-4" /> Proactive Risk Warning Radar
          </div>
          <h1 className="text-3xl font-extrabold">Smart Alerts & Early Risk Warning Center</h1>
          <p className="text-amber-100 text-sm mt-1">
            Automated scanning system to flag early default risks, savings declines, and policy breaches before escalation.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b pb-3">
        {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map((sev) => (
          <button
            key={sev}
            onClick={() => setSeverityFilter(sev)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
              severityFilter === sev
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {sev}
          </button>
        ))}
      </div>

      {/* Alerts Feed */}
      <div className="space-y-4">
        {filtered.map((alt) => (
          <div
            key={alt.id}
            className={`p-5 rounded-2xl border bg-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
              alt.severity === 'CRITICAL'
                ? 'border-rose-300 border-l-8 border-l-rose-600'
                : alt.severity === 'WARNING'
                ? 'border-amber-300 border-l-8 border-l-amber-500'
                : 'border-blue-300 border-l-8 border-l-blue-500'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded text-xs font-black uppercase ${
                    alt.severity === 'CRITICAL'
                      ? 'bg-rose-100 text-rose-800'
                      : alt.severity === 'WARNING'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {alt.severity}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {new Date(alt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">{alt.title}</h3>
              <p className="text-xs text-slate-600 font-medium">{alt.details}</p>
              <p className="text-xs text-slate-500 italic mt-1">Suggested Action: {alt.suggestedAction}</p>
            </div>

            <div className="flex items-center gap-3">
              {alt.status === 'RESOLVED' ? (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> RESOLVED
                </span>
              ) : (
                <button
                  onClick={() => handleResolve(alt.id)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  Take Action / Resolve
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
