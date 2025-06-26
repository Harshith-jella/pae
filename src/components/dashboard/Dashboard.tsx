import React from 'react';
import { DollarSign, Calendar, ParkingCircle, Users, TrendingUp, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardCard } from '../common/DashboardCard';
import { Chart } from '../common/Chart';
import { mockDashboardStats, mockBookings } from '../../data/mockData';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  const getDashboardData = () => {
    const stats = mockDashboardStats;
    
    switch (user?.role) {
      case 'admin':
        return {
          cards: [
            {
              title: 'Total Revenue',
              value: `$${stats.totalRevenue.toLocaleString()}`,
              change: '+12.5% from last month',
              changeType: 'positive' as const,
              icon: DollarSign,
              gradient: 'from-green-500 to-emerald-600'
            },
            {
              title: 'Total Users',
              value: stats.totalUsers,
              change: '+23 new this week',
              changeType: 'positive' as const,
              icon: Users,
              gradient: 'from-blue-500 to-cyan-600'
            },
            {
              title: 'Active Listings',
              value: stats.activeListings,
              change: '2 pending approval',
              changeType: 'neutral' as const,
              icon: ParkingCircle,
              gradient: 'from-purple-500 to-pink-600'
            },
            {
              title: 'Total Bookings',
              value: stats.totalBookings,
              change: '+8.2% from last week',
              changeType: 'positive' as const,
              icon: Calendar,
              gradient: 'from-orange-500 to-red-600'
            }
          ],
          charts: [
            {
              title: 'Weekly Bookings',
              data: stats.weeklyBookings.map(d => ({ label: d.day, value: d.bookings })),
              type: 'bar' as const,
              color: 'bg-blue-500'
            },
            {
              title: 'Monthly Revenue',
              data: stats.monthlyRevenue.map(d => ({ label: d.month, value: d.revenue })),
              type: 'line' as const,
              color: 'bg-green-500'
            }
          ]
        };
        
      case 'owner':
        const ownerEarnings = 8450;
        const ownerBookings = 67;
        return {
          cards: [
            {
              title: 'Total Earnings',
              value: `$${ownerEarnings.toLocaleString()}`,
              change: '+15.3% from last month',
              changeType: 'positive' as const,
              icon: DollarSign,
              gradient: 'from-green-500 to-emerald-600'
            },
            {
              title: 'Total Bookings',
              value: ownerBookings,
              change: '+5 this week',
              changeType: 'positive' as const,
              icon: Calendar,
              gradient: 'from-blue-500 to-cyan-600'
            },
            {
              title: 'Active Spaces',
              value: 3,
              change: 'All spaces active',
              changeType: 'positive' as const,
              icon: ParkingCircle,
              gradient: 'from-purple-500 to-pink-600'
            },
            {
              title: 'Avg. Rating',
              value: '4.7★',
              change: 'Based on 89 reviews',
              changeType: 'positive' as const,
              icon: TrendingUp,
              gradient: 'from-orange-500 to-red-600'
            }
          ],
          charts: [
            {
              title: 'Daily Bookings This Week',
              data: stats.weeklyBookings.map(d => ({ label: d.day, value: Math.floor(d.bookings * 0.6) })),
              type: 'bar' as const,
              color: 'bg-purple-500'
            }
          ]
        };
        
      default: // user
        const userBookings = mockBookings.filter(b => b.userId === user?.id);
        return {
          cards: [
            {
              title: 'Active Bookings',
              value: userBookings.filter(b => b.status === 'confirmed').length,
              change: '1 upcoming today',
              changeType: 'neutral' as const,
              icon: Calendar,
              gradient: 'from-blue-500 to-cyan-600'
            },
            {
              title: 'Total Spent',
              value: `$${userBookings.reduce((sum, b) => sum + b.totalAmount, 0)}`,
              change: 'Last 30 days',
              changeType: 'neutral' as const,
              icon: DollarSign,
              gradient: 'from-green-500 to-emerald-600'
            },
            {
              title: 'Favorite Spots',
              value: 2,
              change: 'Downtown & Airport',
              changeType: 'neutral' as const,
              icon: ParkingCircle,
              gradient: 'from-purple-500 to-pink-600'
            },
            {
              title: 'Avg. Session',
              value: '6.5 hrs',
              change: 'Per booking',
              changeType: 'neutral' as const,
              icon: Clock,
              gradient: 'from-orange-500 to-red-600'
            }
          ],
          charts: [
            {
              title: 'Booking History',
              data: [
                { label: 'Jan', value: 2 },
                { label: 'Feb', value: 4 },
                { label: 'Mar', value: 3 },
                { label: 'Apr', value: 6 },
                { label: 'May', value: 5 },
                { label: 'Jun', value: 8 }
              ],
              type: 'line' as const,
              color: 'bg-blue-500'
            }
          ]
        };
    }
  };

  const dashboardData = getDashboardData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your {user?.role === 'admin' ? 'platform' : user?.role === 'owner' ? 'spaces' : 'bookings'} today.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardData.cards.map((card, index) => (
          <DashboardCard key={index} {...card} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {dashboardData.charts.map((chart, index) => (
          <Chart key={index} {...chart} />
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {user?.role === 'admin' ? (
            <>
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-700">New user registered: Sarah Chen</span>
                <span className="text-xs text-gray-500 ml-auto">2 hours ago</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Parking space approved: Downtown Garage</span>
                <span className="text-xs text-gray-500 ml-auto">4 hours ago</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Payment processed: $64.00</span>
                <span className="text-xs text-gray-500 ml-auto">6 hours ago</span>
              </div>
            </>
          ) : user?.role === 'owner' ? (
            <>
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">New booking request for Downtown Garage</span>
                <span className="text-xs text-gray-500 ml-auto">1 hour ago</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Payment received: $64.00</span>
                <span className="text-xs text-gray-500 ml-auto">3 hours ago</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Review received: 5 stars</span>
                <span className="text-xs text-gray-500 ml-auto">5 hours ago</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Booking confirmed: Downtown Garage</span>
                <span className="text-xs text-gray-500 ml-auto">Today, 9:00 AM</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Booking reminder: Airport parking in 2 days</span>
                <span className="text-xs text-gray-500 ml-auto">Tomorrow</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Payment successful: $480.00</span>
                <span className="text-xs text-gray-500 ml-auto">Yesterday</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};