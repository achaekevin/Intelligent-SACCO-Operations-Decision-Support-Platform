import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { Eye, EyeOff, Mail, Lock, Users, Handshake, TrendingUp, Shield, ChevronLeft, ChevronRight, BarChart3, Building2 } from 'lucide-react'
import { loginUser } from '../../redux/slices/authSlice'
import Button from '../../components/common/Button'
import { ROLES } from '../../constants/roles'
import ImaraLogo from '../../components/common/ImaraLogo'

const schema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
})

// All 47 counties in Kenya
const kenyanCounties = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi', 'Kitale',
  'Garissa', 'Kakamega', 'Machakos', 'Meru', 'Nyeri', 'Kisii', 'Kericho', 'Embu',
  'Migori', 'Homa Bay', 'Narok', 'Kiambu', 'Kajiado', 'Murang\'a', 'Nyandarua', 'Nyamira',
  'Kirinyaga', 'Laikipia', 'Nandi', 'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet',
  'Isiolo', 'Kajiado', 'Kericho', 'Kilifi', 'Kirinyaga', 'Kwale', 'Lamu', 'Mandera',
  'Marsabit', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River', 'Trans-Nzoia', 'Turkana',
  'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
]

const partners = [
  { 
    name: 'Unity Credit Partners',
    subtitle: 'Trusted by 1000+ SACCOs Across Kenya',
    icon: Building2,
    baseMembers: 8500
  },
  { 
    name: 'Community Growth Fund',
    subtitle: 'Trusted by 1000+ SACCOs Across Kenya',
    icon: Users,
    baseMembers: 6500
  },
  { 
    name: 'SME Business Co-op',
    subtitle: 'Trusted by 1000+ SACCOs Across Kenya',
    icon: TrendingUp,
    baseMembers: 2300
  },
  { 
    name: 'Heritage Credit Union',
    subtitle: 'Trusted by 1000+ SACCOs Across Kenya',
    icon: Shield,
    baseMembers: 8600
  },
]

const features = [
  { 
    icon: Users, 
    title: 'Member Management', 
    description: 'Secure member data, savings records, and dividend history',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-500'
  },
  { 
    icon: Handshake, 
    title: 'Loan & Credit Services', 
    description: 'Streamline applications, approvals, and repayment tracking',
    color: 'from-pink-500 to-pink-600',
    bgColor: 'bg-pink-500'
  },
  { 
    icon: BarChart3, 
    title: 'Financial Reporting', 
    description: 'Analyze performance, manage risks, and ensure compliance',
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-500'
  },
]

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const [countyIndices, setCountyIndices] = useState([0, 12, 24, 36])

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
  })

  // Auto-rotate counties every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCountyIndices(prev => prev.map(index => (index + 1) % kenyanCounties.length))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const onSubmit = async (data) => {
    try {
      const user = await dispatch(loginUser(data))
      const firstName = user.firstName || user.name?.split(' ')[0] || 'User'
      toast.success(`Welcome back, ${firstName}!`)
      const dest = user.role === ROLES.MEMBER ? '/portal' : (location.state?.from?.pathname || '/dashboard')
      navigate(dest, { replace: true })
    } catch (err) {
      toast.error(err.message || 'Login failed')
    }
  }

  return (
    <div className="h-screen w-full relative overflow-hidden">
      {/* Background Image - Professional Office Meeting */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=1920&q=80')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/60"></div>
      </div>

      <div className="relative z-10 h-full flex flex-col lg:flex-row">
        {/* Left Side - Hero Content */}
        <div className="flex-1 flex flex-col justify-between p-4 md:p-6 lg:p-8 overflow-y-auto">
          {/* Top Section - Logo & Title */}
          <div className="space-y-3">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                <ImaraLogo size={20} />
              </div>
              <div>
                <h2 className="text-white font-bold text-sm md:text-base">Imara SACCO</h2>
                <p className="text-slate-400 text-[10px]">Empowering Community Finance</p>
              </div>
            </div>

            {/* Main Headline */}
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
                Elevate Your<br />SACCO Operations
              </h1>
              <p className="text-sm text-slate-300 mt-2 max-w-lg">
                Join Kenya's leading co-operatives in streamlining membership, managing loans, and accelerating economic growth.
              </p>
            </div>
          </div>

          {/* Middle Section - Features (Compact) */}
          <div className="space-y-2 my-4">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-all group"
              >
                <div className={`w-10 h-10 ${feature.bgColor} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-xs md:text-sm">{feature.title}</h3>
                  <p className="text-slate-400 text-[10px] md:text-xs truncate">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom - Partners (Compact) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {partners.map((partner, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20 hover:bg-white/15 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    idx === 0 ? 'bg-blue-500' : 
                    idx === 1 ? 'bg-green-500' : 
                    idx === 2 ? 'bg-pink-500' : 
                    'bg-purple-500'
                  }`}>
                    <partner.icon className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-white font-semibold text-[10px] flex-1 truncate">{partner.name}</h3>
                </div>
                <p className="text-slate-500 text-[9px] truncate">
                  {kenyanCounties[countyIndices[idx]]}, {(partner.baseMembers + Math.floor(Math.random() * 1000)).toLocaleString()}+
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Login Panel */}
        <div className="w-full lg:w-[420px] flex items-center justify-center p-4 md:p-6">
          <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-2xl p-5 md:p-6 shadow-2xl">
            {/* Logo */}
            <div className="flex items-center justify-center mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center">
                <ImaraLogo size={32} />
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-5">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-1">Welcome back to Imara</h2>
              <p className="text-slate-600 text-xs">Sign in to access your SACCO dashboard</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
              {/* Email Field */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="admin@greenvalley.edu"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-10 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
              </div>

              {/* Show Password Checkbox */}
              <div className="flex items-center justify-end">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                  />
                  Show password
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                loading={isSubmitting}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-2.5 text-sm rounded-lg transition-all transform hover:scale-[1.02] shadow-lg"
              >
                Sign in
              </Button>
            </form>

            {/* Forgot Password */}
            <div className="text-center mt-3">
              <Link to="/forgot-password" className="text-xs text-orange-600 hover:text-orange-700 font-medium transition">
                Forgot your password?
              </Link>
            </div>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-slate-500">New to Amana?</span>
              </div>
            </div>

            {/* Register Links */}
            <div className="space-y-2">
              <Link 
                to="/register" 
                className="block w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 text-xs rounded-lg transition"
              >
                Register your SACCO
              </Link>
              <Link 
                to="/join-member" 
                className="block w-full text-center text-slate-600 hover:text-slate-900 text-xs font-medium transition"
              >
                Apply for Membership
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
