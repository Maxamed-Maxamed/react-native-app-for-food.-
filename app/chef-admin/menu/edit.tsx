import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import ScreenHeader from '../components/ScreenHeader';
import ImagePicker from './components/ImagePicker';
import {
  MenuItem,
  MENU_CATEGORIES,
  DIETARY_OPTIONS,
  validateMenuItem,
} from '@/utils/menuHelpers';
import { getDoc, doc } from 'firebase/firestore';
import { db as firestore } from '@/services/firebase';
import { addMenuItem, updateMenuItem } from '@/services/menuService';
import { useAuth } from '@/context/AuthContext';

export default function EditMenuItemScreen() {
  const { id } = useLocalSearchParams();
  const isEditing = !!id && typeof id === 'string';
  const { user } = useAuth();

  // State for form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState<any>(null);
  const [category, setCategory] = useState('');
  const [dietary, setDietary] = useState<string[]>([]);
  const [available, setAvailable] = useState(true);
  
  // Loading states
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  // Fetch existing item if editing
  useEffect(() => {
    if (isEditing && typeof id === 'string') {
      fetchMenuItem(id);
    }
  }, [id]);

  const fetchMenuItem = async (itemId: string) => {
    try {
      setLoading(true);
      const docRef = doc(firestore, 'menuItems', itemId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as MenuItem;
        setName(data.name);
        setDescription(data.description);
        setPrice(data.price.toString());
        setImage(data.image);
        setCategory(data.category);
        setDietary(data.dietary || []);
        setAvailable(data.available);
      } else {
        Alert.alert('Error', 'Menu item not found');
        router.back();
      }
    } catch (error) {
      console.error('Error fetching menu item:', error);
      Alert.alert('Error', 'Failed to load menu item details');
    } finally {
      setLoading(false);
    }
  };

  // Handle save action
  const handleSave = async () => {
    if (!user || !user.id) {
      Alert.alert('Error', 'You must be logged in to save menu items');
      return;
    }

    // Parse price as a number
    const priceNumber = parseFloat(price);

    // Create the menu item object
    const menuItem: Partial<MenuItem> = {
      name,
      description,
      price: priceNumber,
      image,
      category,
      dietary: dietary.length > 0 ? dietary : undefined,
      available,
    };

    // Validate the menu item
    const { valid, errors } = validateMenuItem(menuItem);

    if (!valid) {
      // Show validation errors
      Alert.alert('Validation Error', errors.join('\n'));
      return;
    }

    try {
      setSaving(true);

      if (isEditing && typeof id === 'string') {
        // Update existing item
        await updateMenuItem(id, menuItem);
      } else {
        // Create new item
        await addMenuItem(menuItem as Omit<MenuItem, 'id'>, user.id);
      }

      Alert.alert(
        'Success',
        isEditing ? 'Menu item updated successfully' : 'New menu item created',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error saving menu item:', error);
      Alert.alert('Error', 'Failed to save menu item. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Toggle a dietary restriction
  const toggleDietary = (dietaryId: string) => {
    if (dietary.includes(dietaryId)) {
      setDietary(dietary.filter((id) => id !== dietaryId));
    } else {
      setDietary([...dietary, dietaryId]);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <ScreenHeader
          title={isEditing ? 'Edit Menu Item' : 'Add New Item'}
          showBackButton={true}
          onBackPress={() => router.back()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF4B3E" />
          <Text style={styles.loadingText}>Loading menu item details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <ScreenHeader
        title={isEditing ? 'Edit Menu Item' : 'Add New Item'}
        showBackButton={true}
        onBackPress={() => router.back()}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.imageSection}>
            <Text style={styles.sectionTitle}>Item Image</Text>
            <ImagePicker
              image={image}
              onImageSelected={(selectedImage) => setImage(selectedImage)}
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter item name"
                placeholderTextColor="#999"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter item description"
                placeholderTextColor="#999"
                multiline={true}
                numberOfLines={4}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Price ($)</Text>
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                placeholder="0.00"
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryContainer}>
                {MENU_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryButton,
                      category === cat.id && styles.selectedCategoryButton,
                    ]}
                    onPress={() => setCategory(cat.id)}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        category === cat.id && styles.selectedCategoryButtonText,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Dietary Options</Text>
              <View style={styles.dietaryContainer}>
                {DIETARY_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.dietaryButton,
                      dietary.includes(option.id) && styles.selectedDietaryButton,
                    ]}
                    onPress={() => toggleDietary(option.id)}
                  >
                    <Text
                      style={[
                        styles.dietaryButtonText,
                        dietary.includes(option.id) && styles.selectedDietaryButtonText,
                      ]}
                    >
                      {option.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.availabilityContainer}>
              <Text style={styles.label}>Availability</Text>
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>
                  {available ? 'Available' : 'Unavailable'}
                </Text>
                <Switch
                  trackColor={{ false: '#E0E0E0', true: '#FFD7D5' }}
                  thumbColor={available ? '#FF4B3E' : '#9E9E9E'}
                  onValueChange={setAvailable}
                  value={available}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => router.back()}
          disabled={saving}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.disabledButton]} 
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Styles unchanged
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingTop: hp('5%'),
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: wp('5%'),
    paddingBottom: hp('10%'),
  },
  imageSection: {
    marginBottom: hp('3%'),
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
  label: {
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
  textArea: {
    height: hp('15%'),
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('1%'),
    borderRadius: wp('2%'),
    marginRight: wp('2%'),
    marginBottom: hp('1%'),
  },
  selectedCategoryButton: {
    backgroundColor: '#FF4B3E',
  },
  categoryButtonText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: wp('3.5%'),
    color: '#666',
  },
  selectedCategoryButtonText: {
    color: '#fff',
  },
  dietaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dietaryButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('1%'),
    borderRadius: wp('2%'),
    marginRight: wp('2%'),
    marginBottom: hp('1%'),
  },
  selectedDietaryButton: {
    backgroundColor: '#4CAF50',
  },
  dietaryButtonText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: wp('3.5%'),
    color: '#666',
  },
  selectedDietaryButtonText: {
    color: '#fff',
  },
  availabilityContainer: {
    marginBottom: hp('2.5%'),
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: wp('2%'),
  },
  switchLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: wp('3.5%'),
    color: '#333',
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
  saveButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: wp('4%'),
    color: '#fff',
  },
  disabledButton: {
    backgroundColor: '#FFB5B0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: wp('4%'),
    color: '#666',
    marginTop: hp('2%'),
  }
});