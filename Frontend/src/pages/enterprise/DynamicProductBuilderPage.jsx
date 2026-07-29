import React, { useState, useEffect } from 'react';
import { PackagePlus, Plus, Sparkles, DollarSign, Calendar, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { fetchProducts, createProduct } from '../../services/enterpriseApi';

export default function DynamicProductBuilderPage() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState('LOAN');
  const [name, setName] = useState('');
  const [interestRate, setInterestRate] = useState(8.5);
  const [maxAmount, setMaxAmount] = useState(500000);
  const [gracePeriodMonths, setGracePeriodMonths] = useState(3);
  const [minDeposit, setMinDeposit] = useState(500);
  const [withdrawalLockMonths, setWithdrawalLockMonths] = useState(12);

  const loadProducts = () => {
    fetchProducts().then((data) => setProducts(data || []));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await createProduct({
      name,
      type,
      interestRate: parseFloat(interestRate),
      maxAmount: parseFloat(maxAmount),
      gracePeriodMonths: parseInt(gracePeriodMonths),
      minDeposit: parseFloat(minDeposit),
      withdrawalLockMonths: parseInt(withdrawalLockMonths),
      description: `Dynamic ${type} product generated via Admin Builder.`,
    });
    setShowModal(false);
    setName('');
    loadProducts();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-950 via-emerald-900 to-slate-900 p-6 rounded-2xl text-white shadow-xl flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1 text-sm uppercase">
            <PackagePlus className="w-4 h-4" /> Admin Financial Product Engine
          </div>
          <h1 className="text-3xl font-extrabold">Dynamic Product Builder</h1>
          <p className="text-emerald-100 text-sm mt-1">
            Create and launch new financial products (Savings & Loans) with custom rules without writing code.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 font-bold rounded-xl text-white shadow-lg flex items-center gap-2 transition"
        >
          <Plus className="w-5 h-5" /> Build New Product
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => (
          <div key={p.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:border-emerald-400 transition">
            <div className="flex justify-between items-center">
              <span className={`px-2.5 py-0.5 rounded text-xs font-black uppercase ${p.type === 'SAVINGS' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'}`}>
                {p.type}
              </span>
              <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {p.interestRate}% Interest
              </span>
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-slate-900">{p.name}</h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">{p.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs font-semibold text-slate-700">
              {p.type === 'SAVINGS' ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Min Deposit:</span>
                    <span className="font-bold text-slate-900">KES {p.minDeposit?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Withdrawal Lock:</span>
                    <span className="font-bold text-slate-900">{p.withdrawalLockMonths} Months</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Max Limit:</span>
                    <span className="font-bold text-slate-900">KES {p.maxAmount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Grace Period:</span>
                    <span className="font-bold text-slate-900">{p.gracePeriodMonths} Months</span>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
            <h2 className="text-xl font-bold text-slate-900 border-b pb-2">Build New Financial Product</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Product Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800"
                >
                  <option value="LOAN">Loan Product</option>
                  <option value="SAVINGS">Savings Product</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Product Title</label>
                <input
                  type="text"
                  placeholder="e.g. Holiday Savings, Education Loan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Annual Interest Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800"
                />
              </div>

              {type === 'SAVINGS' ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Minimum Deposit (KES)</label>
                    <input
                      type="number"
                      value={minDeposit}
                      onChange={(e) => setMinDeposit(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Withdrawal Lock (Months)</label>
                    <input
                      type="number"
                      value={withdrawalLockMonths}
                      onChange={(e) => setWithdrawalLockMonths(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Maximum Loan Cap (KES)</label>
                    <input
                      type="number"
                      value={maxAmount}
                      onChange={(e) => setMaxAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Grace Period (Months)</label>
                    <input
                      type="number"
                      value={gracePeriodMonths}
                      onChange={(e) => setGracePeriodMonths(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-1/2 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
