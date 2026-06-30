import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Landmark, ShieldCheck, TrendingUp, Users } from 'lucide-react'

const AuthLayout = () => {
  const { theme } = useSelector((s) => s.ui)

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen grid lg:grid-cols-2 bg-cream dark:bg-ink-900">
        <div className="hidden lg:flex flex-col justify-between bg-ink-800 text-white p-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-ledger-stripe opacity-40" />

          {/* Glowing Ambient Orbs */}
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-gold-400/10 rounded-full blur-3xl animate-glow" />
          <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-teal-500/15 rounded-full blur-3xl animate-glow [animation-delay:4s]" />

          <div className="relative flex items-center gap-2 animate-fade-in-up">
            <div className="w-10 h-10 rounded-lg bg-gold-400 flex items-center justify-center hover:rotate-12 transition-transform duration-300">
              <Landmark size={20} className="text-ink-900" />
            </div>
            <span className="font-display font-bold text-xl">Amana SACCO</span>
          </div>

          <div className="relative">
            <h2 className="font-display text-3xl font-bold leading-tight max-w-md animate-fade-in-up delay-100">
              Cooperative banking, run with clarity and trust.
            </h2>
            <p className="text-ink-200 mt-4 max-w-md text-sm leading-relaxed animate-fade-in-up delay-150">
              Manage members, savings, loans and branches from one secure dashboard built for Kenyan SACCOs.
            </p>
            <div className="grid grid-cols-3 gap-4 mt-8 max-w-md">
              <div className="flex flex-col gap-2 group p-2 rounded-lg hover:bg-white/5 transition-all duration-300 cursor-pointer animate-fade-in-up delay-200">
                <Users size={20} className="text-gold-400 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300" />
                <span className="text-xs text-ink-300 group-hover:text-white transition-colors duration-300">Member<br />management</span>
              </div>
              <div className="flex flex-col gap-2 group p-2 rounded-lg hover:bg-white/5 transition-all duration-300 cursor-pointer animate-fade-in-up delay-300">
                <TrendingUp size={20} className="text-gold-400 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300" />
                <span className="text-xs text-ink-300 group-hover:text-white transition-colors duration-300">Savings &amp;<br />loan tracking</span>
              </div>
              <div className="flex flex-col gap-2 group p-2 rounded-lg hover:bg-white/5 transition-all duration-300 cursor-pointer animate-fade-in-up delay-400">
                <ShieldCheck size={20} className="text-gold-400 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300" />
                <span className="text-xs text-ink-300 group-hover:text-white transition-colors duration-300">Role-based<br />access</span>
              </div>
            </div>
          </div>

          <p className="relative text-xs text-ink-400 animate-fade-in-up delay-500">© 2026 Amana SACCO. All rights reserved.</p>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-sm">
            <Outlet />
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3500} theme={theme} />
    </div>
  )
}

export default AuthLayout
