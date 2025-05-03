import { initializeApp } from 'firebase/app';
import { 
    createUserWithEmailAndPassword, 
    signOut,
    signInWithEmailAndPassword, 
    onAuthStateChanged,
    User,
    initializeAuth,
    getReactNativePersistence,
    getAuth, 
    signInWithCredential,
    signInWithPopup,
    GoogleAuthProvider,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native'; 

// Make sure to register your scheme and client IDs
WebBrowser.maybeCompleteAuthSession();

// Add debug logging to verify config
console.log("Firebase config (redacted):", {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ? "present" : "missing",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ? "present" : "missing",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ? "present" : "missing",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ? "present" : "missing",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? "present" : "missing",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ? "present" : "missing",
});

// Make sure all required config values are present
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase only if config is valid
const isConfigValid = Object.values(firebaseConfig).every(value => !!value);

if (!isConfigValid) {
  console.warn("Firebase configuration is incomplete. Some features may not work correctly.");
}

const app = initializeApp(firebaseConfig);

// Initialize auth with AsyncStorage persistence
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

// Check what the current auth state is
console.log("Current Firebase auth state:", auth.currentUser ? "User authenticated" : "No authenticated user");

// Consolidated auth state listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Auth state changed: User logged in:", user.email);
    // You can manually store user info in AsyncStorage here if needed
  } else {
    console.log("Auth state changed: User logged out");
  }
});

const db = getFirestore(app);
export { auth, db };
export const storage = getStorage(app);
export const functions = getFunctions(app);
export default app;

// signup.tsx functions go here
export const signup = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        // Instead of returning the error, throw it so we can catch it properly
        throw error;
    }
};

// login.tsx functions go here
// Removed redundant login function to avoid confusion

// logout.tsx functions go here 
export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        return error;
    }
};

// Google login function
// Renamed from signInWithEmailAndPassword to loginWithEmail to avoid naming conflict
export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Save user info to AsyncStorage with displayName
    await AsyncStorage.setItem('user', JSON.stringify({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName, // Include the display name
    }));
    return user;
  } catch (error) {
    throw error;
  }
};

  // Function for Google Sign In
export const signInWithGoogle = async () => {
  try {
    if (Platform.OS === 'web') {
      // Web platform approach
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await AsyncStorage.setItem('user', JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
      }));
      return user;
    } else {
      // For Expo on mobile, use the current authentication approach
      await Google.initializeAsync({
        clientId: Platform.OS === 'ios'
          ? process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
          : process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      });
      
      const { type, user } = await Google.promptAsync({
        clientId: Platform.OS === 'ios'
          ? process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
          : process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        scopes: ['profile', 'email'],
        redirectUri: `${process.env.SCHEME}://`
      });
      
      if (type === 'success') {
        const { id_token } = user;
        const credential = GoogleAuthProvider.credential(id_token);
        const result = await signInWithCredential(auth, credential);
        const firebaseUser = result.user;
        
        // Save user data
        await AsyncStorage.setItem('user', JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        }));
        
        return firebaseUser;
      } else {
        throw new Error('Google Sign In was cancelled');
      }
    }
  } catch (error) {
    console.error('Error with Google Sign In:', error);
    throw error;
  }
};

// Function to sign out
export const signOutUser = async () => {
  try {
    await auth.signOut();
    await AsyncStorage.removeItem('user');
  } catch (error) {
    throw error;
  }
};

// Function to get current user
export const getCurrentUser = async () => {
    const userJson = await AsyncStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
};