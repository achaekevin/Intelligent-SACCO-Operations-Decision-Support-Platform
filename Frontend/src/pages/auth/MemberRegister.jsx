import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Eye, EyeOff, Mail, Phone, User, MapPin, CreditCard, ArrowLeft, CheckCircle, Users } from 'lucide-react'
import Button from '../../components/common/Button'
import axios from 'axios'

const schema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  phone: yup.string().required('Phone number is required'),
  nationalId: yup.string().required('National ID is required'),
  dateOfBirth: yup.string().required('Date of birth is required'),
  address: yup.string().required('Address is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
})

const MemberRegister = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data) => {
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        nationalId: data.nationalId,
        dateOfBirth: data.dateOfBirth,
        address: data.address,
        password: data.password,
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/members/self-register`, 
        payload
      )
      
      toast.success('Registration submitted! You will receive an email once your application is approved.')
      
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.'
      toast.error(message)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
      
      {/* Floating Orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="relative z-10 w-full max-w-2xl px-4">
        {/* Back to Login Link */}
        <Link to="/login" className="inline-flex items-center gap-2 text-slate-300 hover:text-white mb-4 md:mb-6 transition text-sm md:text-base">
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        {/* Registration Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 md:p-10 border border-white/20 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-6 md:mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">Join Imara SACCO</h1>
            <p className="text-slate-300 text-sm md:text-base">Apply for membership and start your savings journey</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* Personal Information */}
            <div>
              <h3 className="text-base md:text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-teal-400" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">First Name</label>
                  <input
                    {...register('firstName')}
                    type="text"
                    placeholder="Enter first name"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                  />
                  {errors.firstName && <p className="mt-1 text-sm text-red-400">{errors.firstName.message}</p>}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Last Name</label>
                  <input
                    {...register('lastName')}
                    type="text"
                    placeholder="Enter last name"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                  />
                  {errors.lastName && <p className="mt-1 text-sm text-red-400">{errors.lastName.message}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="your@email.com"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-11 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      {...register('phone')}
                      type="tel"
                      placeholder="+254 700 000000"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-11 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                    />
                  </div>
                  {errors.phone && <p className="mt-1 text-sm text-red-400">{errors.phone.message}</p>}
                </div>

                {/* National ID */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">National ID</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      {...register('nationalId')}
                      type="text"
                      placeholder="12345678"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-11 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                    />
                  </div>
                  {errors.nationalId && <p className="mt-1 text-sm text-red-400">{errors.nationalId.message}</p>}
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Date of Birth</label>
                  <input
                    {...register('dateOfBirth')}
                    type="date"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                  />
                  {errors.dateOfBirth && <p className="mt-1 text-sm text-red-400">{errors.dateOfBirth.message}</p>}
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-200 mb-2">Physical Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <textarea
                      {...register('address')}
                      rows="2"
                      placeholder="Enter your physical address"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-11 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition resize-none"
                    />
                  </div>
                  {errors.address && <p className="mt-1 text-sm text-red-400">{errors.address.message}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Password</label>
                  <div className="relative">
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-11 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
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

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Confirm Password</label>
                  <div className="relative">
                    <input
                      {...register('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-11 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              loading={isSubmitting}
              className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-3 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg"
            >
              <CheckCircle className="w-5 h-5 inline mr-2" />
              Submit Application
            </Button>

            {/* Info Note */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <p className="text-blue-300 text-sm">
                <strong>Note:</strong> Your application will be reviewed by our admin team. You'll receive an email notification once your account is approved.
              </p>
            </div>
          </form>

          {/* Login Link */}
          <p className="text-center text-slate-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-400 hover:text-teal-300 font-medium transition">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default MemberRegister
