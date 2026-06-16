import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser, getMe, type StrapiUser } from '@/services/api';
import { toast } from 'sonner';

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
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string, phone: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const JWT_KEY = 'jwt';

const mapStrapiUserToAuthUser = (strapiUser: StrapiUser, id: string): AuthUser => {
  const isAdmin = strapiUser.role?.name === 'Admin' || strapiUser.role?.type === 'admin';
  
  return {
    id,
    email: strapiUser.email,
    name: strapiUser.username || strapiUser.email.split('@')[0],
    phone: null, // Strapi default users don't have phone by default
    avatar_url: null,
    isAdmin,
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem(JWT_KEY);
        
        if (storedToken) {
          // Validate token by fetching user info
          const strapiUser = await getMe(storedToken);
          const authUser = mapStrapiUserToAuthUser(strapiUser, String(strapiUser.email));
          
          setToken(storedToken);
          setUser(authUser);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid token
        localStorage.removeItem(JWT_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await loginUser(email, password);
      
      // Store token
      localStorage.setItem(JWT_KEY, response.jwt);
      setToken(response.jwt);
      
      // Map user
      const authUser = mapStrapiUserToAuthUser(response.user, String(response.user.email));
      setUser(authUser);
      
      toast.success('Welcome back!');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your credentials.');
      return false;
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    phone: string
  ): Promise<boolean> => {
    try {
      // Note: Strapi default registration doesn't support phone field
      // You may need to extend the User model in Strapi to include phone
      const response = await registerUser({
        username,
        email,
        password,
      });
      
      // Auto-login after registration
      localStorage.setItem(JWT_KEY, response.jwt);
      setToken(response.jwt);
      
      const authUser = mapStrapiUserToAuthUser(response.user, String(response.user.email));
      setUser(authUser);
      
      toast.success('Account created successfully!');
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem(JWT_KEY);
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
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
