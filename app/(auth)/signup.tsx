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
  Dimensions,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { signup } from '@/services/firebase';
import { StatusBar } from 'expo-status-bar';
import { updateProfile, User } from 'firebase/auth';
import { auth } from '@/services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold
  });

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#FF4B3E" />;
  }

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      alert('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      // Add type assertion to help TypeScript understand what we're working with
      const user = await signup(email, password) as User;
      
      // Update the user's display name
      await updateProfile(user, {
        displayName: name
      });

      // Store user data in AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: name,
      }));

      router.replace('/(tabs)/home'); // Send them directly to home instead of login
    } catch (error: any) {
      alert(error.message || 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    // Implement Google sign up logic here
    alert('Google sign up to be implemented');
  };

  const goToLogin = () => {
    router.push('/(auth)/login');
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
            />
          </View>

          <Text style={styles.heading}>Create an account</Text>

          {/* Name Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#999999"
            />
          </View>

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

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              placeholderTextColor="#999999"
            />
            <TouchableOpacity 
              style={styles.showButton} 
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Text style={styles.showButtonText}>
                {showConfirmPassword ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity 
            style={styles.signUpButton} 
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.signUpButtonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          {/* OR Divider */}
          <View style={styles.orContainer}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.orLine} />
          </View>

          {/* Google Sign Up */}
          <TouchableOpacity 
            style={styles.googleButton}
            onPress={handleGoogleSignUp}
            disabled={loading}
          >
            <Image 
              source={require('@/assets/images/google-icon.png')} 
              style={styles.googleIcon} 
              resizeMode="contain"
            />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.alreadyAccountText}>Already have an account?</Text>
            <TouchableOpacity onPress={goToLogin}>
              <Text style={styles.loginText}>Log in</Text>
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
    marginBottom: height * 0.02,
    marginTop: height * 0.04,
  },
  logo: {
    width: width * 0.35,
    height: width * 0.35,
    maxWidth: 150,
    maxHeight: 150,
    borderRadius: 20,
  },
  heading: {
    fontSize: 28,
    fontFamily: 'Poppins_600SemiBold',
    color: '#333333',
    marginBottom: height * 0.03,
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
  signUpButton: {
    width: '100%',
    backgroundColor: '#FF4B3E',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  signUpButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: height * 0.01,
  },
  alreadyAccountText: {
    color: '#333333',
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    marginRight: 5,
  },
  loginText: {
    color: '#FF4B3E',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
  },
});