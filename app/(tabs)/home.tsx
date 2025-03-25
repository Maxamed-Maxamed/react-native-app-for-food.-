import { StyleSheet, Text, View, ScrollView, Alert, SafeAreaView, Dimensions, Image, TextInput, TouchableOpacity } from 'react-native';
import React, { useEffect } from 'react';
import { auth } from '@/services/firebase';
import { router } from 'expo-router';
import CategoryCard from '@/components/home_layout/CategoryCard';
import { MaterialIcons } from '@expo/vector-icons';

// Get screen width for responsive layout
const { width } = Dimensions.get('window');

export default function HomeScreen() {
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.replace('/login');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleCategoryPress = (category: string) => {
    // For now, just show an alert. Later this could navigate to category screens
    Alert.alert(`${category} Selected`, `You tapped on the ${category} category`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header with Title and Avatar */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Home</Text>
          <TouchableOpacity 
            onPress={() => router.push('/(tabs)/profile')}
            style={styles.avatarButton}
          >
            <Image 
              source={require('@/assets/images/avatar.png')} 
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={24} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for fresh food..."
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.categoriesContainer}>
          <CategoryCard
            title="Fruits"
            description="Explore juicy apples available for delivery."
            image={require('@/assets/images/fruits.png')}
            onPress={() => handleCategoryPress('Fruits')}
          />
          
          <CategoryCard
            title="Vegetables"
            description="Discover fresh vegetables delivered to your door."
            image={require('@/assets/images/vegetables.png')}
            onPress={() => handleCategoryPress('Vegetables')}
          />
          
          <CategoryCard
            title="Dairy"
            description="Order fresh dairy products for your family."
            image={require('@/assets/images/dairy.png')}
            onPress={() => handleCategoryPress('Dairy')}
          />
          
          <CategoryCard
            title="Bakery"
            description="Enjoy freshly baked bread and pastries."
            image={require('@/assets/images/bakery.png')}
            onPress={() => handleCategoryPress('Bakery')}
          />
          
          <CategoryCard
            title="Seafood"
            description="Choose from a variety of fresh seafood options."
            image={require('@/assets/images/seafood.png')}
            onPress={() => handleCategoryPress('Seafood')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // Align items to the right
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    color: '#333',
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    left: 0,
  },
  avatarButton: {
    marginLeft: 16, // Add spacing between title and avatar
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    zIndex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 24,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#333',
  },
  categoriesContainer: {
    width: '100%',
  },
});