import React, { useState } from 'react';
import { Plus, MapPin, Star, Clock, DollarSign, Edit, Trash2, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import { ParkingSpace } from '../../types';
import { useUserSpaces } from '../../hooks/useSupabaseData';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export const SpaceManagement: React.FC = () => {
  const { user } = useAuth();
  const { spaces: ownerSpaces, loading, error } = useUserSpaces(user?.id || '');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<ParkingSpace | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleAddSpace = async (formData: any) => {
    if (!user) return;

    setActionLoading('add');
    try {
      const { error } = await supabase
        .from('parking_spaces')
        .insert({
          owner_id: user.id,
          title: formData.title,
          description: formData.description,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
          price_per_hour: parseFloat(formData.pricePerHour),
          size: formData.size,
          type: formData.type,
          amenities: formData.amenities,
          images: formData.images || []
        });

      if (error) throw error;

      alert('Parking space added successfully!');
      setShowAddModal(false);
      window.location.reload();
    } catch (error: any) {
      alert('Error adding space: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleActive = async (spaceId: string, currentStatus: boolean) => {
    setActionLoading(spaceId);
    try {
      const { error } = await supabase
        .from('parking_spaces')
        .update({ is_active: !currentStatus })
        .eq('id', spaceId);

      if (error) throw error;
      
      window.location.reload();
    } catch (error: any) {
      alert('Error updating space: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteSpace = async (spaceId: string) => {
    if (!confirm('Are you sure you want to delete this parking space?')) return;

    setActionLoading(spaceId);
    try {
      const { error } = await supabase
        .from('parking_spaces')
        .delete()
        .eq('id', spaceId);

      if (error) throw error;
      
      window.location.reload();
    } catch (error: any) {
      alert('Error deleting space: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const AddSpaceModal = ({ onClose }: { onClose: () => void }) => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      pricePerHour: '',
      size: 'standard',
      type: 'outdoor',
      amenities: [] as string[]
    });

    const availableAmenities = [
      '24/7 Security', 'EV Charging', 'CCTV', 'Covered', 'Well Lit', 
      'Accessible', 'Valet Service', 'Car Wash'
    ];

    const handleAmenityChange = (amenity: string, checked: boolean) => {
      setFormData(prev => ({
        ...prev,
        amenities: checked 
          ? [...prev.amenities, amenity]
          : prev.amenities.filter(a => a !== amenity)
      }));
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleAddSpace(formData);
    };

    return (
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

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Space Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Downtown Secure Garage"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price per Hour ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.pricePerHour}
                    onChange={(e) => setFormData(prev => ({ ...prev, pricePerHour: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="8.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your parking space, its features, and any important details..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Space Type</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="garage">Garage</option>
                    <option value="covered">Covered</option>
                    <option value="outdoor">Outdoor</option>
                    <option value="street">Street</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Space Size</label>
                  <select 
                    value={formData.size}
                    onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
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
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123 Main Street"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="San Francisco"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="CA"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="94105"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableAmenities.map((amenity) => (
                    <label key={amenity} className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        checked={formData.amenities.includes(amenity)}
                        onChange={(e) => handleAmenityChange(amenity, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                      />
                      <span className="text-sm text-gray-700">{amenity}</span>
                    </label>
                  ))}
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
                  disabled={actionLoading === 'add'}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                >
                  {actionLoading === 'add' ? 'Adding...' : 'Add Space'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading your spaces...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Error loading spaces: {error}
      </div>
    );
  }

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
                {space.images.length > 0 ? (
                  <img
                    src={space.images[0]}
                    alt={space.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <MapPin size={48} className="text-gray-400" />
                  </div>
                )}
                <div className="absolute top-3 right-3 flex space-x-2">
                  <div className="bg-white px-2 py-1 rounded-lg shadow-sm">
                    <span className="text-lg font-bold text-green-600">${space.pricePerHour}/hr</span>
                  </div>
                  <button
                    onClick={() => handleToggleActive(space.id, space.isActive)}
                    disabled={actionLoading === space.id}
                    className={`p-2 rounded-lg shadow-sm ${
                      space.isActive 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-500 text-white'
                    } disabled:opacity-50`}
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
                    <div className="text-lg font-bold text-blue-600">{space.reviewCount}</div>
                    <div className="text-xs text-gray-600">Reviews</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">${(space.pricePerHour * 8).toFixed(0)}</div>
                    <div className="text-xs text-gray-600">Daily Rate</div>
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
                    <button 
                      onClick={() => handleDeleteSpace(space.id)}
                      disabled={actionLoading === space.id}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
                    >
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
                    {selectedSpace.images.length > 0 ? (
                      selectedSpace.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${selectedSpace.title} ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      ))
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-lg">
                        <MapPin size={48} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
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
                    <h3 className="font-semibold text-gray-900 mb-3">Location</h3>
                    <p className="text-gray-600">{selectedSpace.address}, {selectedSpace.city}, {selectedSpace.state} {selectedSpace.zipCode}</p>
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