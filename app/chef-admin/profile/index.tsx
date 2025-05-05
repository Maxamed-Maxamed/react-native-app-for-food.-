import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
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
import ScreenHeader from '../components/ScreenHeader';
import { ChefProfile, fetchChefProfile } from '@/services/profileService';

// Define type for the profile
interface Profile {
  id: string;
  name: string;
  email: string;
  bio: string;
  cuisine: string;
  phone: string;
  address: string;
  photoURL: string | null;
}

// Mock chef profile data - in a real app you'd fetch this from Firebase
const mockChefProfile: Profile = {
  id: 'chef_1',
  name: 'Jacob Jones',
  email: 'chef@example.com',
  bio: 'Experienced chef specializing in Italian cuisine with over 10 years of experience in fine dining restaurants.',
  cuisine: 'Italian, Mediterranean',
  phone: '(212) 555-1234',
  address: '123 Main Street, New York, NY 10001',
  photoURL: null,
};

export default function ChefProfileScreen() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<Profile>(mockChefProfile);
  const [isLoading, setIsLoading] = useState(false);

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        setIsLoading(true);
        try {
          // Try to load profile from service
          const profileData = await fetchChefProfile(user.id);
          if (profileData) {
            setProfile({
              id: profileData.id,
              name: profileData.name,
              email: profileData.email,
              bio: profileData.bio || '',
              cuisine: profileData.cuisine || '',
              phone: profileData.phone || '',
              address: profileData.address || '',
              photoURL: profileData.photoURL || null, // Convert undefined to null
            });
          } else {
            // If no profile found, use user data from auth
            setProfile({
              ...mockChefProfile,
              id: user.id,
              name: user.name || mockChefProfile.name,
              email: user.email || mockChefProfile.email,
              photoURL: user.photoURL || null,
            });
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
          // Fallback to user data
          setProfile({
            ...mockChefProfile,
            id: user.id,
            name: user.name || mockChefProfile.name,
            email: user.email || mockChefProfile.email,
            photoURL: user.photoURL || null,
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadProfile();
  }, [user]);

  const handleLogout = () => {
    logout();
    router.replace('/chef-admin/auth/login');
  };

  const handleEditProfile = () => {
    router.push('/chef-admin/profile/edit');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <ScreenHeader
        title="Profile"
        showBackButton={true}
        onBackPress={() => router.push('/chef-admin/dashboard/dashboard')}
        
      />
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <ActivityIndicator size="large" color="#FF4B3E" style={styles.loader} />
        ) : (
          <>
            {/* Profile Header */}
            <View style={styles.profileHeader}>
              <View style={styles.profileImageContainer}>
                {profile.photoURL ? (
                  <Image source={{ uri: profile.photoURL }} style={styles.profileImage} />
                ) : (
                  <View style={[styles.profileImage, styles.profileImagePlaceholder]}>
                    <MaterialIcons name="person" size={wp('15%')} color="#ccc" />
                  </View>
                )}
              </View>
              
              <Text style={styles.profileName}>{profile.name}</Text>
              <Text style={styles.profileEmail}>{profile.email}</Text>
              
              <TouchableOpacity 
                style={styles.editButton} 
                onPress={handleEditProfile}
              >
                <MaterialIcons name="edit" size={wp('4.5%')} color="#fff" />
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
            
            {/* Profile Info */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Professional Info</Text>
              
              <View style={styles.infoItem}>
                <MaterialIcons name="restaurant" size={wp('5.5%')} color="#FF4B3E" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Cuisine Specialties</Text>
                  <Text style={styles.infoValue}>{profile.cuisine || 'Not specified'}</Text>
                </View>
              </View>
              
              <View style={styles.infoItem}>
                <MaterialIcons name="description" size={wp('5.5%')} color="#FF4B3E" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Bio</Text>
                  <Text style={styles.infoValue}>{profile.bio || 'No bio added'}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Contact Information</Text>
              
              <View style={styles.infoItem}>
                <MaterialIcons name="phone" size={wp('5.5%')} color="#FF4B3E" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Phone Number</Text>
                  <Text style={styles.infoValue}>{profile.phone || 'Not provided'}</Text>
                </View>
              </View>
              
              <View style={styles.infoItem}>
                <MaterialIcons name="location-on" size={wp('5.5%')} color="#FF4B3E" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Address</Text>
                  <Text style={styles.infoValue}>{profile.address || 'Not provided'}</Text>
                </View>
              </View>
            </View>
            
            {/* Logout Button */}
            {/* <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <MaterialIcons name="logout" size={wp('5.5%')} color="#fff" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity> */}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingTop: hp('5%'),
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp('5%'),
    paddingBottom: hp('5%'),
  },
  loader: {
    marginTop: hp('10%'),
  },
  profileHeader: {
    alignItems: 'center',
    marginVertical: hp('3%'),
  },
  profileImageContainer: {
    marginBottom: hp('2%'),
  },
  profileImage: {
    width: wp('30%'),
    height: wp('30%'),
    borderRadius: wp('15%'),
  },
  profileImagePlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: wp('6%'),
    color: '#333',
    marginBottom: hp('0.5%'),
  },
  profileEmail: {
    fontFamily: 'Poppins_400Regular',
    fontSize: wp('3.5%'),
    color: '#666',
    marginBottom: hp('2%'),
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4B3E',
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('4%'),
    borderRadius: wp('5%'),
  },
  editButtonText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: wp('3.5%'),
    color: '#fff',
    marginLeft: wp('1%'),
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: wp('4%'),
    padding: wp('5%'),
    marginBottom: hp('2%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: wp('4.5%'),
    color: '#333',
    marginBottom: hp('2%'),
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: hp('2%'),
  },
  infoContent: {
    marginLeft: wp('3%'),
    flex: 1,
  },
  infoLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: wp('3.5%'),
    color: '#333',
    marginBottom: hp('0.5%'),
  },
  infoValue: {
    fontFamily: 'Poppins_400Regular',
    fontSize: wp('3.5%'),
    color: '#666',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF4B3E',
    padding: hp('2%'),
    borderRadius: wp('3%'),
    marginTop: hp('2%'),
  },
  logoutButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: wp('4%'),
    color: '#fff',
    marginLeft: wp('2%'),
  },
});