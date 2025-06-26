import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, auth, db } from '../lib/supabase';
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

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else if (session?.user && mounted) {
          await loadUserProfile(session.user);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
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

      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      console.log('Loading user profile for:', supabaseUser.email);
      
      // First, try to get the profile
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();
      
      if (error) {
        console.error('Error loading user profile:', error);
        
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') {
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
        } else {
          // For other errors (like RLS issues), fall back to auth user data
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
        }
        return;
      }

      if (profile) {
        setUser({
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.role,
          avatar: profile.avatar_url,
          createdAt: profile.created_at
        });
      }
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Login error:', error);
        setError(error.message);
        setIsLoading(false);
        return false;
      }

      if (data.user) {
        await loadUserProfile(data.user);
      }

      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred during login');
      setIsLoading(false);
      return false;
    }
  };

  const register = async (email: string, password: string, name: string, role: 'owner' | 'user'): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Starting registration with:', { email, name, role });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            name: name,
            role: role
          }
        }
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
    } catch (error) {
      console.error('Registration error:', error);
      setError('An unexpected error occurred during registration');
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setError(null);
    } catch (error) {
      console.error('Logout error:', error);
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