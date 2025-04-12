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
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

// Initialize auth with AsyncStorage persistence
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Initialize auth state listener
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User detected:", user.email);
        // You can manually store user info in AsyncStorage here if needed
    }
});

const db = getFirestore(app);
const asyncStorage = ReactNativeAsyncStorage;

export { auth, db };
export const storage = getStorage(app);
export const functions = getFunctions(app);
export default app;
export { asyncStorage };

// signup.tsx functions go here
export const signup = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        return error;
    }
};

// login.tsx functions go here
export const login = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        return error;
    }
};

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
      // Save user info to AsyncStorage if needed
      await AsyncStorage.setItem('user', JSON.stringify({
        uid: user.uid,
        email: user.email,
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
        // For native platforms, use Expo AuthSession
        const clientId = process.env.GOOGLE_WEB_CLIENT_ID;
        
        const [, response, promptAsync] = Google.useAuthRequest({
          clientId,
          iosClientId: process.env.GOOGLE_IOS_CLIENT_ID,
          androidClientId: process.env.GOOGLE_ANDROID_CLIENT_ID,
        });
        if (response?.type === 'success') {
            const { id_token } = response.params;
            const credential = GoogleAuthProvider.credential(id_token);
            const result = await signInWithCredential(auth, credential);
            const user = result.user;
            await AsyncStorage.setItem('user', JSON.stringify({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
            }));
            return user;
          }
          
          return await promptAsync();
        }
      } catch (error) {
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