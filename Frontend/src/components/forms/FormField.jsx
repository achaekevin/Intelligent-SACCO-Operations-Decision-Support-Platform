export const FormField = ({ label, error, children, required }) => (
  <div className="mb-4">
    {label && (
      <label className="block text-sm font-medium text-ink-600 dark:text-ink-200 mb-1.5">
        {label} {required && <span className="text-danger">*</span>}
      </label>
    )}
    {children}
    {error && <p className="text-xs text-danger mt-1">{error.message}</p>}
  </div>
)

const baseInputClass =
  'w-full px-3.5 py-2.5 rounded-lg border bg-white dark:bg-ink-700/40 text-sm text-ink-700 dark:text-ink-100 placeholder:text-ink-400 outline-none transition-all duration-200 hover:border-ink-300 dark:hover:border-ink-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900'

export const TextInput = ({ register, name, error, ...rest }) => (
  <input
    {...(register ? register(name) : {})}
    className={`${baseInputClass} ${error ? 'border-danger' : 'border-ink-200 dark:border-ink-600'}`}
    {...rest}
  />
)

export const SelectInput = ({ register, name, error, options = [], placeholder = 'Select...', ...rest }) => (
  <select
    {...(register ? register(name) : {})}
    className={`${baseInputClass} ${error ? 'border-danger' : 'border-ink-200 dark:border-ink-600'}`}
    {...rest}
  >
    <option value="">{placeholder}</option>
    {options.map((opt) => (
      <option key={opt.value ?? opt} value={opt.value ?? opt}>
        {opt.label ?? opt}
      </option>
    ))}
  </select>
)

export const TextArea = ({ register, name, error, rows = 4, ...rest }) => (
  <textarea
    {...(register ? register(name) : {})}
    rows={rows}
    className={`${baseInputClass} ${error ? 'border-danger' : 'border-ink-200 dark:border-ink-600'}`}
    {...rest}
  />
)
