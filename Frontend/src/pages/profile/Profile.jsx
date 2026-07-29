import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useDispatch } from 'react-redux'
import { toast } from 'react-hot-toast'
import { Camera, Lock, UserCheck, Mail, Phone, KeyRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/common/PageHeader'
import { FormField, TextInput } from '../../components/forms/FormField'
import Button from '../../components/common/Button'
import { useAuth } from '../../hooks/useAuth'
import { updateProfile, updateProfileState } from '../../redux/slices/authSlice'
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
  const navigate = useNavigate()

  const displayName = user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.username || 'User'
  const userRoleLabel = ROLE_LABELS[user?.role] || user?.role || 'SACCO System User'

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { 
      name: displayName, 
      email: user?.email || '', 
      phone: user?.phone || '' 
    },
  })

  const onSubmit = async (data) => {
    try {
      const nameParts = data.name.trim().split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''
      
      const updatePayload = {
        firstName,
        lastName,
        name: data.name.trim(),
        email: data.email,
        phone: data.phone,
      }

      try {
        await dispatch(updateProfile(updatePayload))
      } catch (err) {
        // Fallback update local state if backend API offline
        dispatch(updateProfileState(updatePayload))
      }

      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Profile update failed:', error)
      toast.error('Failed to update profile details')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My User Account Profile"
        subtitle="Manage your personal information, role details, and security credentials."
        actions={
          <Button
            variant="outline"
            icon={KeyRound}
            onClick={() => navigate('/profile/change-password')}
          >
            Change Login Password
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Card Profile Summary */}
        <div className="bg-white dark:bg-ink-800 rounded-2xl p-6 shadow-card border border-ink-50 dark:border-ink-700 text-center space-y-4">
          <div className="relative w-24 h-24 rounded-full bg-teal-600 text-white flex items-center justify-center text-3xl font-bold mx-auto shadow-md">
            {initials(displayName)}
          </div>

          <div>
            <h3 className="font-bold text-lg text-ink-800 dark:text-ink-50">{displayName}</h3>
            <span className="inline-block px-3 py-1 mt-1 text-xs font-semibold rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300">
              {userRoleLabel}
            </span>
          </div>

          <div className="text-left text-xs text-ink-400 dark:text-ink-300 space-y-2 pt-4 border-t border-ink-100 dark:border-ink-700">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-teal-500" />
              <span className="truncate">{user?.email || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-teal-500" />
              <span>{user?.phone || 'No phone set'}</span>
            </div>
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-teal-500" />
              <span>Status: Active Account</span>
            </div>
          </div>
        </div>

        {/* Profile Update Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="lg:col-span-2 bg-white dark:bg-ink-800 rounded-2xl p-6 shadow-card border border-ink-50 dark:border-ink-700 space-y-6"
        >
          <div>
            <h3 className="text-base font-bold text-ink-800 dark:text-ink-50">Personal Information</h3>
            <p className="text-xs text-ink-400">Update your account display name, email, and phone contact details.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Full Name" error={errors.name} required>
              <TextInput register={register} name="name" error={errors.name} placeholder="e.g. John Doe" />
            </FormField>

            <FormField label="Email Address" error={errors.email} required>
              <TextInput register={register} name="email" type="email" error={errors.email} placeholder="name@sacco.com" />
            </FormField>

            <FormField label="Phone Number" error={errors.phone}>
              <TextInput register={register} name="phone" error={errors.phone} placeholder="+254 7XX XXX XXX" />
            </FormField>

            <FormField label="System Role">
              <TextInput value={userRoleLabel} disabled className="bg-ink-50 dark:bg-ink-900 cursor-not-allowed opacity-75" />
            </FormField>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-ink-100 dark:border-ink-700">
            <Button type="submit" loading={isSubmitting}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Profile
