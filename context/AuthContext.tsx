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
import { auth } from '@/services/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase';

// Types
export type UserRole = 'customer' | 'chef';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  photoURL?: string | null;
  bio?: string;
  cuisine?: string;
  phone?: string;
  address?: string;
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
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  updateProfileData: (data: {name?: string, photoURL?: string | null}) => Promise<void>;
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
let authInstance: ReturnType<typeof getAuth>;

// Only initialize Firebase if we're not in development mode or if config is available
const isUsingFirebase = false; // Set to true when ready to use Firebase

if (isUsingFirebase && Object.values(firebaseConfig).every(v => v)) {
  try {
    const app = initializeApp(firebaseConfig);
    authInstance = getAuth(app);
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

  // Update your initial auth check
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        // First check if there's a Firebase user
        const currentFirebaseUser = auth.currentUser;
        
        // Then check AsyncStorage
        const userJSON = await AsyncStorage.getItem('user');
        
        if (currentFirebaseUser && userJSON) {
          // Both Firebase and local auth exist
          const userData = JSON.parse(userJSON) as User;
          
          // Make sure they match - if not, use Firebase user data
          if (userData.id !== currentFirebaseUser.uid) {
            console.log("Local user ID doesn't match Firebase UID, updating...");
            const updatedUser: User = {
              ...userData,
              id: currentFirebaseUser.uid,
              email: currentFirebaseUser.email || userData.email,
              name: currentFirebaseUser.displayName || userData.name,
              photoURL: currentFirebaseUser.photoURL || userData.photoURL,
              role: userData.role, // Preserve the existing role
            };
            
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
          } else {
            setUser(userData);
          }
        } else if (currentFirebaseUser) {
          // Firebase user exists but no local user
          const newUser: User = {
            id: currentFirebaseUser.uid,
            name: currentFirebaseUser.displayName || 'User',
            email: currentFirebaseUser.email || '',
            role: 'chef' as UserRole, // Default to chef for existing Firebase users
            photoURL: currentFirebaseUser.photoURL,
          };
          
          await AsyncStorage.setItem('user', JSON.stringify(newUser));
          setUser(newUser);
        } else if (userJSON) {
          // Only local user exists, need to authenticate with Firebase
          const userData = JSON.parse(userJSON) as User;
          console.log("Local user found, but no Firebase auth. Need to re-authenticate");
          setUser(userData);
        }
      } catch (error) {
        // Error retrieving data
        console.error('Error bootstrapping auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  // Login function
  const login = async (email: string, password: string, role?: UserRole): Promise<boolean> => {
    try {
      // First try Firebase authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Create a properly typed User object
      const userData: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || 'Chef',
        email: email,
        role: role || 'customer', // Default to 'customer' which is a valid UserRole
        photoURL: firebaseUser.photoURL,
      };
      
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      return true;
    } catch (error) {
      console.error('Firebase login error:', error);
      return false;
    }
  };

  // Signup function
  const signup = async (email: string, password: string, name: string, role: UserRole): Promise<boolean> => {
    try {
      // First create the Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update the profile name
      await firebaseUpdateProfile(firebaseUser, {
        displayName: name
      });
      
      const newUser = {
        id: firebaseUser.uid, // Use Firebase UID
        name: name,
        email: email,
        role: role,
      };
      
      setUser(newUser);
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
      
      return true;
    } catch (error) {
      console.error('Firebase signup error:', error);
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Sign out from Firebase
      await signOut(auth);
      
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  // Update profile function
  const updateProfile = async (profileData: Partial<User>) => {
    if (!user || !auth.currentUser) return;
    
    try {
      // Update the display name if provided
      if (profileData.name && auth.currentUser) {
        await firebaseUpdateProfile(auth.currentUser, { 
          displayName: profileData.name 
        });
      }
      
      // Update the photo URL if provided
      if (profileData.photoURL && auth.currentUser) {
        await firebaseUpdateProfile(auth.currentUser, { 
          photoURL: profileData.photoURL 
        });
      }
      
      // Update the local user state
      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);
      
      // Also save to AsyncStorage for persistence
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const updateProfileData = async (data: {name?: string, photoURL?: string | null}) => {
    if (!user) return;
    
    try {
      const updatedUser = { 
        ...user, 
        name: data.name || user.name,
        photoURL: data.photoURL !== undefined ? data.photoURL : user.photoURL
      };
      
      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error updating profile in context:', error);
      throw error;
    }
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
    updateProfileData,
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