import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { Camera } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { FormField, TextInput, SelectInput } from '../../components/forms/FormField'
import Button from '../../components/common/Button'
import { fetchMembers } from '../../redux/slices/membersSlice'
import { BRANCHES } from '../../utils/mockData'
import axios from 'axios'

const schema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  phone: yup.string().required('Phone number is required'),
  nationalId: yup.string().required('National ID is required'),
  dateOfBirth: yup.string().required('Date of birth is required'),
  address: yup.string().required('Address is required'),
})

const RegisterMember = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data) => {
    try {
      const token = localStorage.getItem('accessToken')
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/members`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success('Member registered successfully!')
      // Refresh member list
      dispatch(fetchMembers())
      navigate('/members')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register member')
    }
  }

  return (
    <div>
      <PageHeader title="Register Member" subtitle="Add a new member to the SACCO" />
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="bg-white dark:bg-ink-800 rounded-2xl p-6 shadow-card border border-ink-50 dark:border-ink-700 max-w-3xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-ink-100 dark:bg-ink-700 flex items-center justify-center">
            <Camera size={22} className="text-ink-400" />
          </div>
          <div>
            <Button type="button" variant="outline">Upload Photo</Button>
            <p className="text-xs text-ink-400 mt-1.5">JPG or PNG, max 2MB</p>
          </div>
        </div>

        <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-3">Personal Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <FormField label="First name" error={errors.firstName} required>
            <TextInput register={register} name="firstName" placeholder="e.g. Mary" error={errors.firstName} />
          </FormField>
          <FormField label="Last name" error={errors.lastName} required>
            <TextInput register={register} name="lastName" placeholder="e.g. Wanjiru" error={errors.lastName} />
          </FormField>
          <FormField label="Email address" error={errors.email} required>
            <TextInput register={register} name="email" type="email" placeholder="member@email.com" error={errors.email} />
          </FormField>
          <FormField label="Phone number" error={errors.phone} required>
            <TextInput register={register} name="phone" placeholder="+254 7XX XXX XXX" error={errors.phone} />
          </FormField>
          <FormField label="National ID number" error={errors.nationalId} required>
            <TextInput register={register} name="nationalId" placeholder="e.g. 30123456" error={errors.nationalId} />
          </FormField>
          <FormField label="Date of Birth" error={errors.dateOfBirth} required>
            <TextInput register={register} name="dateOfBirth" type="date" error={errors.dateOfBirth} />
          </FormField>
        </div>

        <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-3 mt-2">Address</h3>
        <div className="grid grid-cols-1 gap-x-4">
          <FormField label="Physical address" error={errors.address} required>
            <textarea
              {...register('address')}
              rows="3"
              placeholder="Enter physical address"
              className="w-full bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-600 rounded-lg px-3 py-2 text-sm text-ink-800 dark:text-ink-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            {errors.address && <p className="text-xs text-danger mt-1">{errors.address.message}</p>}
          </FormField>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <Button type="submit" loading={isSubmitting}>Register Member</Button>
          <Button type="button" variant="outline" onClick={() => navigate('/members')}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}

export default RegisterMember
