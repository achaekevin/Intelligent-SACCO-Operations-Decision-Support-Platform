import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  Search, User, Phone, CreditCard, Hash, IdCard,
  Wallet, TrendingUp, AlertCircle, Clock, ChevronRight,
  Building, Mail, Calendar, MapPin
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { formatKES, formatDate, formatNumber } from '../../utils/format';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const MemberSearch = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [memberProfile, setMemberProfile] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      toast.error('Please enter a search term');
      return;
    }

    setSearching(true);
    setSelectedMember(null);
    setMemberProfile(null);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `${API_URL}/members/search`,
        {
          params: { q: searchQuery.trim() },
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSearchResults(response.data.data || []);
      
      if (response.data.data.length === 0) {
        toast.error('No members found matching your search');
      }
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed. Please try again.');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectMember = async (member) => {
    setSelectedMember(member);
    setLoadingProfile(true);
    setMemberProfile(null);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `${API_URL}/members/${member.id}/profile`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMemberProfile(response.data.data);
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load member profile');
    } finally {
      setLoadingProfile(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
      suspended: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.inactive}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Member Search"
        subtitle="Search by member number, national ID, phone, name, or account number"
      />

      {/* Search Form */}
      <Card className="mb-6">
        <form onSubmit={handleSearch} className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter member number, ID, phone, name, or account number..."
                className="w-full pl-10 pr-4 py-3 border border-ink-300 dark:border-ink-600 rounded-lg bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-100 placeholder-ink-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <Button
              type="submit"
              loading={searching}
              icon={Search}
              className="sm:w-auto w-full"
            >
              Search
            </Button>
          </div>

          {/* Search Tips */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
              <div className="text-xs text-blue-800 dark:text-blue-300">
                <strong>Search tips:</strong> You can search by member number (e.g., MEM-0001), 
                national ID, phone number (e.g., 0712345678), full name, or savings account number (e.g., SAV-...)
              </div>
            </div>
          </div>
        </form>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search Results */}
        <div className="lg:col-span-1">
          <Card>
            <div className="p-4 border-b border-ink-200 dark:border-ink-700">
              <h3 className="font-semibold text-ink-900 dark:text-ink-100">
                Search Results
                {searchResults.length > 0 && (
                  <span className="ml-2 text-sm text-ink-500 dark:text-ink-400">
                    ({searchResults.length})
                  </span>
                )}
              </h3>
            </div>

            <div className="max-h-[600px] overflow-y-auto">
              {searchResults.length === 0 ? (
                <div className="p-8 text-center text-ink-500">
                  <Search className="mx-auto mb-3 text-ink-300" size={48} />
                  <p className="text-sm">
                    {searchQuery ? 'No members found' : 'Enter a search term to find members'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-ink-200 dark:divide-ink-700">
                  {searchResults.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => handleSelectMember(member)}
                      className={`w-full p-4 text-left hover:bg-ink-50 dark:hover:bg-ink-900/50 transition-colors ${
                        selectedMember?.id === member.id
                          ? 'bg-teal-50 dark:bg-teal-900/20 border-l-4 border-teal-500'
                          : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-semibold text-sm">
                              {member.firstName?.[0]}{member.lastName?.[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-ink-900 dark:text-ink-100 truncate">
                                {member.fullName}
                              </div>
                              <div className="text-xs text-ink-500 dark:text-ink-400">
                                {member.memberNumber}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-ink-600 dark:text-ink-400 space-y-1 mt-2">
                            <div className="flex items-center gap-1">
                              <Phone size={12} />
                              {member.phone}
                            </div>
                            {member.matchedAccount && (
                              <div className="flex items-center gap-1 text-teal-600 dark:text-teal-400">
                                <CreditCard size={12} />
                                Account: {member.matchedAccount}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {getStatusBadge(member.status)}
                          <ChevronRight className="text-ink-400" size={16} />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Member Profile */}
        <div className="lg:col-span-2">
          {!selectedMember ? (
            <Card>
              <div className="p-12 text-center text-ink-500">
                <User className="mx-auto mb-4 text-ink-300" size={64} />
                <p className="text-lg font-medium mb-2">No Member Selected</p>
                <p className="text-sm">
                  Search for and select a member to view their complete profile
                </p>
              </div>
            </Card>
          ) : loadingProfile ? (
            <Card>
              <div className="p-12 text-center">
                <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-ink-600 dark:text-ink-400">Loading profile...</p>
              </div>
            </Card>
          ) : memberProfile ? (
            <div className="space-y-6">
              {/* Profile Header */}
              <Card>
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    {/* Profile Picture */}
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
                      {memberProfile.member.firstName?.[0]}{memberProfile.member.lastName?.[0]}
                    </div>

                    {/* Member Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h2 className="text-2xl font-bold text-ink-900 dark:text-ink-100">
                            {memberProfile.member.fullName}
                          </h2>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-ink-600 dark:text-ink-400 font-mono">
                              {memberProfile.member.memberNumber}
                            </span>
                            {getStatusBadge(memberProfile.member.status)}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => navigate(`/members/${memberProfile.member.id}`)}
                        >
                          View Full Details
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                        <div className="flex items-center gap-2 text-sm text-ink-600 dark:text-ink-400">
                          <Phone size={16} />
                          {memberProfile.member.phone}
                        </div>
                        {memberProfile.member.email && (
                          <div className="flex items-center gap-2 text-sm text-ink-600 dark:text-ink-400">
                            <Mail size={16} />
                            {memberProfile.member.email}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-ink-600 dark:text-ink-400">
                          <IdCard size={16} />
                          ID: {memberProfile.member.nationalId}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-ink-600 dark:text-ink-400">
                          <Building size={16} />
                          {memberProfile.member.branch?.name || 'N/A'}
                        </div>
                        {memberProfile.member.joiningDate && (
                          <div className="flex items-center gap-2 text-sm text-ink-600 dark:text-ink-400">
                            <Calendar size={16} />
                            Joined: {formatDate(memberProfile.member.joiningDate)}
                          </div>
                        )}
                        {memberProfile.member.occupation && (
                          <div className="flex items-center gap-2 text-sm text-ink-600 dark:text-ink-400">
                            <User size={16} />
                            {memberProfile.member.occupation}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Financial Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                      <Wallet className="text-green-600" size={24} />
                    </div>
                    <div>
                      <div className="text-xs text-ink-500 dark:text-ink-400">Savings Balance</div>
                      <div className="text-lg font-bold text-ink-900 dark:text-ink-100">
                        {formatKES(memberProfile.summary.savingsBalance)}
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                      <TrendingUp className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <div className="text-xs text-ink-500 dark:text-ink-400">Share Capital</div>
                      <div className="text-lg font-bold text-ink-900 dark:text-ink-100">
                        {formatKES(memberProfile.summary.shareCapital)}
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                      <CreditCard className="text-orange-600" size={24} />
                    </div>
                    <div>
                      <div className="text-xs text-ink-500 dark:text-ink-400">Active Loans</div>
                      <div className="text-lg font-bold text-ink-900 dark:text-ink-100">
                        {memberProfile.summary.activeLoanCount}
                      </div>
                      <div className="text-xs text-ink-500 dark:text-ink-400">
                        {formatKES(memberProfile.summary.totalLoanBalance)}
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                      <AlertCircle className="text-red-600" size={24} />
                    </div>
                    <div>
                      <div className="text-xs text-ink-500 dark:text-ink-400">Loan Arrears</div>
                      <div className={`text-lg font-bold ${
                        memberProfile.summary.loanArrears > 0
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-green-600 dark:text-green-400'
                      }`}>
                        {formatKES(memberProfile.summary.loanArrears)}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Accounts */}
              {memberProfile.accounts.length > 0 && (
                <Card>
                  <div className="p-4 border-b border-ink-200 dark:border-ink-700">
                    <h3 className="font-semibold text-ink-900 dark:text-ink-100">
                      Savings Accounts
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      {memberProfile.accounts.map((account) => (
                        <div
                          key={account.id}
                          className="p-3 bg-ink-50 dark:bg-ink-900/50 rounded-lg flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium text-ink-900 dark:text-ink-100">
                              {account.accountType.replace(/_/g, ' ').toUpperCase()}
                            </div>
                            <div className="text-xs text-ink-500 dark:text-ink-400 font-mono">
                              {account.accountNumber}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-ink-900 dark:text-ink-100">
                              {formatKES(account.balance)}
                            </div>
                            <div className="text-xs text-ink-500 dark:text-ink-400">
                              {account.status}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}

              {/* Active Loans */}
              {memberProfile.loans.length > 0 && (
                <Card>
                  <div className="p-4 border-b border-ink-200 dark:border-ink-700">
                    <h3 className="font-semibold text-ink-900 dark:text-ink-100">
                      Loans ({memberProfile.loans.length})
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-ink-50 dark:bg-ink-900/50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-ink-600 dark:text-ink-400">
                            Loan Number
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-ink-600 dark:text-ink-400">
                            Type
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-ink-600 dark:text-ink-400">
                            Principal
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-ink-600 dark:text-ink-400">
                            Balance
                          </th>
                          <th className="px-4 py-2 text-center text-xs font-semibold text-ink-600 dark:text-ink-400">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink-200 dark:divide-ink-700">
                        {memberProfile.loans.map((loan) => (
                          <tr key={loan.id} className="hover:bg-ink-50 dark:hover:bg-ink-900/30">
                            <td className="px-4 py-3 text-sm font-mono text-ink-900 dark:text-ink-100">
                              {loan.loanNumber}
                            </td>
                            <td className="px-4 py-3 text-sm text-ink-600 dark:text-ink-400">
                              {loan.loanType}
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-ink-900 dark:text-ink-100">
                              {formatKES(loan.principalAmount)}
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-semibold text-ink-900 dark:text-ink-100">
                              {formatKES(loan.outstandingBalance)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                loan.status === 'disbursed'
                                  ? loan.isOverdue
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                  : loan.status === 'paid'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                              }`}>
                                {loan.isOverdue ? 'Overdue' : loan.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              {/* Recent Transactions */}
              {memberProfile.recentTransactions.length > 0 && (
                <Card>
                  <div className="p-4 border-b border-ink-200 dark:border-ink-700">
                    <h3 className="font-semibold text-ink-900 dark:text-ink-100">
                      Recent Transactions
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-ink-50 dark:bg-ink-900/50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-ink-600 dark:text-ink-400">
                            Date
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-ink-600 dark:text-ink-400">
                            Reference
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-ink-600 dark:text-ink-400">
                            Type
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-ink-600 dark:text-ink-400">
                            Amount
                          </th>
                          <th className="px-4 py-2 text-center text-xs font-semibold text-ink-600 dark:text-ink-400">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink-200 dark:divide-ink-700">
                        {memberProfile.recentTransactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-ink-50 dark:hover:bg-ink-900/30">
                            <td className="px-4 py-3 text-xs text-ink-600 dark:text-ink-400">
                              {formatDate(tx.createdAt)}
                            </td>
                            <td className="px-4 py-3 text-xs font-mono text-ink-900 dark:text-ink-100">
                              {tx.reference}
                            </td>
                            <td className="px-4 py-3 text-xs">
                              <span className={`px-2 py-1 rounded-full font-semibold ${
                                tx.type === 'deposit'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                  : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                              }`}>
                                {tx.type}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-semibold">
                              <span className={
                                tx.type === 'deposit'
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-orange-600 dark:text-orange-400'
                              }>
                                {tx.type === 'deposit' ? '+' : '-'}{formatKES(tx.amount)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                tx.status === 'completed'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                  : tx.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              }`}>
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default MemberSearch;
