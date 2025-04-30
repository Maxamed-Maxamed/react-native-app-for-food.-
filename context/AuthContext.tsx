import React, { createContext, useState, useContext, useEffect } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
type UserRole = 'customer' | 'chef';

type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  // Add other user properties as needed
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isChef: boolean;
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for development purposes
const MOCK_USERS = [
  {
    id: '1',
    email: 'user@example.com',
    password: 'password',
    name: 'John Doe',
    role: 'customer' as UserRole,
  },
  {
    id: '2',
    email: 'chef@example.com',
    password: 'chefpass',
    name: 'Jacob Jones',
    role: 'chef' as UserRole,
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userJson = await AsyncStorage.getItem('user');
        if (userJson) {
          const userData = JSON.parse(userJson);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error retrieving user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  // Login function - modified to handle role parameter
  const login = async (email: string, password: string, role?: UserRole): Promise<boolean> => {
    // In a real app, you would authenticate with your backend service
    // This is a mock implementation for demo purposes
    
    // If role is provided, filter by role, otherwise just check credentials
    const matchedUser = role 
      ? MOCK_USERS.find(u => u.email === email && u.password === password && u.role === role)
      : MOCK_USERS.find(u => u.email === email && u.password === password);

    if (matchedUser) {
      // Create user object (excluding password)
      const { password: _, ...userWithoutPassword } = matchedUser;
      setUser(userWithoutPassword);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(userWithoutPassword));

      // Route based on role
      if (matchedUser.role === 'chef') {
        router.replace('/chef-admin/dashboard');
      } else {
        router.replace('/(tabs)/home');
      }
      
      return true;
    }
    
    return false;
  };

  // Logout function
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
      router.replace('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
    isChef: user?.role === 'chef',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};