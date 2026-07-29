import React, { useState, useEffect } from 'react';
import { CheckSquare, Filter, CheckCircle2, XCircle, Clock, Eye, Layers, ArrowUpRight } from 'lucide-react';
import { fetchCentralApprovals, processCentralApproval } from '../../services/enterpriseApi';

export default function CentralApprovalPage() {
  const [approvals, setApprovals] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedItem, setSelectedItem] = useState(null);

  const loadApprovals = () => {
    fetchCentralApprovals(activeTab).then((data) => setApprovals(data || []));
  };

  useEffect(() => {
    loadApprovals();
  }, [activeTab]);

  const handleProcess = async (id, action) => {
    await processCentralApproval(id, action, 'Approved via Central Approval Center');
    setSelectedItem(null);
    loadApprovals();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1 text-sm uppercase">
            <CheckSquare className="w-4 h-4" /> Unified Operational Desk
          </div>
          <h1 className="text-3xl font-extrabold">Central Approval Center</h1>
          <p className="text-slate-300 text-sm mt-1">
            Single screen handling pending loans, memberships, savings withdrawals, expenses, and branch requests.
          </p>
        </div>
        <div className="bg-indigo-500/20 border border-indigo-400/30 px-4 py-2 rounded-xl text-right backdrop-blur">
          <p className="text-xs text-indigo-200 uppercase font-semibold">Total Pending</p>
          <p className="text-2xl font-black text-indigo-300">{approvals.length} Items</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 border-b pb-3 overflow-x-auto">
        {['ALL', 'LOANS', 'MEMBERSHIPS', 'WITHDRAWALS', 'EXPENSES', 'BRANCH_REQUESTS'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition whitespace-nowrap ${
              activeTab === tab
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Grid of Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {approvals.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={`p-5 rounded-2xl border bg-white shadow-sm hover:border-indigo-400 cursor-pointer transition ${
                selectedItem?.id === item.id ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50/20' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-black bg-indigo-100 text-indigo-800 uppercase">
                  {item.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">{item.referenceNo}</span>
              </div>

              <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
              <p className="text-xs text-slate-600 font-medium">Applicant: {item.applicantName}</p>

              <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-500">Step: {item.currentStep}</span>
                {item.requestedAmount > 0 && (
                  <span className="text-md font-extrabold text-slate-900">
                    KES {item.requestedAmount.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Selected Item Drawer */}
        {selectedItem ? (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="border-b pb-4">
              <span className="text-xs font-bold text-indigo-600 uppercase">{selectedItem.category}</span>
              <h3 className="text-xl font-black text-slate-900 mt-1">{selectedItem.title}</h3>
              <p className="text-xs text-slate-500">Ref: {selectedItem.referenceNo}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-slate-500 font-semibold uppercase">Applicant Details</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedItem.applicantName}</p>
                <p className="text-slate-600">{selectedItem.branch}</p>
              </div>

              {Object.entries(selectedItem.details || {}).map(([k, v], idx) => (
                <div key={idx} className="flex justify-between p-2 border-b border-slate-100">
                  <span className="font-semibold text-slate-500 capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                  <span className="font-bold text-slate-900">{String(v)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleProcess(selectedItem.id, 'APPROVED')}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow flex justify-center items-center gap-2 text-sm"
              >
                <CheckCircle2 className="w-4 h-4" /> Approve Immediately
              </button>
              <button
                onClick={() => handleProcess(selectedItem.id, 'REJECTED')}
                className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200 text-xs"
              >
                Reject Request
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-300 text-center text-slate-400 text-sm flex items-center justify-center min-h-[300px]">
            Select any approval item to inspect details and process
          </div>
        )}
      </div>
    </div>
  );
}
