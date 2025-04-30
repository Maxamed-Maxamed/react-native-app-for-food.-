import React, { createContext, useState, useContext, useEffect } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Firebase from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile as firebaseUpdateProfile,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';

// Types
export type UserRole = 'customer' | 'chef';

export type User = {
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
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<boolean>;
  isAuthenticated: boolean;
  isChef: boolean;
  updateProfile: (name: string) => Promise<void>;
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Firebase configuration - in a real app, you would use environment variables
// For development purposes, we'll use the mock users
const firebaseConfig = {
  // Your Firebase config object would go here
  // apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  // authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  // etc.
};

// Initialize Firebase conditionally (for production)
let auth: ReturnType<typeof getAuth>;

// Only initialize Firebase if we're not in development mode or if config is available
const isUsingFirebase = false; // Set to true when ready to use Firebase

if (isUsingFirebase && Object.values(firebaseConfig).every(v => v)) {
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    console.log("Firebase initialized");
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
}

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

    if (isUsingFirebase) {
      // Use Firebase auth state instead
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          // Get user's role from AsyncStorage or another source
          try {
            const userDataJson = await AsyncStorage.getItem(`userData_${firebaseUser.uid}`);
            const userData = userDataJson ? JSON.parse(userDataJson) : { role: 'customer' };
            
            setUser({
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email || '',
              role: userData.role,
            });
          } catch (error) {
            console.error("Error getting user data:", error);
          }
        } else {
          setUser(null);
        }
        setIsLoading(false);
      });

      return () => unsubscribe();
    } else {
      checkLoginStatus();
    }
  }, []);

  // Login function
  const login = async (email: string, password: string, role?: UserRole): Promise<boolean> => {
    if (isUsingFirebase) {
      try {
        // Authenticate with Firebase
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        
        // Check if this user has the correct role
        const userDataJson = await AsyncStorage.getItem(`userData_${firebaseUser.uid}`);
        const userData = userDataJson ? JSON.parse(userDataJson) : { role: 'customer' };
        
        // If a specific role is required and doesn't match, reject login
        if (role && userData.role !== role) {
          await signOut(auth);
          return false;
        }
        
        // Create user object
        const currentUser: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email || '',
          role: userData.role,
        };
        
        setUser(currentUser);
        await AsyncStorage.setItem('user', JSON.stringify(currentUser));
        
        // Navigate based on role
        if (currentUser.role === 'chef') {
          router.replace('/chef-admin/dashboard');
        } else {
          router.replace('/(tabs)/home');
        }
        
        return true;
      } catch (error) {
        console.error("Firebase login error:", error);
        return false;
      }
    } else {
      // Mock implementation for development
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

        return true;
      }
      
      return false;
    }
  };

  // Signup function
  const signup = async (email: string, password: string, name: string, role: UserRole): Promise<boolean> => {
    if (isUsingFirebase) {
      try {
        // Create user with Firebase
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        
        // Update profile to add display name
        await firebaseUpdateProfile(firebaseUser, { displayName: name });
        
        // Store role information in AsyncStorage
        await AsyncStorage.setItem(`userData_${firebaseUser.uid}`, JSON.stringify({ role }));
        
        // Create user object
        const newUser: User = {
          id: firebaseUser.uid,
          name: name,
          email: email,
          role: role,
        };
        
        setUser(newUser);
        await AsyncStorage.setItem('user', JSON.stringify(newUser));
        
        return true;
      } catch (error) {
        console.error("Firebase signup error:", error);
        return false;
      }
    } else {
      // Mock implementation for development
      // Check if email already exists
      if (MOCK_USERS.some(u => u.email === email)) {
        return false;
      }
      
      // Create new mock user
      const newUser: User & { password: string } = {
        id: `${MOCK_USERS.length + 1}`,
        email,
        password,
        name,
        role,
      };
      
      // In a real app, we would save this to a database
      // For mock, we just add to our in-memory array
      MOCK_USERS.push(newUser);
      
      // Create user object (excluding password)
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
      return true;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      if (isUsingFirebase) {
        await signOut(auth);
      }
      await AsyncStorage.removeItem('user');
      setUser(null);
      router.replace('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };
  
  // Update profile function
  const updateProfile = async (name: string) => {
    if (!user) return;
    
    if (isUsingFirebase && auth.currentUser) {
      await firebaseUpdateProfile(auth.currentUser, { displayName: name });
    }
    
    const updatedUser = { ...user, name };
    setUser(updatedUser);
    await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    signup,
    isAuthenticated: !!user,
    isChef: user?.role === 'chef',
    updateProfile,
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