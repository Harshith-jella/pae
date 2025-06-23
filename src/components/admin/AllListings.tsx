import React, { useState } from 'react';
import { Search, Filter, MapPin, Star, DollarSign, Eye, Edit, Trash2, ToggleLeft, ToggleRight, Calendar } from 'lucide-react';
import { mockParkingSpaces } from '../../data/mockData';
import { ParkingSpace } from '../../types';

export const AllListings: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSpace, setSelectedSpace] = useState<ParkingSpace | null>(null);

  const filteredSpaces = mockParkingSpaces.filter(space => {
    const matchesSearch = space.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         space.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || space.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'active' && space.isActive) ||
                         (selectedStatus === 'inactive' && !space.isActive);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'garage': return 'bg-blue-100 text-blue-800';
      case 'covered': return 'bg-green-100 text-green-800';
      case 'outdoor': return 'bg-yellow-100 text-yellow-800';
      case 'street': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const SpaceModal = ({ space, onClose }: { space: ParkingSpace; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="space-y-4 mb-6">
                {space.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${space.title} ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price per hour:</span>
                    <span className="font-semibold text-green-600">${space.pricePerHour}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Space type:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(space.type)}`}>
                      {space.type.charAt(0).toUpperCase() + space.type.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Size:</span>
                    <span className="font-medium capitalize">{space.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rating:</span>
                    <div className="flex items-center space-x-1">
                      <Star size={16} className="text-yellow-400 fill-current" />
                      <span className="font-medium">{space.rating}</span>
                      <span className="text-gray-500">({space.reviewCount})</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      space.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {space.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Location</h3>
                <div className="flex items-start space-x-2 text-gray-600">
                  <MapPin size={16} className="mt-1 flex-shrink-0" />
                  <span className="text-sm">{space.address}, {space.city}, {space.state} {space.zipCode}</span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-600 text-sm">{space.description}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {space.amenities.map((amenity, index) => (
                    <span key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4 pt-6 border-t">
                <button className="flex-1 bg-gray-900 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors duration-200">
                  Edit Listing
                </button>
                <button className="px-6 py-3 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors duration-200">
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Listings</h1>
          <p className="text-gray-600 mt-1">Manage all parking space listings on the platform</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Listings</p>
              <p className="text-2xl font-bold text-gray-900">{mockParkingSpaces.length}</p>
            </div>
            <MapPin className="text-blue-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Listings</p>
              <p className="text-2xl font-bold text-green-600">{mockParkingSpaces.filter(s => s.isActive).length}</p>
            </div>
            <ToggleRight className="text-green-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
              <p className="text-2xl font-bold text-yellow-600">
                {(mockParkingSpaces.reduce((sum, s) => sum + s.rating, 0) / mockParkingSpaces.length).toFixed(1)}★
              </p>
            </div>
            <Star className="text-yellow-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Price</p>
              <p className="text-2xl font-bold text-blue-600">
                ${(mockParkingSpaces.reduce((sum, s) => sum + s.pricePerHour, 0) / mockParkingSpaces.length).toFixed(0)}/hr
              </p>
            </div>
            <DollarSign className="text-blue-500" size={24} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search listings by title or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="garage">Garage</option>
              <option value="covered">Covered</option>
              <option value="outdoor">Outdoor</option>
              <option value="street">Street</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSpaces.map((space) => (
          <div key={space.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
            <div className="relative">
              <img
                src={space.images[0]}
                alt={space.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-3 right-3 flex space-x-2">
                <div className="bg-white px-2 py-1 rounded-lg shadow-sm">
                  <span className="text-lg font-bold text-green-600">${space.pricePerHour}/hr</span>
                </div>
                <div className={`px-2 py-1 rounded-lg shadow-sm ${
                  space.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                }`}>
                  {space.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                </div>
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

              <div className="flex items-center justify-between mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(space.type)}`}>
                  {space.type.charAt(0).toUpperCase() + space.type.slice(1)}
                </span>
                <span className="text-sm text-gray-600 capitalize">{space.size}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    space.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {space.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedSpace(space)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                  >
                    <Eye size={16} />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                    <Edit size={16} />
                  </button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSpaces.length === 0 && (
        <div className="text-center py-12">
          <MapPin size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or filters</p>
        </div>
      )}

      {/* Space Details Modal */}
      {selectedSpace && (
        <SpaceModal
          space={selectedSpace}
          onClose={() => setSelectedSpace(null)}
        />
      )}
    </div>
  );
};