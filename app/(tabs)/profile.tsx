import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { auth, signOutUser } from '@/services/firebase';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';

export default function ProfileScreen() {
  const [user, setUser] = useState(auth.currentUser);
  const [loading, setLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        router.replace('/(auth)/login');
      } else {
        if (__DEV__) {
          console.log("User display name:", currentUser.displayName);
          // If you need to handle special cases where displayName might be null
          if (!currentUser.displayName) {
            console.log("No display name available for user:", currentUser.email);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOutUser();
      router.replace('/(auth)/login');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to logout');
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded || loading) {
    return <ActivityIndicator size="large" color="#FF4B3E" style={styles.loader} />;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <Image 
          source={require('@/assets/images/avatar.png')} 
          style={styles.profileImage}
        />
        <Text style={styles.name}>{user?.displayName || 'User'}</Text>
        <Text style={styles.email}>{user?.email || 'No email available'}</Text>
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Edit Profile', 'This feature will be available soon!')}>
          <MaterialIcons name="person" size={24} color="#333" />
          <Text style={styles.menuText}>Edit Profile</Text>
          <MaterialIcons name="keyboard-arrow-right" size={24} color="#999" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Payment Methods', 'This feature will be available soon!')}>
          <MaterialIcons name="payment" size={24} color="#333" />
          <Text style={styles.menuText}>Payment Methods</Text>
          <MaterialIcons name="keyboard-arrow-right" size={24} color="#999" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Addresses', 'This feature will be available soon!')}>
          <MaterialIcons name="location-on" size={24} color="#333" />
          <Text style={styles.menuText}>Delivery Addresses</Text>
          <MaterialIcons name="keyboard-arrow-right" size={24} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Notifications', 'This feature will be available soon!')}>
          <MaterialIcons name="notifications" size={24} color="#333" />
          <Text style={styles.menuText}>Notifications</Text>
          <MaterialIcons name="keyboard-arrow-right" size={24} color="#999" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('App Settings', 'This feature will be available soon!')}>
          <MaterialIcons name="settings" size={24} color="#333" />
          <Text style={styles.menuText}>App Settings</Text>
          <MaterialIcons name="keyboard-arrow-right" size={24} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Help & Support Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Help & Support</Text>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Help Center', 'This feature will be available soon!')}>
          <MaterialIcons name="help-outline" size={24} color="#333" />
          <Text style={styles.menuText}>Help Center</Text>
          <MaterialIcons name="keyboard-arrow-right" size={24} color="#999" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('About', 'This feature will be available soon!')}>
          <MaterialIcons name="info-outline" size={24} color="#333" />
          <Text style={styles.menuText}>About</Text>
          <MaterialIcons name="keyboard-arrow-right" size={24} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialIcons name="logout" size={24} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* Version */}
      <Text style={styles.version}>App Version 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  name: {
    fontSize: 22,
    fontFamily: 'Poppins_600SemiBold',
    color: '#333',
  },
  email: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#666',
    marginTop: 5,
  },
  section: {
    backgroundColor: '#fff',
    marginVertical: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#333',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#333',
    marginLeft: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF4B3E',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    paddingVertical: 15,
    borderRadius: 10,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    marginLeft: 10,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#999',
    marginVertical: 20,
  }
});