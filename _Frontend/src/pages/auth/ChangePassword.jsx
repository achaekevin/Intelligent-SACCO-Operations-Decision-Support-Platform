import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { toast } from 'react-toastify'
import { Lock } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { FormField, TextInput } from '../../components/forms/FormField'
import Button from '../../components/common/Button'

const schema = yup.object({
  currentPassword: yup.string().required('Required'),
  newPassword: yup.string().min(8, 'At least 8 characters').required('Required'),
  confirmPassword: yup.string().oneOf([yup.ref('newPassword')], 'Passwords must match').required('Required'),
})

const ChangePassword = () => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ resolver: yupResolver(schema) })

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 700))
    toast.success('Password updated successfully')
    reset()
  }

  return (
    <div>
      <PageHeader title="Change Password" subtitle="Update your account password regularly to keep your account secure." />
      <div className="bg-white dark:bg-ink-800 rounded-2xl p-6 shadow-card border border-ink-50 dark:border-ink-700 max-w-md">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormField label="Current password" error={errors.currentPassword} required>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <TextInput register={register} name="currentPassword" type="password" error={errors.currentPassword} style={{ paddingLeft: '2.5rem' }} />
            </div>
          </FormField>
          <FormField label="New password" error={errors.newPassword} required>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <TextInput register={register} name="newPassword" type="password" error={errors.newPassword} style={{ paddingLeft: '2.5rem' }} />
            </div>
          </FormField>
          <FormField label="Confirm new password" error={errors.confirmPassword} required>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <TextInput register={register} name="confirmPassword" type="password" error={errors.confirmPassword} style={{ paddingLeft: '2.5rem' }} />
            </div>
          </FormField>
          <Button type="submit" loading={isSubmitting}>Update password</Button>
        </form>
      </div>
    </div>
  )
}

export default ChangePassword
