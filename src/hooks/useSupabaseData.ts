import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ParkingSpace, Booking } from '../types';

export const useSupabaseData = () => {
  const [parkingSpaces, setParkingSpaces] = useState<ParkingSpace[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchParkingSpaces = async () => {
    try {
      const { data, error } = await supabase
        .from('parking_spaces')
        .select(`
          *,
          owner:user_profiles(name, email)
        `)
        .eq('is_active', true);

      if (error) throw error;

      const formattedSpaces: ParkingSpace[] = (data || []).map(space => ({
        id: space.id,
        ownerId: space.owner_id,
        title: space.title,
        description: space.description || '',
        address: space.address,
        city: space.city,
        state: space.state,
        zipCode: space.zip_code,
        latitude: parseFloat(space.latitude || '0'),
        longitude: parseFloat(space.longitude || '0'),
        pricePerHour: parseFloat(space.price_per_hour),
        images: space.images || [],
        amenities: space.amenities || [],
        size: space.size,
        type: space.type,
        availability: [],
        isActive: space.is_active,
        rating: parseFloat(space.rating || '0'),
        reviewCount: space.review_count || 0,
        createdAt: space.created_at
      }));

      setParkingSpaces(formattedSpaces);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          space:parking_spaces(title, address, city, state),
          user:user_profiles(name, email)
        `);

      if (error) throw error;

      const formattedBookings: Booking[] = (data || []).map(booking => ({
        id: booking.id,
        userId: booking.user_id,
        spaceId: booking.space_id,
        startDate: booking.start_date,
        endDate: booking.end_date,
        startTime: booking.start_time,
        endTime: booking.end_time,
        totalAmount: parseFloat(booking.total_amount),
        status: booking.status,
        paymentStatus: booking.payment_status,
        isRecurring: booking.is_recurring,
        recurringDays: booking.recurring_days,
        createdAt: booking.created_at,
        updatedAt: booking.updated_at
      }));

      setBookings(formattedBookings);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    await Promise.all([
      fetchParkingSpaces(),
      fetchBookings()
    ]);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refetch = () => {
    fetchData();
  };

  return {
    parkingSpaces,
    bookings,
    loading,
    error,
    refetch
  };
};

export const useUserSpaces = (userId: string) => {
  const [spaces, setSpaces] = useState<ParkingSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserSpaces = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('parking_spaces')
          .select('*')
          .eq('owner_id', userId);

        if (error) throw error;

        const formattedSpaces: ParkingSpace[] = (data || []).map(space => ({
          id: space.id,
          ownerId: space.owner_id,
          title: space.title,
          description: space.description || '',
          address: space.address,
          city: space.city,
          state: space.state,
          zipCode: space.zip_code,
          latitude: parseFloat(space.latitude || '0'),
          longitude: parseFloat(space.longitude || '0'),
          pricePerHour: parseFloat(space.price_per_hour),
          images: space.images || [],
          amenities: space.amenities || [],
          size: space.size,
          type: space.type,
          availability: [],
          isActive: space.is_active,
          rating: parseFloat(space.rating || '0'),
          reviewCount: space.review_count || 0,
          createdAt: space.created_at
        }));

        setSpaces(formattedSpaces);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserSpaces();
  }, [userId]);

  return { spaces, loading, error };
};

export const useUserBookings = (userId: string) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserBookings = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            space:parking_spaces(title, address, city, state, images)
          `)
          .eq('user_id', userId);

        if (error) throw error;

        const formattedBookings: Booking[] = (data || []).map(booking => ({
          id: booking.id,
          userId: booking.user_id,
          spaceId: booking.space_id,
          startDate: booking.start_date,
          endDate: booking.end_date,
          startTime: booking.start_time,
          endTime: booking.end_time,
          totalAmount: parseFloat(booking.total_amount),
          status: booking.status,
          paymentStatus: booking.payment_status,
          isRecurring: booking.is_recurring,
          recurringDays: booking.recurring_days,
          createdAt: booking.created_at,
          updatedAt: booking.updated_at
        }));

        setBookings(formattedBookings);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserBookings();
  }, [userId]);

  return { bookings, loading, error };
};

export const useOwnerBookings = (ownerId: string) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOwnerBookings = async () => {
      if (!ownerId) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            space:parking_spaces!inner(title, address, city, state, images),
            user:user_profiles(name, email)
          `)
          .eq('space.owner_id', ownerId);

        if (error) throw error;

        const formattedBookings: Booking[] = (data || []).map(booking => ({
          id: booking.id,
          userId: booking.user_id,
          spaceId: booking.space_id,
          startDate: booking.start_date,
          endDate: booking.end_date,
          startTime: booking.start_time,
          endTime: booking.end_time,
          totalAmount: parseFloat(booking.total_amount),
          status: booking.status,
          paymentStatus: booking.payment_status,
          isRecurring: booking.is_recurring,
          recurringDays: booking.recurring_days,
          createdAt: booking.created_at,
          updatedAt: booking.updated_at
        }));

        setBookings(formattedBookings);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerBookings();
  }, [ownerId]);

  return { bookings, loading, error };
};