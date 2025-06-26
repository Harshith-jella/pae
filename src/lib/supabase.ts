import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with timeout configuration
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
    },
    fetch: (url, options = {}) => {
      return fetch(url, {
        ...options,
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
    }
  },
  db: {
    schema: 'public'
  }
});

// Simple connection test with timeout
export const testConnection = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1)
      .abortSignal(controller.signal);
    
    clearTimeout(timeoutId);
    
    if (error) {
      console.error('Connection test failed:', error);
      return false;
    }
    
    console.log('Supabase connection successful');
    return true;
  } catch (error: any) {
    console.error('Connection test error:', error);
    return false;
  }
};

// Enhanced auth helpers with timeout and better error handling
export const auth = {
  signUp: async (email: string, password: string, metadata: any = {}) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      
      clearTimeout(timeoutId);
      
      if (result.error) {
        console.error('SignUp error:', result.error);
        
        if (result.error.message.includes('Database error')) {
          throw new Error('The authentication service is temporarily unavailable. Please try again later.');
        }
        
        if (result.error.message.includes('User already registered')) {
          throw new Error('An account with this email already exists. Please try signing in instead.');
        }
        
        throw new Error(result.error.message);
      }
      
      return result;
    } catch (error: any) {
      console.error('SignUp exception:', error);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please check your connection and try again.');
      }
      
      if (error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      
      throw error;
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const result = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      clearTimeout(timeoutId);
      
      if (result.error) {
        console.error('SignIn error:', result.error);
        
        if (result.error.message.includes('Database error')) {
          throw new Error('The authentication service is experiencing issues. Please try again in a moment.');
        }
        
        if (result.error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        }
        
        if (result.error.message.includes('unexpected_failure')) {
          throw new Error('Server error. Please try again in a few minutes.');
        }
        
        throw new Error(result.error.message);
      }
      
      return result;
    } catch (error: any) {
      console.error('SignIn exception:', error);
      
      if (error.name === 'AbortError') {
        throw new Error('Login request timed out. Please try again.');
      }
      
      if (error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      
      throw error;
    }
  },

  signOut: async () => {
    try {
      return await supabase.auth.signOut();
    } catch (error) {
      console.error('SignOut error:', error);
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

// Database helpers with timeout
export const db = {
  getUserProfile: async (userId: string) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const result = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()
        .abortSignal(controller.signal);
      
      clearTimeout(timeoutId);
      return result;
    } catch (error) {
      console.error('getUserProfile error:', error);
      throw error;
    }
  }
};