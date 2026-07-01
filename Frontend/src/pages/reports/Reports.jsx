import { useState } from 'react'
import { 
  FileText, Download, Calendar, Filter, TrendingUp,
  Users, DollarSign, CreditCard, Receipt, FileBarChart
} from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import { toast } from 'react-hot-toast'
import api from '../../services/api'

const Reports = () => {
  const [loading, setLoading] = useState({})
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    branchId: '',
    accountType: '',
    type: ''
  })

  const handleDownload = async (reportType, format) => {
    const key = `${reportType}-${format}`
    try {
      setLoading({ ...loading, [key]: true })
      
      // Build query params
      const params = new URLSearchParams()
      params.append('format', format)
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await api.get(`/api/v1/reports/${reportType}?${params.toString()}`, {
        responseType: format === 'json' ? 'json' : 'blob'
      })

      if (format === 'json') {
        toast.success('Report generated successfully')
        console.log('Report data:', response.data)
        // You could display this in a modal or table
      } else {
        // Download file
        const blob = new Blob([response.data], {
          type: format === 'pdf' ? 'application/pdf' : 
                format === 'csv' ? 'text/csv' : 
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${reportType}-report-${Date.now()}.${format}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        toast.success(`${reportType} report downloaded`)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to generate ${reportType} report`)
      console.error(error)
    } finally {
      setLoading({ ...loading, [key]: false })
    }
  }

  const handleMemberStatement = async (format) => {
    const key = `statement-${format}`
    try {
      setLoading({ ...loading, [key]: true })
      
      const params = new URLSearchParams()
      params.append('format', format)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)

      const response = await api.get(`/api/v1/reports/statement?${params.toString()}`, {
        responseType: format === 'json' ? 'json' : 'blob'
      })

      if (format === 'json') {
        toast.success('Statement generated successfully')
        console.log('Statement data:', response.data)
      } else {
        const blob = new Blob([response.data], { type: 'application/pdf' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `member-statement-${Date.now()}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        toast.success('Statement downloaded')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate statement')
    } finally {
      setLoading({ ...loading, [key]: false })
    }
  }

  const handleFinancialReport = async () => {
    try {
      setLoading({ ...loading, financial: true })
      
      const params = new URLSearchParams()
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)

      const response = await api.get(`/api/v1/reports/financial?${params.toString()}`)
      
      toast.success('Financial report generated')
      console.log('Financial report:', response.data)
      // Display in a modal or separate view
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate financial report')
    } finally {
      setLoading({ ...loading, financial: false })
    }
  }

  const reports = [
    {
      id: 'members',
      title: 'Members Report',
      description: 'Comprehensive member data including contact info, status, and loyalty tiers',
      icon: Users,
      color: 'blue',
      formats: ['json', 'csv', 'excel', 'pdf'],
      filters: ['startDate', 'endDate', 'status', 'branchId']
    },
    {
      id: 'savings',
      title: 'Savings Report',
      description: 'All savings accounts with balances, interest rates, and account types',
      icon: DollarSign,
      color: 'green',
      formats: ['json', 'csv', 'excel'],
      filters: ['accountType', 'status', 'branchId']
    },
    {
      id: 'loans',
      title: 'Loans Report',
      description: 'Loan portfolio overview with balances, rates, and repayment status',
      icon: CreditCard,
      color: 'purple',
      formats: ['json', 'csv', 'excel', 'pdf'],
      filters: ['startDate', 'endDate', 'status', 'branchId']
    },
    {
      id: 'transactions',
      title: 'Transactions Report',
      description: 'Detailed transaction history with amounts, types, and payment methods',
      icon: Receipt,
      color: 'orange',
      formats: ['json', 'csv'],
      filters: ['startDate', 'endDate', 'type']
    },
  ]

  return (
    <div>
      <PageHeader 
        title="Reports & Analytics" 
        subtitle="Generate comprehensive reports in multiple formats"
      />

      {/* Date Range Filter */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Report Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Filter
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Member Statement Card */}
      <Card className="mb-6 bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              My Member Statement
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Personalized statement showing savings, loans, and transaction history
            </p>
            
            <div className="flex gap-3">
              <Button
                size="sm"
                onClick={() => handleMemberStatement('json')}
                disabled={loading['statement-json']}
              >
                {loading['statement-json'] ? 'Generating...' : 'View Statement'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleMemberStatement('pdf')}
                disabled={loading['statement-pdf']}
              >
                <Download className="w-4 h-4 mr-2" />
                {loading['statement-pdf'] ? 'Downloading...' : 'Download PDF'}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Financial Report Card */}
      <Card className="mb-6 bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileBarChart className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Financial Summary Report
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Comprehensive financial overview: deposits, withdrawals, loans, repayments, and balances
            </p>
            
            <Button
              size="sm"
              onClick={handleFinancialReport}
              disabled={loading.financial}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              {loading.financial ? 'Generating...' : 'Generate Financial Report'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => {
          const Icon = report.icon
          const colorClasses = {
            blue: 'bg-blue-100 text-blue-600',
            green: 'bg-green-100 text-green-600',
            purple: 'bg-purple-100 text-purple-600',
            orange: 'bg-orange-100 text-orange-600',
          }

          return (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 ${colorClasses[report.color]} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {report.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {report.description}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-xs text-gray-500 mb-3">Export formats:</p>
                <div className="flex flex-wrap gap-2">
                  {report.formats.map((format) => (
                    <Button
                      key={format}
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(report.id, format)}
                      disabled={loading[`${report.id}-${format}`]}
                    >
                      <Download className="w-3 h-3 mr-2" />
                      {loading[`${report.id}-${format}`] ? 'Loading...' : format.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Info Card */}
      <Card className="mt-6 bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Report Tips</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Use date filters to generate reports for specific periods</li>
              <li>• PDF reports are best for printing and sharing</li>
              <li>• CSV/Excel formats are ideal for further data analysis</li>
              <li>• JSON format provides raw data for API integration</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default Reports
