import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { loginUser } from '../../redux/slices/authSlice'
import { FormField, TextInput } from '../../components/forms/FormField'
import Button from '../../components/common/Button'
import { ROLES } from '../../constants/roles'

const schema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
})

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { email: 'admin@amanasacco.co.ke', password: 'password' },
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

  return (
    <div className="w-full">
      <h1 className="font-display text-2xl font-bold text-ink-800 dark:text-ink-50 animate-fade-in-up">Welcome back</h1>
      <p className="text-sm text-ink-400 mt-1.5 mb-6 animate-fade-in-up delay-75">Sign in to access your SACCO dashboard.</p>

      <div className="bg-info-light text-info text-xs rounded-lg px-3 py-2.5 mb-5 leading-relaxed animate-fade-in-up delay-100">
        Demo accounts (password: <span className="font-mono">password</span>):<br />
        admin@amanasacco.co.ke · loans@amanasacco.co.ke · teller@amanasacco.co.ke · member@amanasacco.co.ke
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="animate-fade-in-up delay-150">
        <FormField label="Email address" error={errors.email} required>
          <div className="relative group/field">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 group-focus-within/field:text-teal-600 dark:group-focus-within/field:text-gold-400 transition-colors duration-200" />
            <TextInput register={register} name="email" type="email" placeholder="you@sacco.co.ke" error={errors.email} className="pl-10" style={{ paddingLeft: '2.5rem' }} />
          </div>
        </FormField>

        <FormField label="Password" error={errors.password} required>
          <div className="relative group/field">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 group-focus-within/field:text-teal-600 dark:group-focus-within/field:text-gold-400 transition-colors duration-200" />
            <TextInput
              register={register}
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              error={errors.password}
              style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
            />
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 transition-colors duration-200">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </FormField>

        <div className="flex items-center justify-between mb-6">
          <label className="flex items-center gap-2 text-sm text-ink-500 dark:text-ink-300 cursor-pointer">
            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="rounded border-ink-300 text-teal-600 focus:ring-teal-500 transition-colors duration-200" />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-sm font-medium text-teal-600 dark:text-gold-400 hover:underline transition-colors duration-200">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" loading={isSubmitting} className="w-full">Sign in</Button>
      </form>
    </div>
  )
}

export default Login
