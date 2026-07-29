import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle, Calculator, Sparkles, User, DollarSign, Award, CreditCard, Building } from 'lucide-react';
import { evaluateLoanEligibility } from '../../services/enterpriseApi';

export default function LoanEligibilityEvaluator() {
  const [memberId, setMemberId] = useState(1);
  const [requestedAmount, setRequestedAmount] = useState(450000);
  const [monthlyIncome, setMonthlyIncome] = useState(80000);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleEvaluate = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const data = await evaluateLoanEligibility({
        memberId,
        requestedAmount: parseFloat(requestedAmount),
        monthlyIncome: parseFloat(monthlyIncome),
      });
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleEvaluate();
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-6 rounded-2xl text-white shadow-xl flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1 text-sm tracking-wide uppercase">
            <Sparkles className="w-4 h-4" /> AI-Powered Decision Support
          </div>
          <h1 className="text-3xl font-extrabold">Intelligent Loan Eligibility Engine</h1>
          <p className="text-emerald-100 text-sm mt-1">
            Automated multi-factor evaluation replacement for manual officer credit calculations.
          </p>
        </div>
        <div className="bg-emerald-500/20 border border-emerald-400/30 px-4 py-2 rounded-xl text-right backdrop-blur">
          <p className="text-xs text-emerald-200 uppercase font-semibold">Engine Status</p>
          <p className="text-lg font-bold text-emerald-300">Policy v4.2 Active</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-600" /> Evaluation Inputs
          </h2>

          <form onSubmit={handleEvaluate} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Select Member ID</label>
              <select
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800"
              >
                <option value={1}>John Kamau (MEM-00124) - Standard</option>
                <option value={2}>Jane Mutua (MEM-00202) - High Savings</option>
                <option value={3}>Peter Ochieng (MEM-00104) - Irregular Savings</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Requested Loan Amount (KES)</label>
              <input
                type="number"
                value={requestedAmount}
                onChange={(e) => setRequestedAmount(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Declared Monthly Gross Income (KES)</label>
              <input
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-600/30 transition duration-200 flex justify-center items-center gap-2"
            >
              {loading ? 'Evaluating...' : 'Run Automated Eligibility Engine'}
            </button>
          </form>
        </div>

        {/* Results Panel */}
        {result && (
          <div className="lg:col-span-2 space-y-6">
            {/* Main Verdict Card */}
            <div className={`p-6 rounded-2xl border ${result.isEligible ? 'bg-emerald-50 border-emerald-300' : 'bg-amber-50 border-amber-300'} shadow-sm`}>
              <div className="flex justify-between items-start">
                <div>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${result.isEligible ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'}`}>
                    {result.isEligible ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                    {result.isEligible ? 'FULLY ELIGIBLE' : 'CONDITIONAL / REVIEW REQUIRED'}
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 mt-2">
                    Eligible Amount: <span className="text-emerald-700">KES {result.eligibleAmount?.toLocaleString()}</span>
                  </h3>
                  <p className="text-sm text-slate-600 mt-1 font-medium">{result.recommendation}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-slate-800">{result.score}/100</div>
                  <div className="text-xs text-slate-500 uppercase font-semibold">Credit Score</div>
                </div>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <p className="text-xs text-slate-500 font-semibold uppercase">Total Savings</p>
                <p className="text-lg font-extrabold text-slate-800">KES {result.totalSavings?.toLocaleString()}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <p className="text-xs text-slate-500 font-semibold uppercase">Share Capital</p>
                <p className="text-lg font-extrabold text-slate-800">KES {result.shareCapital?.toLocaleString()}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <p className="text-xs text-slate-500 font-semibold uppercase">Existing Loans</p>
                <p className="text-lg font-extrabold text-slate-800">KES {result.existingLoanBalance?.toLocaleString()}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <p className="text-xs text-slate-500 font-semibold uppercase">DTI Ratio</p>
                <p className="text-lg font-extrabold text-slate-800">{result.dtiRatio}%</p>
              </div>
            </div>

            {/* Structured Reasons Checklist */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h4 className="text-md font-bold text-slate-800 mb-3 border-b pb-2">Policy Evaluation Checklist</h4>
              <div className="space-y-2">
                {result.reasons?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    {item.pass ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                    )}
                    <span className={`text-sm font-semibold ${item.pass ? 'text-slate-700' : 'text-rose-700'}`}>
                      {item.text}
                    </span>
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
