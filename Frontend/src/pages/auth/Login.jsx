import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { Eye, EyeOff, Mail, Lock, Users, Handshake, TrendingUp, Shield, ChevronLeft, ChevronRight, CheckCircle, MapPin } from 'lucide-react'
import { loginUser } from '../../redux/slices/authSlice'
import Button from '../../components/common/Button'
import { ROLES } from '../../constants/roles'

const schema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
})

const partners = [
  { name: 'Amana SACCO', location: 'Nairobi', members: '8,500+' },
  { name: 'Unity Credit Partners', location: 'Mombasa', members: '12,300+' },
  { name: 'Community Growth Fund', location: 'Kisumu', members: '6,800+' },
]

const features = [
  { icon: Users, title: 'Member Management', description: 'Streamline membership & contributions', color: 'from-blue-500 to-blue-600' },
  { icon: Handshake, title: 'Loan & Credit Services', description: 'Efficient loan processing & tracking', color: 'from-purple-500 to-purple-600' },
  { icon: TrendingUp, title: 'Financial Reporting', description: 'Real-time insights & analytics', color: 'from-green-500 to-green-600' },
]

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [currentPartner, setCurrentPartner] = useState(0)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data) => {
    try {
      const user = await dispatch(loginUser({ ...data, rememberMe }))
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`)
      const dest = user.role === ROLES.MEMBER ? '/portal' : (location.state?.from?.pathname || '/dashboard')
      navigate(dest, { replace: true })
    } catch (err) {
      toast.error(err.message || 'Login failed')
    }
  }

  const nextPartner = () => setCurrentPartner((prev) => (prev + 1) % partners.length)
  const prevPartner = () => setCurrentPartner((prev) => (prev - 1 + partners.length) % partners.length)

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
      
      {/* Floating Orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Hero Content */}
        <div className="flex-1 flex flex-col justify-between p-12">
          {/* Top Section - Partner Carousel */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-xl">Amana</h2>
                <p className="text-slate-400 text-xs">SACCO Management Platform</p>
              </div>
            </div>

            {/* Partners Carousel */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <button onClick={prevPartner} className="p-2 hover:bg-white/10 rounded-lg transition">
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <div className="text-center flex-1">
                  <h3 className="text-white font-semibold text-lg">{partners[currentPartner].name}</h3>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <MapPin className="w-4 h-4 text-teal-400" />
                    <span className="text-slate-300 text-sm">{partners[currentPartner].location}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-teal-400 text-sm font-medium">{partners[currentPartner].members} members</span>
                  </div>
                </div>
                <button onClick={nextPartner} className="p-2 hover:bg-white/10 rounded-lg transition">
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </div>
              <div className="flex items-center justify-center gap-2">
                {partners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPartner(idx)}
                    className={`h-1.5 rounded-full transition-all ${idx === currentPartner ? 'w-8 bg-teal-500' : 'w-1.5 bg-white/30'}`}
                  />
                ))}
              </div>
            </div>

            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-2">
              <CheckCircle className="w-4 h-4 text-teal-400" />
              <span className="text-teal-300 text-sm font-medium">Trusted by 1000+ SACCOs Across Kenya</span>
            </div>
          </div>

          {/* Middle Section - Main Content */}
          <div className="space-y-8 max-w-2xl">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
                Transform Your SACCO Management
              </h1>
              <p className="text-xl text-slate-300 leading-relaxed">
                Join Kenya's leading co-operatives in streamlining membership, managing loans, and accelerating economic growth
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all hover:scale-105 hover:shadow-2xl cursor-pointer"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                  <p className="text-slate-400 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Section - Footer */}
          <div className="text-slate-500 text-sm">
            © 2026 Amana SACCO Platform. All rights reserved.
          </div>
        </div>

        {/* Right Side - Login Panel */}
        <div className="w-full md:w-[480px] flex items-center justify-center p-8">
          <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
            {/* Logo */}
            <div className="flex items-center justify-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Welcome back to Amana</h2>
              <p className="text-slate-300">Sign in to access your secure SACCO dashboard</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="you@sacco.co.ke"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-11 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-11 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/10 text-teal-500 focus:ring-teal-500 focus:ring-offset-0"
                  />
                  <span className="text-sm text-slate-300">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-teal-400 hover:text-teal-300 transition">
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                loading={isSubmitting}
                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-3 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg"
              >
                Sign in
              </Button>
            </form>

            {/* Register Link */}
            <p className="text-center text-slate-400 text-sm mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-teal-400 hover:text-teal-300 font-medium transition">
                Register your SACCO
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
