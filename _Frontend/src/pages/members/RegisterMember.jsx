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
import { addMember } from '../../redux/slices/membersSlice'
import { BRANCHES } from '../../utils/mockData'

const schema = yup.object({
  name: yup.string().required('Full name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  phone: yup.string().required('Phone number is required'),
  idNumber: yup.string().required('ID number is required'),
  branch: yup.string().required('Branch is required'),
  joinDate: yup.string().required('Join date is required'),
  nextOfKin: yup.string().required('Next of kin is required'),
  beneficiary: yup.string().required('Beneficiary is required'),
})

const RegisterMember = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { joinDate: new Date().toISOString().slice(0, 10) },
  })

  const onSubmit = async (data) => {
    await new Promise((r) => setTimeout(r, 700))
    dispatch(addMember({
      id: `MB-${Date.now()}`,
      memberNo: `AM${Math.floor(20000 + Math.random() * 9999)}`,
      status: 'Pending',
      savings: 0,
      shareCapital: 0,
      activeLoans: 0,
      avatar: null,
      ...data,
    }))
    toast.success('Member registered successfully')
    navigate('/members')
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
          <FormField label="Full name" error={errors.name} required>
            <TextInput register={register} name="name" placeholder="e.g. Mary Wanjiru" error={errors.name} />
          </FormField>
          <FormField label="National ID number" error={errors.idNumber} required>
            <TextInput register={register} name="idNumber" placeholder="e.g. 30123456" error={errors.idNumber} />
          </FormField>
          <FormField label="Email address" error={errors.email} required>
            <TextInput register={register} name="email" type="email" placeholder="member@email.com" error={errors.email} />
          </FormField>
          <FormField label="Phone number" error={errors.phone} required>
            <TextInput register={register} name="phone" placeholder="+254 7XX XXX XXX" error={errors.phone} />
          </FormField>
        </div>

        <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-3 mt-2">Membership Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <FormField label="Branch" error={errors.branch} required>
            <SelectInput register={register} name="branch" error={errors.branch} options={BRANCHES.map((b) => b.name)} placeholder="Select branch" />
          </FormField>
          <FormField label="Join date" error={errors.joinDate} required>
            <TextInput register={register} name="joinDate" type="date" error={errors.joinDate} />
          </FormField>
        </div>

        <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-3 mt-2">Next of Kin &amp; Beneficiary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <FormField label="Next of kin full name" error={errors.nextOfKin} required>
            <TextInput register={register} name="nextOfKin" placeholder="Full name" error={errors.nextOfKin} />
          </FormField>
          <FormField label="Beneficiary full name" error={errors.beneficiary} required>
            <TextInput register={register} name="beneficiary" placeholder="Full name" error={errors.beneficiary} />
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
