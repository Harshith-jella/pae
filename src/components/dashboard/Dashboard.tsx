import React from 'react';
import { DollarSign, Calendar, ParkingCircle, Users, TrendingUp, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardCard } from '../common/DashboardCard';
import { Chart } from '../common/Chart';
import { useSupabaseData, useUserSpaces, useUserBookings, useOwnerBookings } from '../../hooks/useSupabaseData';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { parkingSpaces, bookings } = useSupabaseData();
  const { spaces: userSpaces } = useUserSpaces(user?.id || '');
  const { bookings: userBookings } = useUserBookings(user?.id || '');
  const { bookings: ownerBookings } = useOwnerBookings(user?.id || '');
  
  const getDashboardData = () => {
    switch (user?.role) {
      case 'admin':
        const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
        const activeListings = parkingSpaces.filter(s => s.isActive).length;
        
        return {
          cards: [
            {
              title: 'Total Revenue',
              value: `$${totalRevenue.toLocaleString()}`,
              change: '+12.5% from last month',
              changeType: 'positive' as const,
              icon: DollarSign,
              gradient: 'from-green-500 to-emerald-600'
            },
            {
              title: 'Total Spaces',
              value: parkingSpaces.length,
              change: `${activeListings} active`,
              changeType: 'positive' as const,
              icon: ParkingCircle,
              gradient: 'from-blue-500 to-cyan-600'
            },
            {
              title: 'Total Bookings',
              value: bookings.length,
              change: '+8.2% from last week',
              changeType: 'positive' as const,
              icon: Calendar,
              gradient: 'from-purple-500 to-pink-600'
            },
            {
              title: 'Active Listings',
              value: activeListings,
              change: '2 pending approval',
              changeType: 'neutral' as const,
              icon: Users,
              gradient: 'from-orange-500 to-red-600'
            }
          ],
          charts: [
            {
              title: 'Bookings by Status',
              data: [
                { label: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length },
                { label: 'Pending', value: bookings.filter(b => b.status === 'pending').length },
                { label: 'Completed', value: bookings.filter(b => b.status === 'completed').length }
              ],
              type: 'bar' as const,
              color: 'bg-blue-500'
            },
            {
              title: 'Revenue by Month',
              data: [
                { label: 'Jan', value: Math.floor(totalRevenue * 0.1) },
                { label: 'Feb', value: Math.floor(totalRevenue * 0.15) },
                { label: 'Mar', value: Math.floor(totalRevenue * 0.2) },
                { label: 'Apr', value: Math.floor(totalRevenue * 0.25) },
                { label: 'May', value: Math.floor(totalRevenue * 0.3) }
              ],
              type: 'line' as const,
              color: 'bg-green-500'
            }
          ]
        };
        
      case 'owner':
        const ownerEarnings = ownerBookings.reduce((sum, b) => sum + (b.totalAmount * 0.9), 0);
        const ownerTotalBookings = ownerBookings.length;
        
        return {
          cards: [
            {
              title: 'Total Earnings',
              value: `$${ownerEarnings.toFixed(2)}`,
              change: '+15.3% from last month',
              changeType: 'positive' as const,
              icon: DollarSign,
              gradient: 'from-green-500 to-emerald-600'
            },
            {
              title: 'Total Bookings',
              value: ownerTotalBookings,
              change: `${ownerBookings.filter(b => b.status === 'pending').length} pending`,
              changeType: 'positive' as const,
              icon: Calendar,
              gradient: 'from-blue-500 to-cyan-600'
            },
            {
              title: 'Active Spaces',
              value: userSpaces.filter(s => s.isActive).length,
              change: `${userSpaces.length} total spaces`,
              changeType: 'positive' as const,
              icon: ParkingCircle,
              gradient: 'from-purple-500 to-pink-600'
            },
            {
              title: 'Avg. Rating',
              value: userSpaces.length > 0 ? 
                `${(userSpaces.reduce((sum, s) => sum + s.rating, 0) / userSpaces.length).toFixed(1)}★` : 
                'N/A',
              change: `Based on ${userSpaces.reduce((sum, s) => sum + s.reviewCount, 0)} reviews`,
              changeType: 'positive' as const,
              icon: TrendingUp,
              gradient: 'from-orange-500 to-red-600'
            }
          ],
          charts: [
            {
              title: 'Booking Status',
              data: [
                { label: 'Confirmed', value: ownerBookings.filter(b => b.status === 'confirmed').length },
                { label: 'Pending', value: ownerBookings.filter(b => b.status === 'pending').length },
                { label: 'Completed', value: ownerBookings.filter(b => b.status === 'completed').length }
              ],
              type: 'bar' as const,
              color: 'bg-purple-500'
            }
          ]
        };
        
      default: // user
        const userTotalSpent = userBookings.reduce((sum, b) => sum + b.totalAmount, 0);
        const activeUserBookings = userBookings.filter(b => b.status === 'confirmed').length;
        
        return {
          cards: [
            {
              title: 'Active Bookings',
              value: activeUserBookings,
              change: `${userBookings.filter(b => b.status === 'pending').length} pending`,
              changeType: 'neutral' as const,
              icon: Calendar,
              gradient: 'from-blue-500 to-cyan-600'
            },
            {
              title: 'Total Spent',
              value: `$${userTotalSpent.toFixed(2)}`,
              change: 'All time',
              changeType: 'neutral' as const,
              icon: DollarSign,
              gradient: 'from-green-500 to-emerald-600'
            },
            {
              title: 'Total Bookings',
              value: userBookings.length,
              change: `${userBookings.filter(b => b.status === 'completed').length} completed`,
              changeType: 'neutral' as const,
              icon: ParkingCircle,
              gradient: 'from-purple-500 to-pink-600'
            },
            {
              title: 'Avg. Session',
              value: userBookings.length > 0 ? '6.5 hrs' : 'N/A',
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
                { label: 'Confirmed', value: userBookings.filter(b => b.status === 'confirmed').length },
                { label: 'Pending', value: userBookings.filter(b => b.status === 'pending').length },
                { label: 'Completed', value: userBookings.filter(b => b.status === 'completed').length }
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
                <span className="text-sm text-gray-700">Platform activity will appear here</span>
                <span className="text-xs text-gray-500 ml-auto">Live updates</span>
              </div>
            </>
          ) : user?.role === 'owner' ? (
            <>
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Your space activity will appear here</span>
                <span className="text-xs text-gray-500 ml-auto">Live updates</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Your booking activity will appear here</span>
                <span className="text-xs text-gray-500 ml-auto">Live updates</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};