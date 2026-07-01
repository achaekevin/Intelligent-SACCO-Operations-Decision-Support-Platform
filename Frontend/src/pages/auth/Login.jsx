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
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`)
      const dest = user.role === ROLES.MEMBER ? '/portal' : (location.state?.from?.pathname || '/dashboard')
      navigate(dest, { replace: true })
    } catch (err) {
      toast.error(err.message || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Background Image - Professional Office Meeting */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=1920&q=80')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/60"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        {/* Left Side - Hero Content */}
        <div className="flex-1 flex flex-col justify-between p-6 md:p-12">
          {/* Top Section - Logo & Partner Carousel */}
          <div className="space-y-4 md:space-y-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-base md:text-lg">Amana SACCO</h2>
                <p className="text-slate-400 text-[10px] md:text-xs">Empowering Community Finance</p>
              </div>
            </div>

            {/* Partners with Animated Counties */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {partners.map((partner, idx) => (
                <div
                  key={idx}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-white/20 hover:bg-white/15 transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-2 mb-2">
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center ${
                      idx === 0 ? 'bg-blue-500' : 
                      idx === 1 ? 'bg-green-500' : 
                      idx === 2 ? 'bg-pink-500' : 
                      'bg-purple-500'
                    } group-hover:scale-110 transition-transform`}>
                      <partner.icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                  </div>
                  <h3 className="text-white font-semibold text-xs md:text-sm mb-1">{partner.name}</h3>
                  <p className="text-slate-400 text-[10px] md:text-xs flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {partner.subtitle}
                  </p>
                  <p className="text-slate-500 text-[10px] mt-1 transition-all duration-300">
                    {kenyanCounties[countyIndices[idx]]}, {(partner.baseMembers + Math.floor(Math.random() * 1000)).toLocaleString()}+ members
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Middle Section - Main Content */}
          <div className="space-y-6 md:space-y-8 max-w-2xl mt-8 lg:mt-0">
            <div className="space-y-3 md:space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Elevate Your<br />SACCO Operations
              </h1>
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
                Join Kenya's leading co-operatives in streamlining membership, managing loans, and accelerating economic growth.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="space-y-3 md:space-y-4">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 md:p-5 hover:bg-white/10 transition-all group"
                >
                  <div className={`w-12 h-12 md:w-14 md:h-14 ${feature.bgColor} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-sm md:text-base mb-1">{feature.title}</h3>
                    <p className="text-slate-400 text-xs md:text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom - empty for spacing */}
          <div></div>
        </div>

        {/* Right Side - Login Panel */}
        <div className="w-full lg:w-[480px] flex items-center justify-center p-6 md:p-8">
          <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-2xl">
            {/* Logo */}
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Welcome back to Amana</h2>
              <p className="text-slate-600 text-sm">Sign in to access your secure SACCO dashboard</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="admin@greenvalley.edu"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-11 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-11 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
              </div>

              {/* Show Password Checkbox */}
              <div className="flex items-center justify-end">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                  />
                  Show password
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                loading={isSubmitting}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg"
              >
                Sign in
              </Button>
            </form>

            {/* Forgot Password */}
            <div className="text-center mt-4">
              <Link to="/forgot-password" className="text-sm text-orange-600 hover:text-orange-700 font-medium transition">
                Forgot your password?
              </Link>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500">New to Amana?</span>
              </div>
            </div>

            {/* Register Links */}
            <div className="space-y-2">
              <Link 
                to="/register" 
                className="block w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 rounded-lg transition"
              >
                Register your SACCO
              </Link>
              <Link 
                to="/join-member" 
                className="block w-full text-center text-slate-600 hover:text-slate-900 text-sm font-medium transition"
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
