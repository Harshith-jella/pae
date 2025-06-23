import React, { useState } from 'react';
import { 
  Home, 
  Search, 
  Calendar, 
  ParkingCircle, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  Car,
  CreditCard,
  MapPin,
  DollarSign,
  List,
  TrendingUp,
  User
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getMenuItems = () => {
    const commonItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'profile', label: 'Profile', icon: User }
    ];

    const roleSpecificItems = {
      admin: [
        { id: 'users', label: 'User Management', icon: Users },
        { id: 'listings', label: 'All Listings', icon: List },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'revenue', label: 'Revenue', icon: DollarSign }
      ],
      owner: [
        { id: 'my-spaces', label: 'My Spaces', icon: ParkingCircle },
        { id: 'bookings', label: 'Bookings', icon: Calendar },
        { id: 'earnings', label: 'Earnings', icon: CreditCard },
        { id: 'add-space', label: 'Add Space', icon: MapPin }
      ],
      user: [
        { id: 'search', label: 'Find Parking', icon: Search },
        { id: 'my-bookings', label: 'My Bookings', icon: Calendar },
        { id: 'favorites', label: 'Favorites', icon: Car },
        { id: 'payment', label: 'Payment', icon: CreditCard }
      ]
    };

    return [
      ...commonItems,
      ...roleSpecificItems[user?.role || 'user']
    ];
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="fixed top-4 left-4 z-50 p-2 bg-white shadow-lg rounded-lg md:hidden"
      >
        {isCollapsed ? <Menu size={20} /> : <X size={20} />}
      </button>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full bg-white shadow-xl z-50 transition-transform duration-300 ease-in-out
        ${isCollapsed ? '-translate-x-full' : 'translate-x-0'} 
        md:translate-x-0 md:static md:z-auto
        w-64 flex flex-col
      `}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <ParkingCircle className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">PAE</h1>
              <p className="text-sm text-gray-500 capitalize">{user?.role} Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id);
                  setIsCollapsed(true);
                }}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200
                  ${isActive 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-4">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-medium">
                  {user?.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
          >
            <LogOut size={18} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};