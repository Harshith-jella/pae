import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, auth, testConnection } from '../lib/supabase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string, role: 'owner' | 'user') => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // Test connection and get initial session
    const getInitialSession = async () => {
      try {
        // Test database connection first
        const connectionOk = await testConnection();
        if (!connectionOk) {
          console.warn('Database connection test failed, but continuing with auth check...');
        }

        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          
          // Handle specific session errors more gracefully
          if (error.message.includes('Database error') || error.message.includes('schema')) {
            setError('Authentication service is experiencing issues. Some features may be limited.');
          } else {
            setError('Unable to verify your login status. Please try refreshing the page.');
          }
        } else if (session?.user && mounted) {
          await loadUserProfile(session.user);
        }
      } catch (error: any) {
        console.error('Error in getInitialSession:', error);
        
        // More specific error handling for initial session
        if (error.message?.includes('fetch') || error.message?.includes('network')) {
          setError('Network connection issue. Please check your internet connection.');
        } else if (error.message?.includes('schema') || error.message?.includes('Database')) {
          setError('Authentication service is temporarily unavailable. Please try again later.');
        } else {
          setError('Unable to connect to the authentication service. Please refresh the page.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (!mounted) return;

      try {
        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setError(null);
        }
      } catch (error) {
        console.error('Error handling auth state change:', error);
        // Don't set error state for auth state change issues
        // as this might be a temporary problem
      } finally {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      console.log('Loading user profile for:', supabaseUser.email);
      
      // Get the profile - use maybeSingle() to avoid errors when no profile exists
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error loading user profile:', error);
        // For database errors, fall back to using auth user data
        console.log('Using fallback user data due to profile error');
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          name: supabaseUser.user_metadata?.full_name || 
                supabaseUser.user_metadata?.name || 
                'User',
          role: (supabaseUser.user_metadata?.role as 'admin' | 'owner' | 'user') || 'user',
          createdAt: supabaseUser.created_at
        });
        return;
      }

      // If no profile exists, create one
      if (!profile) {
        console.log('Profile not found, creating...');
        
        const profileData = {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          name: supabaseUser.user_metadata?.full_name || 
                supabaseUser.user_metadata?.name || 
                'New User',
          role: supabaseUser.user_metadata?.role || 'user'
        };

        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert(profileData)
          .select()
          .single();
        
        if (createError) {
          console.error('Error creating profile:', createError);
          // Fall back to using auth user data
          setUser({
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            name: profileData.name,
            role: profileData.role as 'admin' | 'owner' | 'user',
            createdAt: supabaseUser.created_at
          });
          return;
        }
        
        if (newProfile) {
          setUser({
            id: newProfile.id,
            email: newProfile.email,
            name: newProfile.name,
            role: newProfile.role,
            avatar: newProfile.avatar_url,
            createdAt: newProfile.created_at
          });
        }
        return;
      }

      // Profile exists, use it
      setUser({
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        avatar: profile.avatar_url,
        createdAt: profile.created_at
      });
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      // Fall back to using auth user data
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.user_metadata?.full_name || 
              supabaseUser.user_metadata?.name || 
              'User',
        role: (supabaseUser.user_metadata?.role as 'admin' | 'owner' | 'user') || 'user',
        createdAt: supabaseUser.created_at
      });
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Attempting login for:', email);
      
      const { data, error } = await auth.signIn(email, password);
      
      if (error) {
        console.error('Login error:', error);
        setError(error.message);
        setIsLoading(false);
        return false;
      }

      if (data.user) {
        console.log('Login successful, loading profile...');
        await loadUserProfile(data.user);
      }

      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error('Login exception:', error);
      
      // The error message from auth.signIn is already user-friendly
      setError(error.message || 'An unexpected error occurred during login. Please try again.');
      
      setIsLoading(false);
      return false;
    }
  };

  const register = async (email: string, password: string, name: string, role: 'owner' | 'user'): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Starting registration with:', { email, name, role });
      
      const { data, error } = await auth.signUp(email, password, {
        full_name: name,
        name: name,
        role: role
      });
      
      if (error) {
        console.error('Registration error:', error);
        setError(error.message);
        setIsLoading(false);
        return false;
      }

      console.log('Registration response:', data);

      if (data.user) {
        // Check if email confirmation is required
        if (!data.session) {
          setError('Please check your email to confirm your account before signing in.');
          setIsLoading(false);
          return false;
        }
        
        // If we have a session, the user is automatically signed in
        await loadUserProfile(data.user);
      }

      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error('Registration exception:', error);
      
      // The error message from auth.signUp is already user-friendly
      setError(error.message || 'An unexpected error occurred during registration. Please try again.');
      
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setError(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Don't show logout errors to user - just clear the state
      setUser(null);
      setError(null);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      register, 
      isLoading,
      error
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};