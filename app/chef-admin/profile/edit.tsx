import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/context/AuthContext';
import ScreenHeader from '../components/ScreenHeader';
import { ChefProfile, fetchChefProfile, updateChefProfile, uploadProfilePhoto } from '@/services/profileService';

const CUISINE_TYPES = [
  'Italian',
  'French',
  'Mediterranean',
  'Asian',
  'Japanese',
  'Chinese',
  'Mexican',
  'Indian',
  'Thai',
  'American',
  'Fusion',
  'Vegetarian',
  'Vegan',
  'Seafood',
  'Pastry',
  'Desserts',
  'BBQ',
  'Middle Eastern',
  'Greek',
  'Spanish'
];

export default function EditProfileScreen() {
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [profile, setProfile] = useState<ChefProfile | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [photoURL, setPhotoURL] = useState<string | null>(null);

  // Fetch profile data when component loads
  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const profileData = await fetchChefProfile(user.id);
          if (profileData) {
            setProfile(profileData);
            setName(profileData.name || '');
            setBio(profileData.bio || '');
            setCuisine(profileData.cuisine || '');
            setPhone(profileData.phone || '');
            setAddress(profileData.address || '');
            setPhotoURL(profileData.photoURL || null); // Fix: Convert undefined to null
          }
        } catch (error) {
          console.error('Error loading profile:', error);
          Alert.alert('Error', 'Failed to load profile data');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadProfile();
  }, [user]);

  // Request permissions for accessing the image library
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera roll permissions to upload photos!'
      );
      return false;
    }
    return true;
  };

  // Take photo with camera
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Sorry, we need camera permissions to take photos!');
      return;
    }

    setPhotoUploading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoURL(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    } finally {
      setPhotoUploading(false);
    }
  };

  // Pick an image from the gallery
  const selectImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setPhotoUploading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoURL(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    } finally {
      setPhotoUploading(false);
    }
  };

  // Show photo options dialog
  const handleChangePhoto = () => {
    Alert.alert(
      'Change Profile Photo',
      'Choose a photo source',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Photo Library', onPress: selectImage },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  // Save profile changes
  const handleSave = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to update your profile');
      return;
    }

    // Basic validation
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    setIsSaving(true);
    try {
      // If photo was changed and it's a local URI, upload it
      let finalPhotoURL = photoURL;
      if (photoURL && photoURL !== profile?.photoURL && photoURL.startsWith('file://')) {
        finalPhotoURL = await uploadProfilePhoto(user.id, photoURL);
      }

      // Update profile in the database
      await updateChefProfile(user.id, {
        name,
        bio,
        cuisine,
        phone,
        address,
        photoURL: finalPhotoURL,
      });

      // Update local context if needed
      if (updateProfile) {
        await updateProfile({
          name,
          photoURL: finalPhotoURL,
        });
      }

      Alert.alert(
        'Success',
        'Profile updated successfully',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <ScreenHeader
        title="Edit Profile"
        showBackButton={true}
        onBackPress={() => router.back()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <ActivityIndicator size="large" color="#FF4B3E" style={styles.loader} />
          ) : (
            <>
              {/* Profile Photo */}
              <View style={styles.photoSection}>
                <View style={styles.photoContainer}>
                  {photoUploading ? (
                    <View style={[styles.profileImage, styles.photoPlaceholder]}>
                      <ActivityIndicator size="large" color="#FF4B3E" />
                    </View>
                  ) : photoURL ? (
                    <Image source={{ uri: photoURL }} style={styles.profileImage} />
                  ) : (
                    <View style={[styles.profileImage, styles.photoPlaceholder]}>
                      <MaterialIcons name="person" size={wp('15%')} color="#ccc" />
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.changePhotoButton}
                    onPress={handleChangePhoto}
                    disabled={photoUploading}
                  >
                    <MaterialIcons name="camera-alt" size={wp('6%')} color="#fff" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.changePhotoText}>Tap to change profile photo</Text>
              </View>

              {/* Basic Information */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Basic Information</Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Name</Text>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Your full name"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    style={[styles.input, styles.disabledInput]}
                    value={user?.email || ''}
                    editable={false}
                  />
                  <Text style={styles.helperText}>Email cannot be changed</Text>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Cuisine Specialties</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.cuisineScrollView}
                    contentContainerStyle={styles.cuisineContainer}
                  >
                    {CUISINE_TYPES.map(cuisineType => (
                      <TouchableOpacity
                        key={cuisineType}
                        style={[
                          styles.cuisineButton,
                          cuisine.includes(cuisineType) && styles.selectedCuisine
                        ]}
                        onPress={() => {
                          if (cuisine.includes(cuisineType)) {
                            // Remove cuisine if already selected
                            setCuisine(cuisine.split(', ').filter(c => c !== cuisineType).join(', '));
                          } else {
                            // Add cuisine if not already selected
                            const newCuisine = cuisine ? `${cuisine}, ${cuisineType}` : cuisineType;
                            setCuisine(newCuisine);
                          }
                        }}
                      >
                        <Text style={[
                          styles.cuisineButtonText,
                          cuisine.includes(cuisineType) && styles.selectedCuisineText
                        ]}>
                          {cuisineType}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Bio</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={bio}
                    onChangeText={setBio}
                    placeholder="Tell customers about yourself and your culinary experience"
                    multiline={true}
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              </View>

              {/* Contact Information */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Contact Information</Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Your phone number"
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Address</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={address}
                    onChangeText={setAddress}
                    placeholder="Your business address"
                    multiline={true}
                    numberOfLines={2}
                  />
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={isSaving}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.disabledButton]}
          onPress={handleSave}
          disabled={isSaving || isLoading}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingTop: hp('5%'),
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: wp('5%'),
    paddingBottom: hp('10%'),
  },
  loader: {
    marginTop: hp('10%'),
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: hp('3%'),
  },
  photoContainer: {
    position: 'relative',
    marginBottom: hp('1%'),
  },
  profileImage: {
    width: wp('30%'),
    height: wp('30%'),
    borderRadius: wp('15%'),
  },
  photoPlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF4B3E',
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  changePhotoText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: wp('3.5%'),
    color: '#666',
  },
  formSection: {
    marginBottom: hp('3%'),
  },
  sectionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: wp('4.5%'),
    color: '#333',
    marginBottom: hp('2%'),
  },
  inputContainer: {
    marginBottom: hp('2.5%'),
  },
  inputLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: wp('3.5%'),
    color: '#333',
    marginBottom: hp('1%'),
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: wp('2%'),
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    fontFamily: 'Poppins_400Regular',
    fontSize: wp('3.5%'),
    color: '#333',
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
    color: '#999',
  },
  helperText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: wp('3%'),
    color: '#999',
    marginTop: hp('0.5%'),
    marginLeft: wp('1%'),
  },
  textArea: {
    height: hp('10%'),
    textAlignVertical: 'top',
  },
  cuisineScrollView: {
    marginBottom: hp('1%'),
  },
  cuisineContainer: {
    paddingVertical: hp('1%'),
  },
  cuisineButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('1%'),
    borderRadius: wp('2%'),
    marginRight: wp('2%'),
    marginBottom: hp('1%'),
  },
  selectedCuisine: {
    backgroundColor: '#FF4B3E',
  },
  cuisineButtonText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: wp('3.5%'),
    color: '#666',
  },
  selectedCuisineText: {
    color: '#fff',
  },
  footer: {
    flexDirection: 'row',
    padding: wp('5%'),
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: hp('1.5%'),
    backgroundColor: '#f0f0f0',
    borderRadius: wp('3%'),
    marginRight: wp('2%'),
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: wp('4%'),
    color: '#666',
  },
  saveButton: {
    flex: 2,
    paddingVertical: hp('1.5%'),
    backgroundColor: '#FF4B3E',
    borderRadius: wp('3%'),
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#FFB5B0',
  },
  saveButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: wp('4%'),
    color: '#fff',
  },
});