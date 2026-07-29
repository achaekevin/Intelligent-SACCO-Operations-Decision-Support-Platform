import React, { useState, useEffect } from 'react';
import { GitMerge, Layers, CheckCircle, Plus, Shield, ArrowRight } from 'lucide-react';
import { fetchWorkflows } from '../../services/enterpriseApi';

export default function WorkflowManager() {
  const [workflows, setWorkflows] = useState([]);
  const [selectedWf, setSelectedWf] = useState(null);

  useEffect(() => {
    fetchWorkflows().then((data) => {
      setWorkflows(data || []);
      if (data && data.length > 0) setSelectedWf(data[0]);
    });
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 rounded-2xl text-white shadow-xl flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 text-blue-400 font-semibold mb-1 text-sm uppercase">
            <GitMerge className="w-4 h-4" /> Multi-Module Approval Engine
          </div>
          <h1 className="text-3xl font-extrabold">Workflow Automation Engine</h1>
          <p className="text-blue-100 text-sm mt-1">
            Configure dynamic multi-tier approval chains without hardcoding logic in code.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflow List */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" /> Configured Workflows
            </h2>
          </div>

          <div className="space-y-3">
            {workflows.map((wf) => (
              <button
                key={wf.id}
                onClick={() => setSelectedWf(wf)}
                className={`w-full text-left p-4 rounded-xl border transition duration-150 ${
                  selectedWf?.id === wf.id
                    ? 'border-indigo-600 bg-indigo-50/70 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                    {wf.entityType}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{wf.steps?.length} Steps</span>
                </div>
                <p className="font-bold text-slate-900 mt-2 text-md">{wf.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Workflow Detail & Step Visualizer */}
        {selectedWf && (
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="border-b pb-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-indigo-600 text-white font-extrabold text-xs rounded-full">
                  {selectedWf.entityType}
                </span>
                <h3 className="text-2xl font-black text-slate-900">{selectedWf.name}</h3>
              </div>
              {selectedWf.minAmountForCeo && (
                <p className="text-sm text-slate-600 mt-2 font-medium">
                  Rule Condition: Loans &gt; KES {selectedWf.minAmountForCeo.toLocaleString()} trigger executive CEO sanction step.
                </p>
              )}
            </div>

            {/* Steps Timeline Visualizer */}
            <div>
              <h4 className="text-md font-bold text-slate-800 mb-4">Approval Chain Sequence</h4>
              <div className="space-y-4">
                {selectedWf.steps?.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center shadow-md">
                      {step.level}
                    </div>
                    <div className="flex-1 p-4 rounded-xl border border-slate-200 bg-slate-50 flex justify-between items-center">
                      <div>
                        <p className="text-xs text-indigo-600 font-bold uppercase">{step.role}</p>
                        <p className="text-base font-bold text-slate-900">{step.label}</p>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-200 text-slate-700">
                        Required
                      </span>
                    </div>
                    {idx < selectedWf.steps.length - 1 && (
                      <ArrowRight className="w-5 h-5 text-slate-400 hidden sm:block" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
