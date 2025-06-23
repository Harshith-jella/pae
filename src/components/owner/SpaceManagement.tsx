import React, { useState } from 'react';
import { Plus, MapPin, Star, Clock, DollarSign, Edit, Trash2, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import { ParkingSpace } from '../../types';
import { mockParkingSpaces } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';

export const SpaceManagement: React.FC = () => {
  const { user } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<ParkingSpace | null>(null);

  const ownerSpaces = mockParkingSpaces.filter(space => space.ownerId === user?.id);

  const AddSpaceModal = ({ onClose }: { onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Add New Parking Space</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-light"
            >
              ×
            </button>
          </div>

          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Space Title</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Downtown Secure Garage"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price per Hour ($)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="8.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your parking space, its features, and any important details..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Space Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="garage">Garage</option>
                  <option value="covered">Covered</option>
                  <option value="outdoor">Outdoor</option>
                  <option value="street">Street</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Space Size</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="compact">Compact</option>
                  <option value="standard">Standard</option>
                  <option value="large">Large</option>
                  <option value="oversized">Oversized</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123 Main Street"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="San Francisco"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="94105"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['24/7 Security', 'EV Charging', 'CCTV', 'Covered', 'Well Lit', 'Accessible', 'Valet Service', 'Car Wash'].map((amenity) => (
                  <label key={amenity} className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm text-gray-700">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Photos</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <div className="text-gray-500">
                  <p className="mb-2">Drag and drop photos here, or click to select</p>
                  <p className="text-sm">Upload up to 5 photos (JPG, PNG, max 5MB each)</p>
                </div>
                <button
                  type="button"
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Choose Photos
                </button>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Add Space
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Parking Spaces</h1>
          <p className="text-gray-600 mt-1">Manage your listings and availability</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add New Space</span>
        </button>
      </div>

      {/* Spaces Grid */}
      {ownerSpaces.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <MapPin size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No parking spaces yet</h3>
          <p className="text-gray-600 mb-6">Start earning by listing your first parking space</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
          >
            Add Your First Space
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {ownerSpaces.map((space) => (
            <div key={space.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
                  <button
                    className={`p-2 rounded-lg shadow-sm ${
                      space.isActive 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-500 text-white'
                    }`}
                  >
                    {space.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  </button>
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
                
                <div className="flex items-center space-x-2 text-gray-600 mb-4">
                  <MapPin size={16} />
                  <span className="text-sm">{space.city}, {space.state}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">45</div>
                    <div className="text-xs text-gray-600">Total Bookings</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">$1,280</div>
                    <div className="text-xs text-gray-600">Total Earned</div>
                  </div>
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
      )}

      {/* Add Space Modal */}
      {showAddModal && <AddSpaceModal onClose={() => setShowAddModal(false)} />}

      {/* Space Details Modal */}
      {selectedSpace && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedSpace.title}</h2>
                <button
                  onClick={() => setSelectedSpace(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-light"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <div className="space-y-4 mb-6">
                    {selectedSpace.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${selectedSpace.title} ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Performance</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">45</div>
                        <div className="text-sm text-gray-600">Total Bookings</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">$1,280</div>
                        <div className="text-sm text-gray-600">Total Revenue</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">4.7★</div>
                        <div className="text-sm text-gray-600">Avg Rating</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">89%</div>
                        <div className="text-sm text-gray-600">Occupancy</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price per hour:</span>
                        <span className="font-semibold text-green-600">${selectedSpace.pricePerHour}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Space type:</span>
                        <span className="font-medium capitalize">{selectedSpace.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Size:</span>
                        <span className="font-medium capitalize">{selectedSpace.size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedSpace.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedSpace.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedSpace.amenities.map((amenity, index) => (
                        <span key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200">
                      Edit Space
                    </button>
                    <button className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      View Analytics
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};