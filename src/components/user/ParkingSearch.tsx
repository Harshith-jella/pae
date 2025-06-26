import React, { useState } from 'react';
import { Search, MapPin, Filter, Star, Clock, Car, Zap, Shield, Camera } from 'lucide-react';
import { useSupabaseData } from '../../hooks/useSupabaseData';
import { ParkingSpace } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export const ParkingSearch: React.FC = () => {
  const { user } = useAuth();
  const { parkingSpaces, loading, error } = useSupabaseData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpace, setSelectedSpace] = useState<ParkingSpace | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [filters, setFilters] = useState({
    maxPrice: 20,
    spaceType: 'all',
    amenities: [] as string[]
  });

  const filteredSpaces = parkingSpaces.filter(space => {
    const matchesSearch = space.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         space.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = space.pricePerHour <= filters.maxPrice;
    const matchesType = filters.spaceType === 'all' || space.type === filters.spaceType;
    
    return matchesSearch && matchesPrice && matchesType;
  });

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'ev charging': return <Zap size={16} className="text-green-500" />;
      case '24/7 security': return <Shield size={16} className="text-blue-500" />;
      case 'cctv': return <Camera size={16} className="text-purple-500" />;
      default: return <Car size={16} className="text-gray-500" />;
    }
  };

  const handleBooking = async (formData: any) => {
    if (!user || !selectedSpace) return;

    setBookingLoading(true);
    try {
      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.date}T${formData.endTime}`);
      const hours = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60);
      const totalAmount = hours * selectedSpace.pricePerHour;
      const platformFee = totalAmount * 0.1;
      const ownerEarnings = totalAmount - platformFee;

      const { error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          space_id: selectedSpace.id,
          start_date: formData.date,
          end_date: formData.date,
          start_time: formData.startTime,
          end_time: formData.endTime,
          total_hours: hours,
          hourly_rate: selectedSpace.pricePerHour,
          total_amount: totalAmount,
          platform_fee: platformFee,
          owner_earnings: ownerEarnings,
          status: 'pending',
          payment_status: 'pending'
        });

      if (error) throw error;

      alert('Booking request submitted successfully!');
      setSelectedSpace(null);
    } catch (error: any) {
      alert('Error creating booking: ' + error.message);
    } finally {
      setBookingLoading(false);
    }
  };

  const BookingModal = ({ space, onClose }: { space: ParkingSpace; onClose: () => void }) => {
    const [formData, setFormData] = useState({
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '17:00'
    });

    const calculateTotal = () => {
      const start = new Date(`${formData.date}T${formData.startTime}`);
      const end = new Date(`${formData.date}T${formData.endTime}`);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return hours * space.pricePerHour;
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{space.title}</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl font-light"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Images */}
              {space.images.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {space.images.slice(0, 4).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${space.title} ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Location</h3>
                  <div className="flex items-start space-x-2 text-gray-600 mb-4">
                    <MapPin size={16} className="mt-1 flex-shrink-0" />
                    <span className="text-sm">{space.address}, {space.city}, {space.state}</span>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-3">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {space.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center space-x-1 bg-gray-100 px-3 py-1 rounded-full">
                        {getAmenityIcon(amenity)}
                        <span className="text-sm text-gray-700">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Pricing & Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price per hour:</span>
                      <span className="font-semibold text-green-600">${space.pricePerHour}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Space size:</span>
                      <span className="font-medium capitalize">{space.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium capitalize">{space.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rating:</span>
                      <div className="flex items-center space-x-1">
                        <Star size={16} className="text-yellow-400 fill-current" />
                        <span className="font-medium">{space.rating}</span>
                        <span className="text-gray-500">({space.reviewCount})</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Form */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Book this space</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start time</label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End time</label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Amount:</span>
                    <span className="text-xl font-bold text-green-600">${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                <button 
                  onClick={() => handleBooking(formData)}
                  disabled={bookingLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
                >
                  {bookingLoading ? 'Creating Booking...' : 'Request Booking'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading parking spaces...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Error loading parking spaces: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Find Parking</h1>
          <p className="text-gray-600 mt-1">Discover and book parking spaces near you</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by location, city, or space name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="min-w-[120px]">
              <select
                value={filters.spaceType}
                onChange={(e) => setFilters(prev => ({ ...prev, spaceType: e.target.value }))}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="garage">Garage</option>
                <option value="outdoor">Outdoor</option>
                <option value="covered">Covered</option>
                <option value="street">Street</option>
              </select>
            </div>
            
            <div className="min-w-[120px]">
              <select
                value={filters.maxPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: parseInt(e.target.value) }))}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="20">Under $20/hr</option>
                <option value="15">Under $15/hr</option>
                <option value="10">Under $10/hr</option>
                <option value="5">Under $5/hr</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSpaces.map((space) => (
          <div key={space.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
            <div className="relative">
              {space.images.length > 0 ? (
                <img
                  src={space.images[0]}
                  alt={space.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <Car size={48} className="text-gray-400" />
                </div>
              )}
              <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-lg shadow-sm">
                <span className="text-lg font-bold text-green-600">${space.pricePerHour}/hr</span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 text-lg">{space.title}</h3>
                <div className="flex items-center space-x-1">
                  <Star size={16} className="text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">{space.rating}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-gray-600 mb-3">
                <MapPin size={16} />
                <span className="text-sm">{space.city}, {space.state}</span>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {space.amenities.slice(0, 3).map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-full">
                    {getAmenityIcon(amenity)}
                    <span className="text-xs text-gray-700">{amenity}</span>
                  </div>
                ))}
                {space.amenities.length > 3 && (
                  <div className="bg-gray-100 px-2 py-1 rounded-full">
                    <span className="text-xs text-gray-700">+{space.amenities.length - 3} more</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <span className="capitalize">{space.size}</span> • <span className="capitalize">{space.type}</span>
                </div>
                <button
                  onClick={() => setSelectedSpace(space)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSpaces.length === 0 && (
        <div className="text-center py-12">
          <Car size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No parking spaces found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or filters</p>
        </div>
      )}

      {/* Booking Modal */}
      {selectedSpace && (
        <BookingModal
          space={selectedSpace}
          onClose={() => setSelectedSpace(null)}
        />
      )}
    </div>
  );
};