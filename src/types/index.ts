export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'owner' | 'user';
  avatar?: string;
  createdAt: string;
}

export interface ParkingSpace {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  pricePerHour: number;
  images: string[];
  amenities: string[];
  size: 'compact' | 'standard' | 'large' | 'oversized';
  type: 'outdoor' | 'covered' | 'garage' | 'street';
  availability: TimeSlot[];
  isActive: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Booking {
  id: string;
  userId: string;
  spaceId: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  isRecurring: boolean;
  recurringDays?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  userId: string;
  spaceId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalBookings: number;
  activeListings: number;
  totalUsers: number;
  weeklyBookings: { day: string; bookings: number }[];
  monthlyRevenue: { month: string; revenue: number }[];
  topSpaces: { id: string; name: string; bookings: number }[];
}