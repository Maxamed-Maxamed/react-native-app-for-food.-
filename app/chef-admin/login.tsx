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

export default function ChefLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Use the role 'chef' for chef login
      const success = await login(email, password, 'chef');
      
      if (!success) {
        Alert.alert('Login Failed', 'Invalid email or password for chef account');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occurred during login');
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
              onPress={() => router.push('/')}
            >
              <MaterialIcons name="arrow-back" size={wp('6%')} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.logoContainer}>
            <Image 
              source={require('@/assets/images/logo.png')} // Replace with your logo path
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.logoText}>Chef Portal</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Login</Text>
            <Text style={styles.subtitle}>Sign in to manage your menu and orders</Text>
            
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
            
            <TouchableOpacity 
              style={styles.forgotPassword}
              disabled={isLoading}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.loginButton, isLoading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>
            
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity disabled={isLoading} onPress={() => router.push('/chef-admin/signup')}>
                {/* Replace with your registration screen path */}
                <Text style={styles.registerLink}>Sign Up</Text>
                {/* Add onPress handler for registration if needed */}

              </TouchableOpacity>
            </View>

            {/* For demo purposes - easy login */}
            <View style={styles.demoContainer}>
              <Text style={styles.demoText}>Demo Chef: chef@example.com / chefpass</Text>
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
    backgroundColor: '#fff',
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
    marginTop: hp('5%'),
    marginBottom: hp('5%'),
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: hp('4%'),
  },
  forgotPasswordText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: wp('3.5%'),
    color: '#FF4B3E',
  },
  loginButton: {
    backgroundColor: '#FF4B3E',
    borderRadius: wp('3%'),
    paddingVertical: hp('1.8%'),
    alignItems: 'center',
    marginBottom: hp('3%'),
  },
  disabledButton: {
    backgroundColor: '#ffaca7',
  },
  loginButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: wp('4.5%'),
    color: '#fff',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: wp('3.5%'),
    color: '#666',
  },
  registerLink: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: wp('3.5%'),
    color: '#FF4B3E',
  },
  demoContainer: {
    marginTop: hp('5%'),
    padding: hp('2%'),
    backgroundColor: '#f9f9f9',
    borderRadius: wp('2%'),
    alignItems: 'center',
  },
  demoText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: wp('3%'),
    color: '#666',
  },
});