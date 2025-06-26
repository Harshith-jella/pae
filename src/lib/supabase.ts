import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with additional configuration to handle potential schema issues
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'pae-parking-app'
    }
  },
  db: {
    schema: 'public'
  }
});

// Enhanced test connection function with better error handling
export const testConnection = async () => {
  try {
    // First try a simple health check
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
    if (error) {
      console.error('Connection test failed:', error);
      
      // Check if it's a schema-related error
      if (error.message.includes('schema') || error.message.includes('relation') || error.message.includes('does not exist')) {
        console.error('Database schema issue detected');
        return false;
      }
      
      // Check if it's a permission error (which might indicate the connection is working but RLS is blocking)
      if (error.message.includes('permission') || error.message.includes('policy')) {
        console.log('Connection working but RLS policies may be blocking - this is expected');
        return true;
      }
      
      return false;
    }
    console.log('Supabase connection successful');
    return true;
  } catch (error: any) {
    console.error('Connection test error:', error);
    
    // Network or fetch errors
    if (error.message?.includes('fetch') || error.message?.includes('network')) {
      console.error('Network connectivity issue');
      return false;
    }
    
    // Server errors (500, 502, etc.)
    if (error.status >= 500) {
      console.error('Server error detected:', error.status);
      return false;
    }
    
    return false;
  }
};

// Enhanced auth helpers with comprehensive error handling
export const auth = {
  signUp: async (email: string, password: string, metadata: any = {}) => {
    try {
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      
      if (result.error) {
        console.error('SignUp error:', result.error);
        
        // Handle specific Supabase auth errors
        if (result.error.message.includes('Database error')) {
          throw new Error('The authentication service is temporarily unavailable. Please try again later.');
        }
        
        if (result.error.message.includes('schema')) {
          throw new Error('There is a configuration issue with the authentication service. Please contact support.');
        }
        
        if (result.error.message.includes('User already registered')) {
          throw new Error('An account with this email already exists. Please try signing in instead.');
        }
        
        // Pass through the original error for other cases
        throw new Error(result.error.message);
      }
      
      return result;
    } catch (error: any) {
      console.error('SignUp exception:', error);
      
      // If it's already a handled error, re-throw it
      if (error.message.includes('authentication service') || 
          error.message.includes('configuration issue') ||
          error.message.includes('already exists')) {
        throw error;
      }
      
      // Handle network errors
      if (error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      
      // Generic fallback
      throw new Error('Registration failed due to a server error. Please try again later.');
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      // Test connection first with a more lenient approach
      const connectionOk = await testConnection();
      if (!connectionOk) {
        // Don't immediately fail - the auth endpoint might still work
        console.warn('Connection test failed, but attempting authentication anyway...');
      }

      const result = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (result.error) {
        console.error('SignIn error:', result.error);
        
        // Handle specific error cases with more user-friendly messages
        if (result.error.message.includes('Database error querying schema')) {
          throw new Error('The authentication service is experiencing technical difficulties. This appears to be a temporary server issue. Please try again in a few minutes, or contact support if the problem persists.');
        }
        
        if (result.error.message.includes('Database error')) {
          throw new Error('Authentication service is temporarily unavailable. Please try again in a moment.');
        }
        
        if (result.error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        }
        
        if (result.error.message.includes('Email not confirmed')) {
          throw new Error('Please check your email and confirm your account before signing in.');
        }
        
        if (result.error.message.includes('schema')) {
          throw new Error('There is a configuration issue with the authentication service. Please contact support.');
        }
        
        // For unexpected_failure or other server errors
        if (result.error.message.includes('unexpected_failure')) {
          throw new Error('The server encountered an unexpected error. This is likely a temporary issue - please try again in a few minutes.');
        }
        
        // Pass through the original error message for other cases
        throw new Error(result.error.message);
      }
      
      return result;
    } catch (error: any) {
      console.error('SignIn exception:', error);
      
      // If it's already a handled error with a user-friendly message, re-throw it
      if (error.message.includes('authentication service') || 
          error.message.includes('technical difficulties') ||
          error.message.includes('Invalid email') ||
          error.message.includes('configuration issue') ||
          error.message.includes('unexpected error')) {
        throw error;
      }
      
      // Handle network errors
      if (error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      
      // Handle timeout errors
      if (error.message?.includes('timeout')) {
        throw new Error('The request timed out. Please check your connection and try again.');
      }
      
      // Generic fallback for unexpected errors
      throw new Error('Login failed due to a server error. Please try again later.');
    }
  },

  signOut: async () => {
    try {
      return await supabase.auth.signOut();
    } catch (error) {
      console.error('SignOut error:', error);
      // Don't throw on logout errors - just log them
      return { error: null };
    }
  },

  getCurrentUser: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('GetCurrentUser error:', error);
      return null;
    }
  },

  getCurrentSession: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('GetCurrentSession error:', error);
      return null;
    }
  }
};

// Database helpers with better error handling
export const db = {
  // User profiles
  getUserProfile: async (userId: string) => {
    try {
      return await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
    } catch (error) {
      console.error('getUserProfile error:', error);
      throw error;
    }
  },

  updateUserProfile: async (userId: string, updates: any) => {
    try {
      return await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId);
    } catch (error) {
      console.error('updateUserProfile error:', error);
      throw error;
    }
  },

  // Parking spaces
  getParkingSpaces: async (filters: any = {}) => {
    try {
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
    } catch (error) {
      console.error('getParkingSpaces error:', error);
      throw error;
    }
  },

  getOwnerSpaces: async (ownerId: string) => {
    try {
      return await supabase
        .from('parking_spaces')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });
    } catch (error) {
      console.error('getOwnerSpaces error:', error);
      throw error;
    }
  },

  createParkingSpace: async (spaceData: any) => {
    try {
      return await supabase
        .from('parking_spaces')
        .insert(spaceData);
    } catch (error) {
      console.error('createParkingSpace error:', error);
      throw error;
    }
  },

  updateParkingSpace: async (spaceId: string, updates: any) => {
    try {
      return await supabase
        .from('parking_spaces')
        .update(updates)
        .eq('id', spaceId);
    } catch (error) {
      console.error('updateParkingSpace error:', error);
      throw error;
    }
  },

  // Bookings
  getUserBookings: async (userId: string) => {
    try {
      return await supabase
        .from('bookings')
        .select(`
          *,
          space:parking_spaces(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    } catch (error) {
      console.error('getUserBookings error:', error);
      throw error;
    }
  },

  getOwnerBookings: async (ownerId: string) => {
    try {
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
    } catch (error) {
      console.error('getOwnerBookings error:', error);
      throw error;
    }
  },

  createBooking: async (bookingData: any) => {
    try {
      return await supabase
        .from('bookings')
        .insert(bookingData);
    } catch (error) {
      console.error('createBooking error:', error);
      throw error;
    }
  },

  updateBookingStatus: async (bookingId: string, status: string) => {
    try {
      return await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);
    } catch (error) {
      console.error('updateBookingStatus error:', error);
      throw error;
    }
  },

  // Reviews
  getSpaceReviews: async (spaceId: string) => {
    try {
      return await supabase
        .from('reviews')
        .select(`
          *,
          user:user_profiles(name, avatar_url)
        `)
        .eq('space_id', spaceId)
        .order('created_at', { ascending: false });
    } catch (error) {
      console.error('getSpaceReviews error:', error);
      throw error;
    }
  },

  createReview: async (reviewData: any) => {
    try {
      return await supabase
        .from('reviews')
        .insert(reviewData);
    } catch (error) {
      console.error('createReview error:', error);
      throw error;
    }
  },

  // Analytics
  getDashboardStats: async (userRole: string = 'admin') => {
    try {
      const { data, error } = await supabase
        .rpc('get_dashboard_stats', { user_role: userRole });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('getDashboardStats error:', error);
      throw error;
    }
  },

  getBookingAnalytics: async (startDate?: string, endDate?: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_booking_analytics', { 
          start_date: startDate, 
          end_date: endDate 
        });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('getBookingAnalytics error:', error);
      throw error;
    }
  },

  // Notifications
  getUserNotifications: async (userId: string) => {
    try {
      return await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    } catch (error) {
      console.error('getUserNotifications error:', error);
      throw error;
    }
  },

  markNotificationAsRead: async (notificationId: string) => {
    try {
      return await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
    } catch (error) {
      console.error('markNotificationAsRead error:', error);
      throw error;
    }
  },

  // Admin functions
  getAllUsers: async () => {
    try {
      return await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });
    } catch (error) {
      console.error('getAllUsers error:', error);
      throw error;
    }
  },

  getAllSpaces: async () => {
    try {
      return await supabase
        .from('parking_spaces')
        .select(`
          *,
          owner:user_profiles(name, email)
        `)
        .order('created_at', { ascending: false });
    } catch (error) {
      console.error('getAllSpaces error:', error);
      throw error;
    }
  },

  getAllBookings: async () => {
    try {
      return await supabase
        .from('bookings')
        .select(`
          *,
          space:parking_spaces(title, city),
          user:user_profiles(name, email)
        `)
        .order('created_at', { ascending: false });
    } catch (error) {
      console.error('getAllBookings error:', error);
      throw error;
    }
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