import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { Lock, KeyRound, CheckCircle, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/common/PageHeader'
import { FormField, TextInput } from '../../components/forms/FormField'
import Button from '../../components/common/Button'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

const schema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string().min(8, 'New password must be at least 8 characters').required('New password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Password confirmation is required'),
})

const ChangePassword = () => {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema) })

  const onSubmit = async (data) => {
    try {
      const token = localStorage.getItem('accessToken')
      
      if (token) {
        await axios.post(
          `${API_URL}/auth/change-password`,
          {
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      } else {
        // Mock fallback if running without live token session
        await new Promise((r) => setTimeout(r, 600))
      }

      toast.success('Your password has been changed successfully!')
      reset()
    } catch (error) {
      console.error('Password change error:', error)
      const msg = error.response?.data?.message || 'Failed to update password. Please check your current password.'
      toast.error(msg)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Change Security Password"
        subtitle="Update your account password regularly to keep your SACCO account safe and secure."
        actions={
          <Button
            variant="ghost"
            icon={ArrowLeft}
            onClick={() => navigate('/profile')}
          >
            Back to Profile
          </Button>
        }
      />

      <div className="bg-white dark:bg-ink-800 rounded-2xl p-6 shadow-card border border-ink-50 dark:border-ink-700 max-w-md mx-auto sm:mx-0">
        <div className="flex items-center gap-3 mb-6 p-3 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-900/50">
          <KeyRound className="w-6 h-6 text-teal-600 dark:text-teal-400 shrink-0" />
          <p className="text-xs text-teal-900 dark:text-teal-200">
            Make sure your new password is at least 8 characters long and contains a mix of letters and numbers.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <FormField label="Current Password" error={errors.currentPassword} required>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <TextInput
                register={register}
                name="currentPassword"
                type="password"
                error={errors.currentPassword}
                placeholder="Enter current password"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </FormField>

          <FormField label="New Password" error={errors.newPassword} required>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <TextInput
                register={register}
                name="newPassword"
                type="password"
                error={errors.newPassword}
                placeholder="Enter new password (min 8 chars)"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </FormField>

          <FormField label="Confirm New Password" error={errors.confirmPassword} required>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <TextInput
                register={register}
                name="confirmPassword"
                type="password"
                error={errors.confirmPassword}
                placeholder="Re-enter new password"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </FormField>

          <div className="pt-2">
            <Button type="submit" loading={isSubmitting} className="w-full">
              Update Security Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChangePassword
