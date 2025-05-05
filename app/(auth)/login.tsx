import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { loginWithEmail, auth } from '@/services/firebase';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { useAuth } from '@/context/AuthContext'; // Add this import

// Complete any auth sessions when the app returns from the authentication flow
WebBrowser.maybeCompleteAuthSession();

const { width, height } = Dimensions.get('window');

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth(); // Get the login function from AuthContext
  
  // Set up Google Auth Request
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });
  
  // Handle Google Sign In response
  useEffect(() => {
    if (response?.type === 'success') {
      setLoading(true);
      // Fix the access to idToken
      // Extract ID token from the response
      const idToken = response?.authentication?.idToken || response?.params?.id_token;

      // Log the response for debugging purposes
      console.log("AuthSession response:", response);

      // Log the extracted ID token
      if (idToken) {
        console.log("Extracted ID token:", idToken);
      } else {
        console.warn("No ID token found in the response. Check the response structure.");
      }
      
      // Check if idToken exists before proceeding
      if (idToken) {
        const credential = GoogleAuthProvider.credential(idToken);
        signInWithCredential(auth, credential)
          .then((result) => {
            console.log("Google sign in successful");
            router.replace('/(tabs)/home');  // Update to include /home
          })
          .catch((error) => {
            console.error("Error signing in with Google:", error);
            Alert.alert('Google Sign In Failed', error.message);
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        console.error("No ID token found in authentication response");
        Alert.alert('Authentication Error', 'Failed to get authentication token from Google');
        setLoading(false);
      }
    }
  }, [response]);
  
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold
  });

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#FF4B3E" />;
  }

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    
    setLoading(true);
    try {
      console.log("Attempting login with email:", email);
      const success = await login(email, password, 'customer');
      console.log("Login success:", success);
      
      if (success) {
        console.log("Attempting navigation to /(tabs)/home");
        
        // Add a slight delay to ensure Firebase auth state is fully updated
        setTimeout(() => {
          try {
            router.replace('/(tabs)/home');
            console.log("Navigation command sent");
          } catch (navError) {
            console.error("Navigation error:", navError);
            // Fallback navigation attempt
            try {
              router.replace('/');
              console.log("Fallback navigation sent");
            } catch (fallbackError) {
              console.error("Fallback navigation error:", fallbackError);
            }
          }
        }, 500);
      } else {
        Alert.alert('Login Failed', 'Invalid email or password');
      }
    } catch (error: any) {
      console.error("Login error:", error);
      Alert.alert('Login Failed', error.message || 'An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await promptAsync();
    } catch (error) {
      console.error("Error starting Google auth:", error);
      Alert.alert('Google Sign In Error', 'Could not start the Google authentication process.');
    }
  };

  const goToSignUp = () => {
    router.push('/signup');
  };

 
  const goToForgotPassword = () => {
    router.push('/forgot-password');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
        >
          <StatusBar style="auto" />
          
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image 
              source={require('@/assets/images/logo.png')} 
              style={styles.logo} 
              resizeMode="contain"
            />
          </View>

          {/* Welcome Back Text */}
          <Text style={styles.heading}>Welcome Back</Text>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#999999"
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              placeholderTextColor="#999999"
            />
            <TouchableOpacity 
              style={styles.showButton} 
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.showButtonText}>
                {showPassword ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={handleLogin }
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Forgot Password */}
          <TouchableOpacity 
            onPress={goToForgotPassword} 
            style={styles.forgotPasswordContainer}
          >
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* OR Divider */}
          <View style={styles.orContainer}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.orLine} />
          </View>

          {/* Google Sign In */}
          <TouchableOpacity 
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            <Image 
              source={require('@/assets/images/google-icon.png')} 
              style={styles.googleIcon} 
              resizeMode="contain"
            />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Sign Up */}
          <View style={styles.signUpContainer}>
            <Text style={styles.noAccountText}>Don't have an account?</Text>
            <TouchableOpacity onPress={goToSignUp}>
              <Text style={styles.signUpText}>Sign up</Text>
            </TouchableOpacity>
          </View>
          
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: height * 0.05,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: height * 0.0, // Increased margin below the logo
    marginTop: height * 0.08,    // Added top margin for better vertical positioning
  },
  logo: {
    width: width * 0.35,         // Increased from 0.3 to 0.35 of screen width
    height: width * 0.35,        // Keep height equal to width for proper aspect ratio
    maxWidth: 160,               // Increased from 150 to 160
    maxHeight: 160,              // Keep equal to maxWidth
    borderRadius: 25,            // Increased corner radius to match Figma
    resizeMode: 'contain',       // Ensures the logo displays properly
  },
  heading: {
    fontSize: 32,
    fontFamily: 'Poppins_600SemiBold',
    color: '#333333',
    marginBottom: height * 0.04,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    height: 56,
    paddingHorizontal: 15,
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#333333',
  },
  showButton: {
    paddingHorizontal: 15,
    height: 56,
    justifyContent: 'center',
  },
  showButtonText: {
    color: '#333333',
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#FF4B3E',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
  },
  forgotPasswordContainer: {
    width: '100%',
    alignItems: 'flex-end',
    marginTop: 10,
  },
  forgotPasswordText: {
    color: '#FF4B3E',
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: height * 0.025,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  orText: {
    paddingHorizontal: 15,
    color: '#666666',
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
  },
  googleButton: {
    flexDirection: 'row',
    width: '100%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginBottom: height * 0.03,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  googleButtonText: {
    color: '#333333',
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: height * 0.01,
  },
  noAccountText: {
    color: '#333333',
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    marginRight: 5,
  },
  signUpText: {
    color: '#FF4B3E',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
  },
});