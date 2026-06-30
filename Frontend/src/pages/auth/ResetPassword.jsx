import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Lock } from 'lucide-react'
import { FormField, TextInput } from '../../components/forms/FormField'
import Button from '../../components/common/Button'

const schema = yup.object({
  password: yup.string().min(8, 'At least 8 characters').required('Required'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Required'),
})

const ResetPassword = () => {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: yupResolver(schema) })

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 800))
    toast.success('Password reset successfully. Please log in.')
    navigate('/login')
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-800 dark:text-ink-50">Set a new password</h1>
      <p className="text-sm text-ink-400 mt-1.5 mb-6">Choose a strong password you haven't used before.</p>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField label="New password" error={errors.password} required>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <TextInput register={register} name="password" type="password" placeholder="••••••••" error={errors.password} style={{ paddingLeft: '2.5rem' }} />
          </div>
        </FormField>
        <FormField label="Confirm new password" error={errors.confirmPassword} required>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <TextInput register={register} name="confirmPassword" type="password" placeholder="••••••••" error={errors.confirmPassword} style={{ paddingLeft: '2.5rem' }} />
          </div>
        </FormField>
        <Button type="submit" loading={isSubmitting} className="w-full">Reset password</Button>
      </form>
    </div>
  )
}

export default ResetPassword
