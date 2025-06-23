import React, { useState } from 'react';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
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

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return authMode === 'login' ? (
      <LoginForm onToggleMode={() => setAuthMode('register')} />
    ) : (
      <RegisterForm onToggleMode={() => setAuthMode('login')} />
    );
  }

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
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="flex-1 md:ml-64 p-6">
        {renderPage()}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;