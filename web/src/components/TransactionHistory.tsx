/**
 * TransactionHistory Component
 * Displays payment and consent transaction history for audit tracking
 */

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { format } from 'date-fns';
import { PaymentTransaction } from '@/services/providerAccessService';
import { ConsentTransaction, consentContractService } from '@/services/ConsentContractService';
import { paymentManagerService } from '@/services/PaymentManagerService';

interface TransactionHistoryProps {
  walletAddress?: string;
  transactionType?: 'payment' | 'consent' | 'all';
  limit?: number;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  walletAddress,
  transactionType = 'all',
  limit = 50
}) => {
  const { address: connectedAddress } = useAccount();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Array<PaymentTransaction | ConsentTransaction>>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'failed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const currentAddress = walletAddress || connectedAddress;

  // Fetch transaction history
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);

      try {
        let allTransactions: Array<PaymentTransaction | ConsentTransaction> = [];

        if (transactionType === 'payment' || transactionType === 'all') {
          // In a real implementation, we would fetch payment transactions from blockchain or API
          // For now, we'll use mock data
          const mockPaymentTransactions: PaymentTransaction[] = [
            {
              id: 'payment-1',
              providerId: 'provider-123',
              patientId: 'patient-456',
              accessPermissionId: 'access-789',
              amount: 1000000000000000,
              currency: 'ETH',
              transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
              status: 'confirmed',
              createdAt: new Date().toISOString(),
              confirmedAt: new Date().toISOString(),
              gasUsed: 21000,
              gasPrice: 20000000000
            }
          ];
          allTransactions.push(...mockPaymentTransactions);
        }

        if (transactionType === 'consent' || transactionType === 'all') {
          // Get consent transactions from the consent contract service
          const consentTransactions = consentContractService.getAllTransactions();
          allTransactions.push(...consentTransactions);
        }

        // Sort by timestamp (newest first)
        allTransactions.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        setTransactions(allTransactions.slice(0, limit));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch transaction history');
        console.error('Error fetching transaction history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [currentAddress, transactionType, limit]);

  // Filter transactions based on selected filter
  const filteredTransactions = transactions.filter(tx => {
    // Apply status filter
    if (filter !== 'all') {
      if ('status' in tx && tx.status !== filter) {
        return false;
      }
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if ('providerId' in tx && tx.providerId.toLowerCase().includes(query)) return true;
      if ('patientId' in tx && tx.patientId.toLowerCase().includes(query)) return true;
      if ('transactionHash' in tx && tx.transactionHash.toLowerCase().includes(query)) return true;
      if ('id' in tx && tx.id.toLowerCase().includes(query)) return true;
      if ('from' in tx && tx.from.toLowerCase().includes(query)) return true;
      if ('to' in tx && tx.to.toLowerCase().includes(query)) return true;
      if ('error' in tx && tx.error?.toLowerCase().includes(query)) return true;
      if ('type' in tx && tx.type?.toLowerCase().includes(query)) return true;
      
      return false;
    }

    return true;
  });

  // Format transaction amount
  const formatAmount = (amount: number) => {
    // Convert wei to ETH
    return (amount / 1e18).toFixed(6) + ' ETH';
  };

  // Format transaction status
  const formatStatus = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Confirmed</span>;
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
      case 'failed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Failed</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  // Format transaction type
  const formatType = (tx: any) => {
    if ('type' in tx) {
      // Consent transaction
      return tx.type.charAt(0).toUpperCase() + tx.type.slice(1);
    } else {
      // Payment transaction
      return 'Payment';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
        <p className="mt-1 text-sm text-gray-500">
          Audit trail of consent and payment transactions
        </p>
      </div>

      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'pending' | 'confirmed' | 'failed')}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <div className="flex-1 max-w-md sm:ml-4">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transactions..."
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 py-2 sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction Hash
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  No transactions found
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatType(tx)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tx.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {('providerId' in tx || 'patientId' in tx) && (
                      <div>
                        <div>Provider: {tx.providerId || 'N/A'}</div>
                        <div>Patient: {tx.patientId || 'N/A'}</div>
                      </div>
                    )}
                    {'type' in tx && (
                      <div>
                        <div>Type: {tx.type}</div>
                        <div>From: {tx.from}</div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {'amount' in tx && tx.amount ? formatAmount(tx.amount) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {('status' in tx) ? formatStatus(tx.status) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tx.timestamp ? format(new Date(tx.timestamp), 'MMM dd, yyyy HH:mm') : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {'transactionHash' in tx && tx.transactionHash ? (
                      <a 
                        href={`https://chainscan.0g.ai/tx/${tx.transactionHash}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        {tx.transactionHash.substring(0, 20)}...
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionHistory;