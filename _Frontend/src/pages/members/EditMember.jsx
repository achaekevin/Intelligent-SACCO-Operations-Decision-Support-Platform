import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { ArrowLeft } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { FormField, TextInput, SelectInput } from '../../components/forms/FormField'
import Button from '../../components/common/Button'
import EmptyState from '../../components/common/EmptyState'
import { updateMember } from '../../redux/slices/membersSlice'
import { BRANCHES } from '../../utils/mockData'

const schema = yup.object({
  name: yup.string().required('Full name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  phone: yup.string().required('Phone number is required'),
  branch: yup.string().required('Branch is required'),
  status: yup.string().required('Status is required'),
})

const EditMember = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { list } = useSelector((s) => s.members)
  const member = list.find((m) => m.id === id)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: member,
  })

  if (!member) {
    return <EmptyState title="Member not found" description="This member may have been removed." />
  }

  const onSubmit = async (data) => {
    await new Promise((r) => setTimeout(r, 600))
    dispatch(updateMember({ id, ...data }))
    toast.success('Member details updated')
    navigate(`/members/${id}`)
  }

  return (
    <div>
      <button onClick={() => navigate(`/members/${id}`)} className="flex items-center gap-1.5 text-sm text-ink-500 dark:text-ink-300 hover:text-teal-600 mb-4">
        <ArrowLeft size={15} /> Back to member
      </button>
      <PageHeader title="Edit Member" subtitle={member.memberNo} />
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="bg-white dark:bg-ink-800 rounded-2xl p-6 shadow-card border border-ink-50 dark:border-ink-700 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <FormField label="Full name" error={errors.name} required>
            <TextInput register={register} name="name" error={errors.name} />
          </FormField>
          <FormField label="Email address" error={errors.email} required>
            <TextInput register={register} name="email" type="email" error={errors.email} />
          </FormField>
          <FormField label="Phone number" error={errors.phone} required>
            <TextInput register={register} name="phone" error={errors.phone} />
          </FormField>
          <FormField label="Branch" error={errors.branch} required>
            <SelectInput register={register} name="branch" error={errors.branch} options={BRANCHES.map((b) => b.name)} />
          </FormField>
          <FormField label="Status" error={errors.status} required>
            <SelectInput register={register} name="status" error={errors.status} options={['Active', 'Dormant', 'Pending']} />
          </FormField>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <Button type="submit" loading={isSubmitting}>Save Changes</Button>
          <Button type="button" variant="outline" onClick={() => navigate(`/members/${id}`)}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}

export default EditMember
