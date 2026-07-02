import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Sidebar from '../components/sidebar/Sidebar'
import Navbar from '../components/navbar/Navbar'
import Footer from '../components/common/Footer'
import { useSessionTimeout } from '../hooks/useSessionTimeout'

const DashboardLayout = () => {
  const { theme } = useSelector((s) => s.ui)
  useSessionTimeout()

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="flex min-h-screen bg-cream dark:bg-ink-900">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar />
          <main className="flex-1 p-4 lg:p-6">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3500} theme={theme} />
    </div>
  )
}

export default DashboardLayout
