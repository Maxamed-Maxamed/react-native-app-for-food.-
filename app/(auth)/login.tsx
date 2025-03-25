import { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { Link, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { login } from '@/services/firebase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Only showing the part that needs to be changed
  const handleLogin = async () => {
      if (!email || !password) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }
  
      try {
        const user = await login(email, password);
        if (user) {
          router.replace('/(tabs)/home');
        }
      } catch (error: any) {
        Alert.alert('Error', error.message);
      }
    };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={require('@/assets/images/logo.png')} style={styles.logo}  />

      {/* Title */}
      <Text style={styles.title}>Welcome Back!</Text>
      <Text style={styles.subtitle}>Log in to continue ordering fresh food.</Text>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <MaterialIcons name="email" size={20} color="#666" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <MaterialIcons name="lock" size={20} color="#666" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      {/* Log In Button - update the onPress handler */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>

      {/* Sign Up Link */}
      <View style={styles.signUpContainer}>
        <Text style={styles.signUpText}>Don't have an account? </Text>
        <Link href="/signup" asChild>
          <TouchableOpacity>
            <Text style={styles.signUpLink}>Sign Up</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  logo: {
    width: 300,
    height: 300,
    marginBottom: -70,
    resizeMode: 'contain', // Ensures it fits nicely
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    marginTop: 40,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#666',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontFamily: 'Poppins_400Regular',
  },
  button: {
    backgroundColor: '#000080',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signUpText: {
    color: '#666',
    fontFamily: 'Poppins_400Regular',
  },
  signUpLink: {
    color: '#800080',
    fontFamily: 'Poppins_600SemiBold',
  },
});