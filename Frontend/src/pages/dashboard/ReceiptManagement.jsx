import { useState, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  FileText, Printer, Download, Mail, Search, Calendar,
  User, DollarSign, Hash, RefreshCcw, X, CheckCircle
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { formatKES, formatDateTime } from '../../utils/format';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const ReceiptManagement = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [receipts, setReceipts] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [receiptData, setReceiptData] = useState(null);
  const [loadingReceipt, setLoadingReceipt] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const receiptRef = useRef(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error('Please enter a reference number');
      return;
    }

    setSearching(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `${API_URL}/transactions/search`,
        {
          params: { reference: searchQuery.trim() },
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const results = response.data.data || [];
      setReceipts(results);

      if (results.length === 0) {
        toast.error('No receipts found');
      } else if (results.length === 1) {
        handleSelectReceipt(results[0]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed');
      setReceipts([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectReceipt = async (receipt) => {
    setSelectedReceipt(receipt);
    setLoadingReceipt(true);

    try {
      const token = localStorage.getItem('accessToken');
      const endpoint = receipt.type === 'loan_repayment' 
        ? `/loans/repayments/${receipt.id}/receipt`
        : `/savings/transactions/${receipt.id}/receipt`;

      const response = await axios.get(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setReceiptData(response.data.data);
    } catch (error) {
      console.error('Failed to load receipt:', error);
      toast.error('Failed to load receipt details');
      setReceiptData(null);
    } finally {
      setLoadingReceipt(false);
    }
  };

  const handlePrint = () => {
    if (!receiptRef.current) return;

    const printWindow = window.open('', '_blank');
    const receiptHtml = receiptRef.current.innerHTML;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${receiptData?.receipt?.reference}</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              padding: 20px;
              max-width: 400px;
              margin: 0 auto;
            }
            .receipt-header {
              text-align: center;
              border-bottom: 2px dashed #000;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            .receipt-row {
              display: flex;
              justify-content: space-between;
              padding: 5px 0;
            }
            .receipt-amount {
              font-size: 20px;
              font-weight: bold;
              text-align: center;
              padding: 15px 0;
              border-top: 2px dashed #000;
              border-bottom: 2px dashed #000;
              margin: 15px 0;
            }
            .receipt-footer {
              text-align: center;
              margin-top: 20px;
              padding-top: 10px;
              border-top: 2px dashed #000;
              font-size: 12px;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          ${receiptHtml}
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
    toast.success('Receipt sent to printer');
  };

  const handleDownloadPDF = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const endpoint = selectedReceipt.type === 'loan_repayment' 
        ? `/loans/repayments/${selectedReceipt.id}/receipt/pdf`
        : `/savings/transactions/${selectedReceipt.id}/receipt/pdf`;

      const response = await axios.get(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${receiptData?.receipt?.reference}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Receipt downloaded successfully');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download PDF');
    }
  };

  const handleEmailReceipt = async () => {
    if (!emailAddress.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const endpoint = selectedReceipt.type === 'loan_repayment' 
        ? `/loans/repayments/${selectedReceipt.id}/receipt/email`
        : `/savings/transactions/${selectedReceipt.id}/receipt/email`;

      await axios.post(
        `${API_URL}${endpoint}`,
        { email: emailAddress },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Receipt sent to ${emailAddress}`);
      setShowEmailModal(false);
      setEmailAddress('');
    } catch (error) {
      console.error('Email failed:', error);
      toast.error('Failed to send email');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-ink-800 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-ink-200 dark:border-ink-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-ink-900 dark:text-ink-100 flex items-center gap-2">
              <FileText size={24} className="text-teal-600" />
              Receipt Management
            </h2>
            <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">
              Search, print, download, and email receipts
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-ink-100 dark:hover:bg-ink-700 rounded-lg transition-colors"
          >
            <X size={24} className="text-ink-600 dark:text-ink-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left - Search & Results */}
            <div className="space-y-4">
              {/* Search */}
              <Card>
                <div className="p-4">
                  <h3 className="font-semibold text-ink-900 dark:text-ink-100 mb-3 flex items-center gap-2">
                    <Search size={18} />
                    Search Receipt
                  </h3>
                  <form onSubmit={handleSearch} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-2">
                        Reference Number
                      </label>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="TXN-20260703-001 or Member name"
                        className="w-full px-4 py-2.5 border border-ink-300 dark:border-ink-600 rounded-lg bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-100 focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <Button
                      type="submit"
                      loading={searching}
                      icon={Search}
                      className="w-full"
                    >
                      Search
                    </Button>
                  </form>
                </div>
              </Card>

              {/* Search Results */}
              {receipts.length > 0 && (
                <Card>
                  <div className="p-4">
                    <h3 className="font-semibold text-ink-900 dark:text-ink-100 mb-3">
                      Search Results ({receipts.length})
                    </h3>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {receipts.map((receipt) => (
                        <button
                          key={receipt.id}
                          onClick={() => handleSelectReceipt(receipt)}
                          className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                            selectedReceipt?.id === receipt.id
                              ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                              : 'border-ink-200 dark:border-ink-700 hover:border-teal-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-mono text-sm font-semibold text-ink-900 dark:text-ink-100">
                                {receipt.reference}
                              </div>
                              <div className="text-xs text-ink-500 dark:text-ink-400 mt-1">
                                {receipt.memberName || receipt.member?.name}
                              </div>
                              <div className="text-xs text-ink-400 dark:text-ink-500 mt-0.5">
                                {formatDateTime(receipt.createdAt || receipt.date)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-teal-600 dark:text-teal-400">
                                {formatKES(receipt.amount)}
                              </div>
                              <div className="text-xs text-ink-500 mt-0.5">
                                {receipt.type}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Right - Receipt Preview & Actions */}
            <div>
              {!selectedReceipt ? (
                <Card>
                  <div className="p-12 text-center text-ink-500">
                    <FileText className="mx-auto mb-4 text-ink-300" size={64} />
                    <p className="font-medium">No Receipt Selected</p>
                    <p className="text-sm">Search and select a receipt to view details</p>
                  </div>
                </Card>
              ) : loadingReceipt ? (
                <Card>
                  <div className="p-12 text-center">
                    <RefreshCcw className="animate-spin mx-auto mb-4 text-teal-600" size={48} />
                    <p className="text-ink-600 dark:text-ink-400">Loading receipt...</p>
                  </div>
                </Card>
              ) : receiptData ? (
                <>
                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <Button
                      icon={Printer}
                      onClick={handlePrint}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Print
                    </Button>
                    <Button
                      icon={Download}
                      onClick={handleDownloadPDF}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Download PDF
                    </Button>
                    <Button
                      icon={Mail}
                      onClick={() => setShowEmailModal(true)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Email Receipt
                    </Button>
                    <Button
                      icon={RefreshCcw}
                      onClick={() => handleSelectReceipt(selectedReceipt)}
                      variant="outline"
                    >
                      Reprint
                    </Button>
                  </div>

                  {/* Receipt Preview */}
                  <Card>
                    <div className="p-6 bg-ink-50 dark:bg-ink-900/50">
                      <div ref={receiptRef} className="bg-white dark:bg-ink-800 p-8 rounded-lg max-w-md mx-auto">
                        {/* Receipt Header */}
                        <div className="text-center border-b-2 border-dashed border-ink-300 pb-4 mb-6">
                          <div className="text-2xl font-bold text-ink-900 dark:text-ink-100 mb-2">
                            {receiptData?.organization?.name || 'Imara SACCO'}
                          </div>
                          {receiptData?.organization?.address && (
                            <div className="text-sm text-ink-600 dark:text-ink-400">
                              {receiptData.organization.address}
                            </div>
                          )}
                          {receiptData?.organization?.phone && (
                            <div className="text-sm text-ink-600 dark:text-ink-400">
                              Tel: {receiptData.organization.phone}
                            </div>
                          )}
                        </div>

                        {/* Receipt Type */}
                        <div className="text-center mb-6">
                          <div className="inline-block px-4 py-2 bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 rounded-lg font-semibold">
                            {receiptData?.receipt?.type.toUpperCase()} RECEIPT
                          </div>
                        </div>

                        {/* Receipt Details */}
                        <div className="space-y-3 mb-6">
                          <div className="flex justify-between py-2 border-b border-ink-200 dark:border-ink-700">
                            <span className="text-ink-600 dark:text-ink-400">Receipt No:</span>
                            <span className="font-mono font-semibold text-ink-900 dark:text-ink-100">
                              {receiptData?.receipt?.reference}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-ink-200 dark:border-ink-700">
                            <span className="text-ink-600 dark:text-ink-400">Date & Time:</span>
                            <span className="font-medium text-ink-900 dark:text-ink-100">
                              {formatDateTime(receiptData?.receipt?.date)}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-ink-200 dark:border-ink-700">
                            <span className="text-ink-600 dark:text-ink-400">Member:</span>
                            <span className="font-medium text-ink-900 dark:text-ink-100">
                              {receiptData?.member?.name}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-ink-200 dark:border-ink-700">
                            <span className="text-ink-600 dark:text-ink-400">Member No:</span>
                            <span className="font-mono text-ink-900 dark:text-ink-100">
                              {receiptData?.member?.memberNumber}
                            </span>
                          </div>
                          {receiptData?.account && (
                            <div className="flex justify-between py-2 border-b border-ink-200 dark:border-ink-700">
                              <span className="text-ink-600 dark:text-ink-400">Account:</span>
                              <span className="font-mono text-ink-900 dark:text-ink-100">
                                {receiptData.account.accountNumber}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between py-2 border-b border-ink-200 dark:border-ink-700">
                            <span className="text-ink-600 dark:text-ink-400">Payment Method:</span>
                            <span className="font-medium text-ink-900 dark:text-ink-100 uppercase">
                              {receiptData?.receipt?.paymentMethod?.replace(/_/g, ' ')}
                            </span>
                          </div>
                          {receiptData?.receipt?.externalReference && (
                            <div className="flex justify-between py-2 border-b border-ink-200 dark:border-ink-700">
                              <span className="text-ink-600 dark:text-ink-400">Reference:</span>
                              <span className="font-mono text-ink-900 dark:text-ink-100">
                                {receiptData.receipt.externalReference}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between py-2 border-b border-ink-200 dark:border-ink-700">
                            <span className="text-ink-600 dark:text-ink-400">Teller:</span>
                            <span className="font-medium text-ink-900 dark:text-ink-100">
                              {receiptData?.teller?.name}
                            </span>
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="text-center py-6 border-t-2 border-b-2 border-dashed border-ink-300 my-6">
                          <div className="text-sm text-ink-600 dark:text-ink-400 mb-1">AMOUNT</div>
                          <div className="text-4xl font-bold text-teal-600 dark:text-teal-400">
                            {formatKES(receiptData?.receipt?.amount)}
                          </div>
                        </div>

                        {/* Balance After */}
                        {receiptData?.receipt?.balanceAfter !== undefined && (
                          <div className="flex justify-between py-2 mb-6">
                            <span className="font-semibold text-ink-700 dark:text-ink-300">New Balance:</span>
                            <span className="text-xl font-bold text-teal-600 dark:text-teal-400">
                              {formatKES(receiptData.receipt.balanceAfter)}
                            </span>
                          </div>
                        )}

                        {/* Footer */}
                        <div className="text-center pt-6 border-t-2 border-dashed border-ink-300">
                          <div className="text-sm text-ink-600 dark:text-ink-400 mb-2">
                            Thank you for banking with us!
                          </div>
                          <div className="text-xs text-ink-500 dark:text-ink-500">
                            This is a system-generated receipt
                          </div>
                          <div className="text-xs text-ink-500 dark:text-ink-500 mt-1">
                            Printed on {formatDateTime(new Date())}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-ink-900 dark:text-ink-100 flex items-center gap-2">
                  <Mail size={20} className="text-purple-600" />
                  Email Receipt
                </h3>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="p-1 hover:bg-ink-100 dark:hover:bg-ink-700 rounded"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="member@example.com"
                    className="w-full px-4 py-2.5 border border-ink-300 dark:border-ink-600 rounded-lg bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-100 focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowEmailModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    icon={Mail}
                    onClick={handleEmailReceipt}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    Send Email
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ReceiptManagement;
