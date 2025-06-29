import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, auth } from '../lib/supabase';
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

// Demo users for development
const DEMO_USERS = {
  'admin@pae.com': {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'admin@pae.com',
    name: 'Admin User',
    role: 'admin' as const,
    createdAt: '2024-01-01T00:00:00Z'
  },
  'owner@pae.com': {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'owner@pae.com',
    name: 'Space Owner',
    role: 'owner' as const,
    createdAt: '2024-01-01T00:00:00Z'
  },
  'user@pae.com': {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'user@pae.com',
    name: 'Regular User',
    role: 'user' as const,
    createdAt: '2024-01-01T00:00:00Z'
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          if (session?.user) {
            await loadUserProfile(session.user);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
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
      }
      
      if (mounted) {
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
      // Try to get the profile from the database
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      if (profile) {
        setUser({
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.role,
          avatar: profile.avatar_url,
          createdAt: profile.created_at
        });
      } else {
        // Create a fallback user from auth data
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
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Create a fallback user even if there's an error
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
      // Check if this is a demo credential
      if (DEMO_USERS[email as keyof typeof DEMO_USERS] && password === 'password123') {
        const demoUser = DEMO_USERS[email as keyof typeof DEMO_USERS];
        setUser(demoUser);
        setIsLoading(false);
        return true;
      }

      // Try regular Supabase authentication
      const { data, error } = await auth.signIn(email, password);
      
      if (error) {
        setError(error.message);
        return false;
      }

      if (data.user) {
        await loadUserProfile(data.user);
      }

      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role: 'owner' | 'user'): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await auth.signUp(email, password, {
        full_name: name,
        name: name,
        role: role
      });
      
      if (error) {
        setError(error.message);
        return false;
      }

      if (data.user) {
        if (!data.session) {
          setError('Please check your email to confirm your account before signing in.');
          return false;
        }
        
        await loadUserProfile(data.user);
      }

      return true;
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setError(null);
    } catch (error) {
      console.error('Logout error:', error);
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