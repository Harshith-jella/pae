import React, { useState } from 'react';
import { Calendar, MapPin, Clock, CreditCard, CheckCircle, XCircle, AlertCircle, Star } from 'lucide-react';
import { useUserBookings } from '../../hooks/useSupabaseData';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export const MyBookings: React.FC = () => {
  const { user } = useAuth();
  const { bookings, loading, error } = useUserBookings(user?.id || '');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'pending'>('upcoming');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const getBookingsByStatus = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    switch (activeTab) {
      case 'upcoming':
        return bookings.filter(booking => 
          booking.status === 'confirmed' && booking.startDate >= today
        );
      case 'past':
        return bookings.filter(booking => 
          booking.status === 'completed' || booking.startDate < today
        );
      case 'pending':
        return bookings.filter(booking => 
          booking.status === 'pending'
        );
      default:
        return [];
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    setActionLoading(bookingId);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) throw error;
      
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error: any) {
      alert('Error cancelling booking: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'pending':
        return <AlertCircle size={20} className="text-yellow-500" />;
      case 'cancelled':
      case 'rejected':
        return <XCircle size={20} className="text-red-500" />;
      default:
        return <CheckCircle size={20} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const filteredBookings = getBookingsByStatus();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading bookings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Error loading bookings: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600 mt-1">Manage your parking reservations</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'upcoming', label: 'Upcoming', count: bookings.filter(b => b.status === 'confirmed').length },
              { id: 'pending', label: 'Pending', count: bookings.filter(b => b.status === 'pending').length },
              { id: 'past', label: 'Past', count: bookings.filter(b => b.status === 'completed').length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No {activeTab} bookings
              </h3>
              <p className="text-gray-600">
                {activeTab === 'upcoming' && "You don't have any upcoming reservations."}
                {activeTab === 'pending' && "No pending requests at the moment."}
                {activeTab === 'past' && "No booking history available."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow duration-200">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Parking Space Booking</h3>
                          <div className="flex items-center space-x-2 text-gray-600 mt-1">
                            <MapPin size={16} />
                            <span className="text-sm">Booking ID: {booking.id.slice(0, 8)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(booking.status)}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Calendar size={16} />
                          <span className="text-sm">
                            {formatDate(booking.startDate)}
                            {booking.startDate !== booking.endDate && ` - ${formatDate(booking.endDate)}`}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Clock size={16} />
                          <span className="text-sm">
                            {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <CreditCard size={16} />
                          <span className="text-sm font-semibold text-green-600">
                            ${booking.totalAmount}
                          </span>
                        </div>
                      </div>

                      {booking.isRecurring && booking.recurringDays && (
                        <div className="mb-3">
                          <span className="text-sm text-gray-600">
                            Recurring: {booking.recurringDays.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col sm:flex-row gap-2">
                      {booking.status === 'pending' && (
                        <button 
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={actionLoading === booking.id}
                          className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors duration-200 disabled:opacity-50"
                        >
                          {actionLoading === booking.id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                      {booking.status === 'confirmed' && (
                        <button 
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={actionLoading === booking.id}
                          className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors duration-200 disabled:opacity-50"
                        >
                          {actionLoading === booking.id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                      {booking.status === 'completed' && (
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2">
                          <Star size={16} />
                          <span>Rate & Review</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};