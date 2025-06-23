import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const auth = {
  signUp: async (email: string, password: string, metadata: any = {}) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
  },

  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password
    });
  },

  signOut: async () => {
    return await supabase.auth.signOut();
  },

  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  getCurrentSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }
};

// Database helpers
export const db = {
  // User profiles
  getUserProfile: async (userId: string) => {
    return await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
  },

  updateUserProfile: async (userId: string, updates: any) => {
    return await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId);
  },

  // Parking spaces
  getParkingSpaces: async (filters: any = {}) => {
    let query = supabase
      .from('parking_spaces')
      .select(`
        *,
        owner:user_profiles(name, email)
      `)
      .eq('is_active', true);

    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`);
    }
    if (filters.maxPrice) {
      query = query.lte('price_per_hour', filters.maxPrice);
    }
    if (filters.type && filters.type !== 'all') {
      query = query.eq('type', filters.type);
    }

    return await query.order('created_at', { ascending: false });
  },

  getOwnerSpaces: async (ownerId: string) => {
    return await supabase
      .from('parking_spaces')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });
  },

  createParkingSpace: async (spaceData: any) => {
    return await supabase
      .from('parking_spaces')
      .insert(spaceData);
  },

  updateParkingSpace: async (spaceId: string, updates: any) => {
    return await supabase
      .from('parking_spaces')
      .update(updates)
      .eq('id', spaceId);
  },

  // Bookings
  getUserBookings: async (userId: string) => {
    return await supabase
      .from('bookings')
      .select(`
        *,
        space:parking_spaces(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  },

  getOwnerBookings: async (ownerId: string) => {
    return await supabase
      .from('bookings')
      .select(`
        *,
        space:parking_spaces(*),
        user:user_profiles(name, email)
      `)
      .in('space_id', 
        supabase
          .from('parking_spaces')
          .select('id')
          .eq('owner_id', ownerId)
      )
      .order('created_at', { ascending: false });
  },

  createBooking: async (bookingData: any) => {
    return await supabase
      .from('bookings')
      .insert(bookingData);
  },

  updateBookingStatus: async (bookingId: string, status: string) => {
    return await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId);
  },

  // Reviews
  getSpaceReviews: async (spaceId: string) => {
    return await supabase
      .from('reviews')
      .select(`
        *,
        user:user_profiles(name, avatar_url)
      `)
      .eq('space_id', spaceId)
      .order('created_at', { ascending: false });
  },

  createReview: async (reviewData: any) => {
    return await supabase
      .from('reviews')
      .insert(reviewData);
  },

  // Analytics
  getDashboardStats: async (userRole: string = 'admin') => {
    const { data, error } = await supabase
      .rpc('get_dashboard_stats', { user_role: userRole });
    
    if (error) throw error;
    return data;
  },

  getBookingAnalytics: async (startDate?: string, endDate?: string) => {
    const { data, error } = await supabase
      .rpc('get_booking_analytics', { 
        start_date: startDate, 
        end_date: endDate 
      });
    
    if (error) throw error;
    return data;
  },

  // Notifications
  getUserNotifications: async (userId: string) => {
    return await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  },

  markNotificationAsRead: async (notificationId: string) => {
    return await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
  },

  // Admin functions
  getAllUsers: async () => {
    return await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });
  },

  getAllSpaces: async () => {
    return await supabase
      .from('parking_spaces')
      .select(`
        *,
        owner:user_profiles(name, email)
      `)
      .order('created_at', { ascending: false });
  },

  getAllBookings: async () => {
    return await supabase
      .from('bookings')
      .select(`
        *,
        space:parking_spaces(title, city),
        user:user_profiles(name, email)
      `)
      .order('created_at', { ascending: false });
  }
};

// Real-time subscriptions
export const subscriptions = {
  subscribeToBookings: (callback: (payload: any) => void) => {
    return supabase
      .channel('bookings')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'bookings' }, 
        callback
      )
      .subscribe();
  },

  subscribeToNotifications: (userId: string, callback: (payload: any) => void) => {
    return supabase
      .channel('notifications')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        }, 
        callback
      )
      .subscribe();
  }
};