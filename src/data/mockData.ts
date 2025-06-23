import { ParkingSpace, Booking, DashboardStats } from '../types';

export const mockParkingSpaces: ParkingSpace[] = [
  {
    id: '1',
    ownerId: '2',
    title: 'Downtown Garage - Secure Parking',
    description: 'Premium covered parking space in the heart of downtown. 24/7 security, EV charging available.',
    address: '123 Main Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    latitude: 37.7749,
    longitude: -122.4194,
    pricePerHour: 8,
    images: [
      'https://images.pexels.com/photos/753876/pexels-photo-753876.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    amenities: ['24/7 Security', 'EV Charging', 'Covered', 'CCTV', 'Accessible'],
    size: 'standard',
    type: 'garage',
    availability: [],
    isActive: true,
    rating: 4.8,
    reviewCount: 124,
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    ownerId: '2',
    title: 'Airport Long-term Parking',
    description: 'Convenient parking near the airport with shuttle service. Perfect for travelers.',
    address: '456 Airport Blvd',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94128',
    latitude: 37.6213,
    longitude: -122.3790,
    pricePerHour: 5,
    images: [
      'https://images.pexels.com/photos/63294/autos-cars-motor-vehicles-packed-63294.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    amenities: ['Shuttle Service', 'Outdoor', 'Long-term', 'Security Patrol'],
    size: 'standard',
    type: 'outdoor',
    availability: [],
    isActive: true,
    rating: 4.5,
    reviewCount: 89,
    createdAt: '2024-01-20T00:00:00Z'
  },
  {
    id: '3',
    ownerId: '2',
    title: 'Shopping Center Covered Spot',
    description: 'Covered parking spot in busy shopping center. Walking distance to restaurants and shops.',
    address: '789 Shopping Way',
    city: 'Palo Alto',
    state: 'CA',
    zipCode: '94301',
    latitude: 37.4419,
    longitude: -122.1430,
    pricePerHour: 6,
    images: [
      'https://images.pexels.com/photos/376729/pexels-photo-376729.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    amenities: ['Covered', 'Shopping Access', 'Well Lit', 'Wide Space'],
    size: 'large',
    type: 'covered',
    availability: [],
    isActive: true,
    rating: 4.3,
    reviewCount: 67,
    createdAt: '2024-02-01T00:00:00Z'
  }
];

export const mockBookings: Booking[] = [
  {
    id: '1',
    userId: '3',
    spaceId: '1',
    startDate: '2024-12-20',
    endDate: '2024-12-20',
    startTime: '09:00',
    endTime: '17:00',
    totalAmount: 64,
    status: 'confirmed',
    paymentStatus: 'paid',
    isRecurring: false,
    createdAt: '2024-12-15T10:30:00Z',
    updatedAt: '2024-12-15T10:35:00Z'
  },
  {
    id: '2',
    userId: '3',
    spaceId: '2',
    startDate: '2024-12-22',
    endDate: '2024-12-26',
    startTime: '00:00',
    endTime: '23:59',
    totalAmount: 480,
    status: 'pending',
    paymentStatus: 'pending',
    isRecurring: false,
    createdAt: '2024-12-18T14:20:00Z',
    updatedAt: '2024-12-18T14:20:00Z'
  }
];

export const mockDashboardStats: DashboardStats = {
  totalRevenue: 12450,
  totalBookings: 89,
  activeListings: 3,
  totalUsers: 156,
  weeklyBookings: [
    { day: 'Mon', bookings: 12 },
    { day: 'Tue', bookings: 15 },
    { day: 'Wed', bookings: 18 },
    { day: 'Thu', bookings: 22 },
    { day: 'Fri', bookings: 28 },
    { day: 'Sat', bookings: 35 },
    { day: 'Sun', bookings: 24 }
  ],
  monthlyRevenue: [
    { month: 'Jul', revenue: 8200 },
    { month: 'Aug', revenue: 9800 },
    { month: 'Sep', revenue: 11200 },
    { month: 'Oct', revenue: 10500 },
    { month: 'Nov', revenue: 12450 },
    { month: 'Dec', revenue: 13800 }
  ],
  topSpaces: [
    { id: '1', name: 'Downtown Garage', bookings: 45 },
    { id: '2', name: 'Airport Parking', bookings: 28 },
    { id: '3', name: 'Shopping Center', bookings: 16 }
  ]
};