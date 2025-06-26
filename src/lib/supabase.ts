import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

export const auth = {
  signUp: async (email: string, password: string, metadata: any = {}) => {
    const result = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata }
    });
    
    if (result.error) {
      throw new Error(result.error.message);
    }
    
    return result;
  },

  signIn: async (email: string, password: string) => {
    const result = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (result.error) {
      throw new Error(result.error.message);
    }
    
    return result;
  },

  signOut: async () => {
    return await supabase.auth.signOut();
  }
};