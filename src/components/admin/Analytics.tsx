import React, { useState } from 'react';
import { TrendingUp, Users, DollarSign, Calendar, MapPin, Star, BarChart3, PieChart } from 'lucide-react';
import { Chart } from '../common/Chart';
import { DashboardCard } from '../common/DashboardCard';

export const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');

  const analyticsData = {
    overview: {
      totalRevenue: 45280,
      totalBookings: 1247,
      activeUsers: 892,
      avgRating: 4.6,
      revenueGrowth: '+23.5%',
      bookingsGrowth: '+18.2%',
      usersGrowth: '+12.8%',
      ratingGrowth: '+0.3'
    },
    charts: {
      revenueOverTime: [
        { label: 'Jan', value: 28500 },
        { label: 'Feb', value: 32100 },
        { label: 'Mar', value: 29800 },
        { label: 'Apr', value: 35600 },
        { label: 'May', value: 38900 },
        { label: 'Jun', value: 42300 },
        { label: 'Jul', value: 45280 }
      ],
      bookingsByType: [
        { label: 'Garage', value: 456 },
        { label: 'Outdoor', value: 324 },
        { label: 'Covered', value: 289 },
        { label: 'Street', value: 178 }
      ],
      userActivity: [
        { label: 'Mon', value: 145 },
        { label: 'Tue', value: 189 },
        { label: 'Wed', value: 167 },
        { label: 'Thu', value: 203 },
        { label: 'Fri', value: 234 },
        { label: 'Sat', value: 198 },
        { label: 'Sun', value: 156 }
      ],
      topCities: [
        { label: 'San Francisco', value: 423 },
        { label: 'Los Angeles', value: 356 },
        { label: 'New York', value: 289 },
        { label: 'Chicago', value: 179 }
      ]
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into platform performance</p>
        </div>
        <div className="mt-4 sm:mt-0">
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
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Revenue"
          value={`$${analyticsData.overview.totalRevenue.toLocaleString()}`}
          change={analyticsData.overview.revenueGrowth}
          changeType="positive"
          icon={DollarSign}
          gradient="from-green-500 to-emerald-600"
        />
        <DashboardCard
          title="Total Bookings"
          value={analyticsData.overview.totalBookings.toLocaleString()}
          change={analyticsData.overview.bookingsGrowth}
          changeType="positive"
          icon={Calendar}
          gradient="from-blue-500 to-cyan-600"
        />
        <DashboardCard
          title="Active Users"
          value={analyticsData.overview.activeUsers.toLocaleString()}
          change={analyticsData.overview.usersGrowth}
          changeType="positive"
          icon={Users}
          gradient="from-purple-500 to-pink-600"
        />
        <DashboardCard
          title="Average Rating"
          value={`${analyticsData.overview.avgRating}★`}
          change={analyticsData.overview.ratingGrowth}
          changeType="positive"
          icon={Star}
          gradient="from-orange-500 to-red-600"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Chart
          title="Revenue Over Time"
          data={analyticsData.charts.revenueOverTime}
          type="line"
          color="bg-green-500"
        />
        <Chart
          title="Bookings by Space Type"
          data={analyticsData.charts.bookingsByType}
          type="bar"
          color="bg-blue-500"
        />
        <Chart
          title="Daily User Activity"
          data={analyticsData.charts.userActivity}
          type="bar"
          color="bg-purple-500"
        />
        <Chart
          title="Top Cities by Bookings"
          data={analyticsData.charts.topCities}
          type="bar"
          color="bg-orange-500"
        />
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Metrics */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Metrics</h3>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">89.2%</div>
                <div className="text-sm text-gray-600 mt-1">Booking Success Rate</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">6.8 hrs</div>
                <div className="text-sm text-gray-600 mt-1">Avg. Booking Duration</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">$36.40</div>
                <div className="text-sm text-gray-600 mt-1">Avg. Booking Value</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Platform Utilization</span>
                <span className="font-semibold">78%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Customer Satisfaction</span>
                <span className="font-semibold">92%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Owner Response Rate</span>
                <span className="font-semibold">85%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Performers</h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Top Earning Spaces</h4>
              <div className="space-y-3">
                {[
                  { name: 'Downtown Garage', earnings: '$2,840', growth: '+15%' },
                  { name: 'Airport Parking', earnings: '$2,120', growth: '+8%' },
                  { name: 'Shopping Center', earnings: '$1,890', growth: '+22%' }
                ].map((space, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{space.name}</p>
                      <p className="text-xs text-gray-600">{space.earnings}</p>
                    </div>
                    <span className="text-xs text-green-600 font-medium">{space.growth}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Most Active Users</h4>
              <div className="space-y-3">
                {[
                  { name: 'Sarah Johnson', bookings: 23, spent: '$1,240' },
                  { name: 'Michael Chen', bookings: 18, spent: '$980' },
                  { name: 'Emily Rodriguez', bookings: 15, spent: '$750' }
                ].map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                      <p className="text-xs text-gray-600">{user.bookings} bookings</p>
                    </div>
                    <span className="text-xs text-blue-600 font-medium">{user.spent}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Geographic Distribution */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Geographic Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { city: 'San Francisco', bookings: 423, revenue: '$18,420', growth: '+12%' },
            { city: 'Los Angeles', bookings: 356, revenue: '$15,680', growth: '+8%' },
            { city: 'New York', bookings: 289, revenue: '$12,340', growth: '+15%' },
            { city: 'Chicago', bookings: 179, revenue: '$7,890', growth: '+5%' }
          ].map((city, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{city.city}</h4>
                <MapPin size={16} className="text-gray-400" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Bookings:</span>
                  <span className="font-medium">{city.bookings}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Revenue:</span>
                  <span className="font-medium text-green-600">{city.revenue}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Growth:</span>
                  <span className="font-medium text-blue-600">{city.growth}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};