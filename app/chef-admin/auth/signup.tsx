import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useAuth } from '@/context/AuthContext';

export default function ChefSignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { signup } = useAuth();
  
  const handleSignup = async () => {
    // Form validation
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'All fields are required');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    
    // Password strength validation (basic)
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Register as 'chef' role
      const success = await signup(email, password, name, 'chef');
      
      if (success) {
        Alert.alert(
          'Account Created',
          'Your chef account has been created successfully',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/chef-admin/auth/login'),
            }
          ]
        );
      } else {
        Alert.alert('Registration Failed', 'Could not create account. Email may be in use already.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerContainer}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <MaterialIcons name="arrow-back" size={wp('6%')} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.logoContainer}>
            <Image 
              source={require('@/assets/images/chef-hat.jpeg')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.logoText}>Chef Portal</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Sign Up</Text>
            <Text style={styles.subtitle}>Create a chef account to manage your menu</Text>
            
            <View style={styles.inputContainer}>
              <MaterialIcons name="person" size={wp('5%')} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                editable={!isLoading}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <MaterialIcons name="email" size={wp('5%')} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <MaterialIcons name="lock" size={wp('5%')} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!isLoading}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                disabled={isLoading}
              >
                <MaterialIcons 
                  name={showPassword ? "visibility" : "visibility-off"} 
                  size={wp('5%')} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputContainer}>
              <MaterialIcons name="lock" size={wp('5%')} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                editable={!isLoading}
              />
              <TouchableOpacity 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
                disabled={isLoading}
              >
                <MaterialIcons 
                  name={showConfirmPassword ? "visibility" : "visibility-off"} 
                  size={wp('5%')} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={[styles.signupButton, isLoading && styles.disabledButton]}
              onPress={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.signupButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>
            
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity 
                onPress={() => router.push('/chef-admin/auth/login')}
                disabled={isLoading}
              >
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: hp('5%'),
  },
  headerContainer: {
    paddingHorizontal: wp('4%'),
    paddingTop: hp('2%'),
  },
  backButton: {
    padding: wp('2%'),
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: hp('3%'),
    marginBottom: hp('3%'),
  },
  logo: {
    width: wp('20%'),
    height: wp('20%'),
    marginBottom: hp('2%'),
  },
  logoText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: wp('6%'),
    color: '#FF4B3E',
  },
  formContainer: {
    paddingHorizontal: wp('8%'),
  },
  title: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: wp('8%'),
    color: '#333',
    marginBottom: hp('1%'),
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: wp('4%'),
    color: '#666',
    marginBottom: hp('4%'),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: wp('3%'),
    marginBottom: hp('2.5%'),
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('4%'),
  },
  inputIcon: {
    marginRight: wp('2%'),
  },
  input: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: wp('4%'),
    paddingVertical: hp('1%'),
  },
  eyeIcon: {
    padding: wp('2%'),
  },
  signupButton: {
    backgroundColor: '#FF4B3E',
    borderRadius: wp('3%'),
    paddingVertical: hp('1.8%'),
    alignItems: 'center',
    marginBottom: hp('3%'),
    marginTop: hp('2%'),
  },
  disabledButton: {
    backgroundColor: '#FFB5B0',
  },
  signupButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: wp('4.5%'),
    color: '#fff',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: wp('3.5%'),
    color: '#666',
  },
  loginLink: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: wp('3.5%'),
    color: '#FF4B3E',
  },
});