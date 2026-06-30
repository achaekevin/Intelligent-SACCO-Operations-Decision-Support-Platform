import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import Button from '../components/common/Button'

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-cream dark:bg-ink-900 text-center px-6">
    <Compass size={40} className="text-gold-400 mb-4" />
    <h1 className="text-4xl font-display font-bold text-ink-800 dark:text-ink-50">404</h1>
    <p className="text-ink-400 mt-2 mb-6">The page you're looking for doesn't exist.</p>
    <Link to="/dashboard"><Button>Back to Dashboard</Button></Link>
  </div>
)

export default NotFound
