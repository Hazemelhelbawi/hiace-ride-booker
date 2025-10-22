import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import * as storage from '@/services/localStorage';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string, phone: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple password hashing (in production, use proper backend authentication)
const hashPassword = (password: string): string => {
  return btoa(password); // Base64 encode for demo purposes
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for existing session
    const currentUser = storage.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Admin credentials
      if (email === 'admin@lovable.test' && password === 'LovableAdmin#2025') {
        const adminUser = storage.getUserByEmail(email);
        if (adminUser) {
          setUser(adminUser);
          storage.setCurrentUser(adminUser);
          toast.success('Welcome back, Admin!');
          return true;
        }
      }

      // Regular user login
      const foundUser = storage.getUserByEmail(email);
      if (foundUser) {
        // In a real app, verify password hash
        setUser(foundUser);
        storage.setCurrentUser(foundUser);
        toast.success(`Welcome back, ${foundUser.name}!`);
        return true;
      }

      toast.error('Invalid credentials');
      return false;
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
      // Check if user already exists
      const existingUser = storage.getUserByEmail(email);
      if (existingUser) {
        toast.error('Email already registered');
        return false;
      }

      const newUser: User = {
        id: Date.now().toString(),
        email,
        name,
        phone,
        isAdmin: false,
        createdAt: new Date().toISOString(),
      };

      storage.addUser(newUser);
      setUser(newUser);
      storage.setCurrentUser(newUser);
      toast.success('Account created successfully!');
      return true;
    } catch (error) {
      toast.error('Signup failed. Please try again.');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    storage.setCurrentUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
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
