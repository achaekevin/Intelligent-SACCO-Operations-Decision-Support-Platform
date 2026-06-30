import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import Button from '../components/common/Button'

const Unauthorized = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-cream dark:bg-ink-900 text-center px-6">
    <ShieldAlert size={40} className="text-danger mb-4" />
    <h1 className="text-2xl font-display font-bold text-ink-800 dark:text-ink-50">Access Restricted</h1>
    <p className="text-ink-400 mt-2 mb-6">Your role doesn't have permission to view this page.</p>
    <Link to="/dashboard"><Button>Back to Dashboard</Button></Link>
  </div>
)

export default Unauthorized
