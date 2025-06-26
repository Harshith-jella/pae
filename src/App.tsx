import React, { useState } from 'react';
import { Sidebar } from './components/common/Sidebar';
import { Dashboard } from './components/dashboard/Dashboard';
import { ParkingSearch } from './components/user/ParkingSearch';
import { MyBookings } from './components/user/MyBookings';
import { SpaceManagement } from './components/owner/SpaceManagement';
import { BookingRequests } from './components/owner/BookingRequests';
import { ProfilePage } from './components/profile/ProfilePage';
import { UserManagement } from './components/admin/UserManagement';
import { AllListings } from './components/admin/AllListings';
import { Analytics } from './components/admin/Analytics';
import { Revenue } from './components/admin/Revenue';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [userRole, setUserRole] = useState<'admin' | 'owner' | 'user'>('user');

  // Mock user data
  const mockUser = {
    id: '1',
    name: 'Demo User',
    email: 'demo@pae.com',
    role: userRole,
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
    createdAt: '2024-01-01T00:00:00Z'
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'profile':
        return <ProfilePage />;
      case 'search':
        return <ParkingSearch />;
      case 'my-bookings':
        return <MyBookings />;
      case 'my-spaces':
        return <SpaceManagement />;
      case 'add-space':
        return <SpaceManagement />;
      case 'bookings':
        return <BookingRequests />;
      case 'users':
        return <UserManagement />;
      case 'listings':
        return <AllListings />;
      case 'analytics':
        return <Analytics />;
      case 'revenue':
        return <Revenue />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
        user={mockUser}
        userRole={userRole}
        onRoleChange={setUserRole}
      />
      <main className="flex-1 md:ml-64 p-6">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;