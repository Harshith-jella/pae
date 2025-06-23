import React, { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Download, Filter, CreditCard, PieChart } from 'lucide-react';
import { Chart } from '../common/Chart';
import { DashboardCard } from '../common/DashboardCard';

export const Revenue: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  const revenueData = {
    overview: {
      totalRevenue: 125680,
      monthlyRevenue: 18420,
      avgTransactionValue: 42.50,
      revenueGrowth: '+23.5%',
      transactionGrowth: '+18.2%',
      avgGrowth: '+5.8%',
      totalTransactions: 2847,
      platformFee: 12568,
      ownerEarnings: 113112
    },
    charts: {
      monthlyRevenue: [
        { label: 'Jan', value: 12500 },
        { label: 'Feb', value: 14200 },
        { label: 'Mar', value: 13800 },
        { label: 'Apr', value: 16200 },
        { label: 'May', value: 17900 },
        { label: 'Jun', value: 19300 },
        { label: 'Jul', value: 18420 }
      ],
      revenueByType: [
        { label: 'Garage', value: 45680 },
        { label: 'Outdoor', value: 32400 },
        { label: 'Covered', value: 28900 },
        { label: 'Street', value: 18700 }
      ],
      dailyRevenue: [
        { label: 'Mon', value: 2840 },
        { label: 'Tue', value: 3120 },
        { label: 'Wed', value: 2950 },
        { label: 'Thu', value: 3380 },
        { label: 'Fri', value: 3650 },
        { label: 'Sat', value: 3200 },
        { label: 'Sun', value: 2680 }
      ],
      paymentMethods: [
        { label: 'Credit Card', value: 89200 },
        { label: 'Debit Card', value: 24680 },
        { label: 'Digital Wallet', value: 11800 }
      ]
    },
    transactions: [
      {
        id: 'TXN-001',
        date: '2024-12-18',
        user: 'Sarah Johnson',
        space: 'Downtown Garage',
        amount: 64.00,
        fee: 6.40,
        status: 'completed',
        method: 'Credit Card'
      },
      {
        id: 'TXN-002',
        date: '2024-12-18',
        user: 'Michael Chen',
        space: 'Airport Parking',
        amount: 120.00,
        fee: 12.00,
        status: 'completed',
        method: 'Debit Card'
      },
      {
        id: 'TXN-003',
        date: '2024-12-17',
        user: 'Emily Rodriguez',
        space: 'Shopping Center',
        amount: 36.00,
        fee: 3.60,
        status: 'pending',
        method: 'Digital Wallet'
      },
      {
        id: 'TXN-004',
        date: '2024-12-17',
        user: 'David Park',
        space: 'Street Parking',
        amount: 24.00,
        fee: 2.40,
        status: 'completed',
        method: 'Credit Card'
      },
      {
        id: 'TXN-005',
        date: '2024-12-16',
        user: 'Lisa Thompson',
        space: 'Downtown Garage',
        amount: 48.00,
        fee: 4.80,
        status: 'refunded',
        method: 'Credit Card'
      }
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'refunded': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revenue Dashboard</h1>
          <p className="text-gray-600 mt-1">Track earnings, transactions, and financial performance</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200">
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Revenue"
          value={`$${revenueData.overview.totalRevenue.toLocaleString()}`}
          change={revenueData.overview.revenueGrowth}
          changeType="positive"
          icon={DollarSign}
          gradient="from-green-500 to-emerald-600"
        />
        <DashboardCard
          title="Monthly Revenue"
          value={`$${revenueData.overview.monthlyRevenue.toLocaleString()}`}
          change={revenueData.overview.transactionGrowth}
          changeType="positive"
          icon={TrendingUp}
          gradient="from-blue-500 to-cyan-600"
        />
        <DashboardCard
          title="Avg. Transaction"
          value={`$${revenueData.overview.avgTransactionValue}`}
          change={revenueData.overview.avgGrowth}
          changeType="positive"
          icon={CreditCard}
          gradient="from-purple-500 to-pink-600"
        />
        <DashboardCard
          title="Total Transactions"
          value={revenueData.overview.totalTransactions.toLocaleString()}
          change="+156 this month"
          changeType="positive"
          icon={Calendar}
          gradient="from-orange-500 to-red-600"
        />
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Split</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Owner Earnings</p>
                <p className="text-sm text-gray-600">90% of total revenue</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">
                  ${revenueData.overview.ownerEarnings.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Platform Fee</p>
                <p className="text-sm text-gray-600">10% commission</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-600">
                  ${revenueData.overview.platformFee.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">94.2%</div>
              <div className="text-sm text-gray-600 mt-1">Payment Success Rate</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">2.3 days</div>
              <div className="text-sm text-gray-600 mt-1">Avg. Settlement Time</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">1.8%</div>
              <div className="text-sm text-gray-600 mt-1">Refund Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Chart
          title="Monthly Revenue Trend"
          data={revenueData.charts.monthlyRevenue}
          type="line"
          color="bg-green-500"
        />
        <Chart
          title="Revenue by Space Type"
          data={revenueData.charts.revenueByType}
          type="bar"
          color="bg-blue-500"
        />
        <Chart
          title="Daily Revenue (This Week)"
          data={revenueData.charts.dailyRevenue}
          type="bar"
          color="bg-purple-500"
        />
        <Chart
          title="Payment Methods"
          data={revenueData.charts.paymentMethods}
          type="bar"
          color="bg-orange-500"
        />
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <Filter size={16} />
                <span>Filter</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200">
                <Download size={16} />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Space</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {revenueData.transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm text-gray-900">{transaction.id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{transaction.user}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{transaction.space}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-green-600">${transaction.amount}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">${transaction.fee}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{transaction.method}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};