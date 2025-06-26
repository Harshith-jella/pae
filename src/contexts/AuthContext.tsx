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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setError('Unable to verify your login status. Please try refreshing the page.');
        } else if (session?.user && mounted) {
          await loadUserProfile(session.user);
        }
      } catch (error: any) {
        console.error('Error in getInitialSession:', error);
        setError('Unable to connect to the authentication service. Please refresh the page.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

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
      
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error loading user profile:', error);
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
        return false;
      }

      if (data.user) {
        console.log('Login successful, loading profile...');
        await loadUserProfile(data.user);
      }

      return true;
    } catch (error: any) {
      console.error('Login exception:', error);
      setError(error.message || 'An unexpected error occurred during login. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
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
        return false;
      }

      console.log('Registration response:', data);

      if (data.user) {
        if (!data.session) {
          setError('Please check your email to confirm your account before signing in.');
          return false;
        }
        
        await loadUserProfile(data.user);
      }

      return true;
    } catch (error: any) {
      console.error('Registration exception:', error);
      setError(error.message || 'An unexpected error occurred during registration. Please try again.');
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