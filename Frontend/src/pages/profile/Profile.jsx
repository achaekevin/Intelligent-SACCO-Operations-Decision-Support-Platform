import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { Camera } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { FormField, TextInput } from '../../components/forms/FormField'
import Button from '../../components/common/Button'
import { useAuth } from '../../hooks/useAuth'
import { updateProfile } from '../../redux/slices/authSlice'
import { ROLE_LABELS } from '../../constants/roles'
import { initials } from '../../utils/format'

const schema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  phone: yup.string().nullable(),
})

const Profile = () => {
  const { user } = useAuth()
  const dispatch = useDispatch()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { 
      name: user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim(), 
      email: user?.email, 
      phone: user?.phone || '' 
    },
  })

  const onSubmit = async (data) => {
    try {
      // Split name into firstName and lastName
      const nameParts = data.name.trim().split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''
      
      await dispatch(updateProfile({
        firstName,
        lastName,
        phone: data.phone,
      }))
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error(error.message || 'Failed to update profile')
    }
  }

  return (
    <div>
      <PageHeader title="My Profile" subtitle="View and update your personal information" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-ink-800 rounded-2xl p-6 shadow-card border border-ink-50 dark:border-ink-700 text-center">
          <div className="w-20 h-20 rounded-full bg-teal-600 text-white flex items-center justify-center text-2xl font-semibold mx-auto mb-3">
            {initials(user?.name || 'U')}
          </div>
          <h3 className="font-semibold text-ink-800 dark:text-ink-50">{user?.name}</h3>
          <p className="text-sm text-ink-400">{ROLE_LABELS[user?.role]}</p>
          <p className="text-xs text-ink-300 mt-1">{user?.branch}</p>
          <Button variant="outline" icon={Camera} className="w-full mt-4">Change Photo</Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="lg:col-span-2 bg-white dark:bg-ink-800 rounded-2xl p-6 shadow-card border border-ink-50 dark:border-ink-700">
          <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-3">Personal Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <FormField label="Full name" error={errors.name} required>
              <TextInput register={register} name="name" error={errors.name} />
            </FormField>
            <FormField label="Email address" error={errors.email} required>
              <TextInput register={register} name="email" type="email" error={errors.email} />
            </FormField>
            <FormField label="Phone number" error={errors.phone}>
              <TextInput register={register} name="phone" error={errors.phone} />
            </FormField>
            <FormField label="Role">
              <TextInput value={ROLE_LABELS[user?.role]} disabled />
            </FormField>
          </div>
          <Button type="submit" loading={isSubmitting}>Save Changes</Button>
        </form>
      </div>
    </div>
  )
}

export default Profile
