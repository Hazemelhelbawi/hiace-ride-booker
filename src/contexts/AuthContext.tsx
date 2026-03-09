import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface Profile {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  avatar_url: string | null;
}

interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatar_url: string | null;
  isAdmin: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string, phone: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = useCallback(async (supabaseUser: SupabaseUser): Promise<AuthUser | null> => {
    try {
      // Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .maybeSingle();

      if (profileError) {
        logger.error('Error fetching profile:', profileError);
      }

      // Fetch role - get all roles and check for admin
      const { data: rolesData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', supabaseUser.id);

      if (roleError) {
        logger.error('Error fetching role:', roleError);
      }

      // Check if user has admin role (handles multiple roles)
      const isAdmin = rolesData?.some(r => r.role === 'admin') ?? false;

      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: profile?.name || supabaseUser.email?.split('@')[0] || 'User',
        phone: profile?.phone || null,
        avatar_url: profile?.avatar_url || null,
        isAdmin,
      };
    } catch (error) {
      logger.error('Error in fetchUserData:', error);
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!session?.user) return;
    const userData = await fetchUserData(session.user);
    if (userData) {
      setUser(userData);
    }
  }, [session, fetchUserData]);

  useEffect(() => {
    // Set up auth state listener BEFORE checking session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        
        if (newSession?.user) {
          // Use setTimeout to prevent potential deadlocks
          setTimeout(async () => {
            const userData = await fetchUserData(newSession.user);
            setUser(userData);
            setIsLoading(false);
          }, 0);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session: existingSession } }) => {
      setSession(existingSession);
      
      if (existingSession?.user) {
        const userData = await fetchUserData(existingSession.user);
        setUser(userData);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUserData]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return false;
      }

      toast.success('Welcome back!');
      return true;
    } catch (error) {
      toast.error('Login failed. Please try again.');
      return false;
    }
  };

  const signup = async (
    email: string,
    password: string,
    name: string,
    phone: string
  ): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            name,
            phone,
          },
        },
      });

      if (error) {
        toast.error(error.message);
        return false;
      }

      // Update profile with phone number
      toast.success('Account created successfully!');
      return true;
    } catch (error) {
      toast.error('Signup failed. Please try again.');
      return false;
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      toast.error(error.message);
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Logout failed. Please try again.');
    } else {
      setUser(null);
      setSession(null);
      toast.success('Logged out successfully');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        signInWithGoogle,
        logout,
        refreshProfile,
      }}
    >
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
