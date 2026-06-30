import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Link } from 'react-router-dom'
import { MailCheck, Mail, ArrowLeft } from 'lucide-react'
import { FormField, TextInput } from '../../components/forms/FormField'
import Button from '../../components/common/Button'

const schema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
})

const ForgotPassword = () => {
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: yupResolver(schema) })

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 800))
    setSent(true)
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-success-light flex items-center justify-center mx-auto mb-4">
          <MailCheck size={26} className="text-success" />
        </div>
        <h1 className="font-display text-xl font-bold text-ink-800 dark:text-ink-50">Check your email</h1>
        <p className="text-sm text-ink-400 mt-2 mb-6">We've sent a password reset link to your inbox. It expires in 30 minutes.</p>
        <Link to="/login">
          <Button variant="outline" className="w-full" icon={ArrowLeft}>Back to login</Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-800 dark:text-ink-50">Forgot password?</h1>
      <p className="text-sm text-ink-400 mt-1.5 mb-6">Enter your email and we'll send you a reset link.</p>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField label="Email address" error={errors.email} required>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <TextInput register={register} name="email" type="email" placeholder="you@sacco.co.ke" error={errors.email} style={{ paddingLeft: '2.5rem' }} />
          </div>
        </FormField>
        <Button type="submit" loading={isSubmitting} className="w-full">Send reset link</Button>
      </form>
      <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm text-ink-500 dark:text-ink-300 hover:text-teal-600 mt-5">
        <ArrowLeft size={14} /> Back to login
      </Link>
    </div>
  )
}

export default ForgotPassword
