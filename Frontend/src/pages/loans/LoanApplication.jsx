import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { Check } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { FormField, TextInput, SelectInput } from '../../components/forms/FormField'
import Button from '../../components/common/Button'
import { addLoan } from '../../redux/slices/loansSlice'
import { LOAN_TYPES } from '../../utils/mockData'
import { formatKES, classNames } from '../../utils/format'

const STEPS = ['Loan Details', 'Guarantors', 'Review & Submit']

const schema = yup.object({
  loanType: yup.string().required('Select a loan type'),
  amount: yup.number().typeError('Enter an amount').positive('Must be positive').required('Amount is required'),
  termMonths: yup.number().typeError('Enter a term').positive().integer().required('Term is required'),
  purpose: yup.string().required('Purpose is required'),
  guarantor1: yup.string().required('At least one guarantor is required'),
  guarantor2: yup.string().nullable(),
})

const LoanApplication = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { list: members } = useSelector((s) => s.members)
  const [step, setStep] = useState(0)

  const { register, handleSubmit, watch, trigger, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { termMonths: 12 },
  })

  const watched = watch()
  const selectedType = LOAN_TYPES.find((t) => t.name === watched.loanType)

  const emi = useMemo(() => {
    const principal = Number(watched.amount) || 0
    const rate = (selectedType?.interestRate || 0) / 100 / 12
    const n = Number(watched.termMonths) || 1
    if (!principal || !rate) return principal / (n || 1)
    return (principal * rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1)
  }, [watched.amount, watched.termMonths, selectedType])

  const next = async () => {
    const fieldsByStep = [
      ['loanType', 'amount', 'termMonths', 'purpose'],
      ['guarantor1'],
    ]
    const valid = await trigger(fieldsByStep[step])
    if (valid) setStep((s) => s + 1)
  }

  const onSubmit = async (data) => {
    await new Promise((r) => setTimeout(r, 800))
    dispatch(addLoan({
      id: `LN-${Date.now()}`,
      member: 'You',
      memberNo: '—',
      branch: '—',
      type: data.loanType,
      principal: Number(data.amount),
      interestRate: selectedType?.interestRate,
      termMonths: Number(data.termMonths),
      status: 'Pending',
      applicationDate: new Date().toISOString().slice(0, 10),
      guarantors: data.guarantor2 ? 2 : 1,
      balance: Number(data.amount),
    }))
    toast.success('Loan application submitted for review')
    navigate('/loans')
  }

  return (
    <div>
      <PageHeader title="New Loan Application" subtitle="Complete all steps to submit your application" />

      <div className="flex items-center gap-2 mb-6 max-w-2xl">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center flex-1">
            <div className={classNames(
              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0',
              i < step ? 'bg-success text-white' : i === step ? 'bg-teal-600 text-white' : 'bg-ink-100 dark:bg-ink-700 text-ink-400'
            )}>
              {i < step ? <Check size={14} /> : i + 1}
            </div>
            <span className={classNames('text-xs ml-2 hidden sm:inline', i === step ? 'font-semibold text-ink-800 dark:text-ink-50' : 'text-ink-400')}>{label}</span>
            {i < STEPS.length - 1 && <div className="flex-1 h-px bg-ink-200 dark:bg-ink-700 mx-3" />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="bg-white dark:bg-ink-800 rounded-2xl p-6 shadow-card border border-ink-50 dark:border-ink-700 max-w-2xl">
        {step === 0 && (
          <>
            <FormField label="Loan type" error={errors.loanType} required>
              <SelectInput register={register} name="loanType" error={errors.loanType} options={LOAN_TYPES.map((t) => t.name)} />
            </FormField>
            {selectedType && (
              <p className="text-xs text-ink-400 -mt-3 mb-4">
                Interest: {selectedType.interestRate}% p.a. · Max {formatKES(selectedType.maxAmount)} · Up to {selectedType.maxTermMonths} months
              </p>
            )}
            <FormField label="Loan amount (KES)" error={errors.amount} required>
              <TextInput register={register} name="amount" type="number" placeholder="e.g. 150000" error={errors.amount} />
            </FormField>
            <FormField label="Repayment term (months)" error={errors.termMonths} required>
              <TextInput register={register} name="termMonths" type="number" error={errors.termMonths} />
            </FormField>
            <FormField label="Purpose of loan" error={errors.purpose} required>
              <TextInput register={register} name="purpose" placeholder="e.g. School fees for Q3" error={errors.purpose} />
            </FormField>
            {watched.amount > 0 && (
              <div className="bg-teal-50 dark:bg-ink-700/40 rounded-lg p-4 mt-2">
                <p className="text-xs text-ink-500 dark:text-ink-300">Estimated Monthly Installment (EMI)</p>
                <p className="text-xl font-display font-bold text-teal-700 dark:text-gold-400">{formatKES(emi)}</p>
              </div>
            )}
          </>
        )}

        {step === 1 && (
          <>
            <p className="text-sm text-ink-500 dark:text-ink-300 mb-4">Select members to guarantee this loan.</p>
            <FormField label="Primary guarantor" error={errors.guarantor1} required>
              <SelectInput register={register} name="guarantor1" error={errors.guarantor1} options={members.slice(0, 20).map((m) => m.name)} />
            </FormField>
            <FormField label="Secondary guarantor (optional)">
              <SelectInput register={register} name="guarantor2" options={members.slice(0, 20).map((m) => m.name)} />
            </FormField>
          </>
        )}

        {step === 2 && (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-ink-50 dark:border-ink-700"><span className="text-ink-400">Loan type</span><span className="font-medium text-ink-700 dark:text-ink-100">{watched.loanType}</span></div>
            <div className="flex justify-between py-2 border-b border-ink-50 dark:border-ink-700"><span className="text-ink-400">Amount</span><span className="font-medium text-ink-700 dark:text-ink-100">{formatKES(watched.amount)}</span></div>
            <div className="flex justify-between py-2 border-b border-ink-50 dark:border-ink-700"><span className="text-ink-400">Term</span><span className="font-medium text-ink-700 dark:text-ink-100">{watched.termMonths} months</span></div>
            <div className="flex justify-between py-2 border-b border-ink-50 dark:border-ink-700"><span className="text-ink-400">Estimated EMI</span><span className="font-medium text-ink-700 dark:text-ink-100">{formatKES(emi)}</span></div>
            <div className="flex justify-between py-2 border-b border-ink-50 dark:border-ink-700"><span className="text-ink-400">Guarantor(s)</span><span className="font-medium text-ink-700 dark:text-ink-100">{[watched.guarantor1, watched.guarantor2].filter(Boolean).join(', ')}</span></div>
          </div>
        )}

        <div className="flex items-center gap-3 mt-6">
          {step > 0 && <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)}>Back</Button>}
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={next}>Continue</Button>
          ) : (
            <Button type="submit" loading={isSubmitting}>Submit Application</Button>
          )}
        </div>
      </form>
    </div>
  )
}

export default LoanApplication
