import React, { useState, useEffect } from 'react';
import { Cpu, Play, CheckCircle2, Clock, RotateCw, Terminal } from 'lucide-react';
import { fetchAutomationJobs, runAutomationJob } from '../../services/enterpriseApi';

export default function ProcessAutomationPage() {
  const [jobs, setJobs] = useState([]);
  const [logs, setLogs] = useState([]);
  const [runningId, setRunningId] = useState(null);

  const loadData = () => {
    fetchAutomationJobs().then((res) => {
      setJobs(res?.data || []);
      setLogs(res?.logs || []);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRun = async (jobId) => {
    setRunningId(jobId);
    try {
      await runAutomationJob(jobId);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setRunningId(null);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 p-6 rounded-2xl text-white shadow-xl flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1 text-sm uppercase">
            <Cpu className="w-4 h-4" /> Autonomous Operations Daemon
          </div>
          <h1 className="text-3xl font-extrabold">Process Automation Engine</h1>
          <p className="text-slate-300 text-sm mt-1">
            Automated background runner for interest calculation, penalties, reminders, account archiving, and dividends.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Jobs List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Scheduled Operational Jobs</h2>
          {jobs.map((j) => (
            <div key={j.id} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex justify-between items-center">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-black bg-indigo-100 text-indigo-800 uppercase">
                    {j.frequency}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Last run: {j.lastRun}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{j.name}</h3>
                <p className="text-xs text-slate-600 font-medium">{j.description}</p>
              </div>

              <button
                onClick={() => handleRun(j.id)}
                disabled={runningId === j.id}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 transition whitespace-nowrap"
              >
                <Play className="w-4 h-4" />
                {runningId === j.id ? 'Executing...' : 'Trigger Now'}
              </button>
            </div>
          ))}
        </div>

        {/* Execution Terminal Logs */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4 font-mono text-xs">
          <h3 className="text-sm font-bold text-indigo-400 uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
            <Terminal className="w-4 h-4" /> Automation Execution Logs
          </h3>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {logs.map((l) => (
              <div key={l.id} className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between text-slate-400 text-[10px]">
                  <span>{l.timestamp}</span>
                  <span className="text-emerald-400 font-bold">{l.status}</span>
                </div>
                <p className="text-slate-200">{l.details}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
