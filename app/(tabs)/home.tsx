import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { auth } from '@/services/firebase';

// Get screen dimensions for responsive layout
const { width } = Dimensions.get('window');

// Define type interfaces for our data
interface Category {
  id: string;
  name: string;
  icon: string;
}

interface Chef {
  id: string;
  name: string;
  image: any; // Using 'any' for image require statements
  rating: number;
  cuisine: string;
}

interface Special {
  id: string;
  name: string;
  chef: string;
  image: any; // Using 'any' for image require statements
  price: number;
}

// Category data
const categories: Category[] = [
  { id: '1', name: 'Italian Chefs', icon: '🇮🇹' },
  { id: '2', name: 'Pastry Chefs', icon: '🥐' },
  { id: '3', name: 'Vegan', icon: '🌱' },
  { id: '4', name: 'Asian', icon: '🍜' },
  { id: '5', name: 'Mediterranean', icon: '🫒' },
];

// Featured chefs data
const featuredChefs: Chef[] = [
  {
    id: '1',
    name: 'Jacob Jones',
    image: require('@/assets/images/chef1.png'),
    rating: 4.5,
    cuisine: 'Italian, Mediterranean',
  },
  {
    id: '2',
    name: 'Cameron Williamson',
    image: require('@/assets/images/chef2.png'),
    rating: 4.8,
    cuisine: 'Seasonal & Local, Vegan',
  },
  {
    id: '3',
    name: 'Jenny Wilson',
    image: require('@/assets/images/chef3.png'),
    rating: 4.7,
    cuisine: 'Pastry, Italian',
  },
  {
    id: '4',
    name: 'Robert Fox',
    image: require('@/assets/images/chef4.png'),
    rating: 4.9,
    cuisine: 'Asian, Vegan',
  },
  {
    id: '5',
    name: 'Sarah Chen',
    image: require('@/assets/images/chef1.png'),
    rating: 4.6,
    cuisine: 'Asian, Mediterranean',
  },
  {
    id: '6',
    name: 'Maria Garcia',
    image: require('@/assets/images/chef2.png'),
    rating: 4.8,
    cuisine: 'Mediterranean, Pastry',
  },
  {
    id: '7',
    name: 'Alex Kim',
    image: require('@/assets/images/chef3.png'),
    rating: 4.7,
    cuisine: 'Asian, Italian',
  },
  {
    id: '8',
    name: 'Emma Thompson',
    image: require('@/assets/images/chef4.png'),
    rating: 4.9,
    cuisine: 'Vegan, Pastry',
  },
];

// Daily specials data
const dailySpecials: Special[] = [
  {
    id: '1',
    name: 'Spaghetti Carbonara',
    chef: 'Jacob Jones',
    image: require('@/assets/images/dish1.png'),
    price: 19.99,
  },
  {
    id: '2',
    name: 'Seasonal Salad',
    chef: 'Cameron Williamson',
    image: require('@/assets/images/dish2.png'),
    price: 14.99,
  },
  {
    id: '3',
    name: 'Chocolate Soufflé',
    chef: 'Jenny Wilson',
    image: require('@/assets/images/dish3.png'),
    price: 12.99,
  },
];

// Star rating component with type annotation
const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating - fullStars >= 0.5;
  
  return (
    <View style={styles.ratingContainer}>
      {[...Array(5)].map((_, i) => (
        <MaterialIcons
          key={i}
          name={i < fullStars ? 'star' : (i === fullStars && halfStar ? 'star-half' : 'star-outline')}
          size={16}
          color="#FFB800"
        />
      ))}
      <Text style={styles.ratingText}> {rating}</Text>
    </View>
  );
};

export default function HomeScreen() {
  const [userName, setUserName] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredChefs, setFilteredChefs] = useState<Chef[]>(featuredChefs);
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.replace('/(auth)/login');
      } else {
        // Get user name from Firebase
        setUserName(user.displayName?.split(' ')[0] || 'User');
      }
    });

    return () => unsubscribe();
  }, []);

  // Filter chefs based on search query and selected category
  useEffect(() => {
    const filtered = featuredChefs.filter(chef => {
      const matchesSearch = searchQuery === '' ||
        chef.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chef.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = !selectedCategory ||
        chef.cuisine.toLowerCase().includes(selectedCategory.replace(' Chefs', '').toLowerCase());
      
      return matchesSearch && matchesCategory;
    });
    setFilteredChefs(filtered);
  }, [searchQuery, selectedCategory]);

  const handleChefPress = (chefId: string) => {
    // Navigate to chef profile page with the chef ID
    router.push(`/chef/${chefId}`);
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity 
      style={[styles.categoryItem, selectedCategory === item.name && styles.selectedCategory]}
      onPress={() => setSelectedCategory(selectedCategory === item.name ? '' : item.name)}
    >
      <Text style={styles.categoryIcon}>{item.icon}</Text>
      <Text style={[styles.categoryText, selectedCategory === item.name && styles.selectedCategoryText]}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderChefCard = ({ item }: { item: Chef }) => (
    <TouchableOpacity 
      style={styles.chefCard}
      onPress={() => handleChefPress(item.id)}
    >
      <Image source={item.image} style={styles.chefImage} />
      <View style={styles.chefInfo}>
        <Text style={styles.chefName}>{item.name}</Text>
        <StarRating rating={item.rating} />
        <Text style={styles.cuisineText}>{item.cuisine}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderSpecialItem = ({ item }: { item: Special }) => (
    <TouchableOpacity style={styles.specialCard}>
      <Image source={item.image} style={styles.specialImage} />
      <View style={styles.specialInfo}>
        <Text style={styles.specialName}>{item.name}</Text>
        <Text style={styles.specialChef}>by {item.chef}</Text>
        <Text style={styles.specialPrice}>${item.price.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with Greeting */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hi, {userName} <Text style={styles.waveEmoji}>👋</Text>
            </Text>
          </View>
          <TouchableOpacity style={styles.iconButton}>
            <View style={styles.iconBackground}>
              <MaterialIcons name="shopping-cart" size={24} color="#FF4B3E"
                          onPress={() => router.push('/orders')}

              />
              
            </View>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={24} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for chefs or cuisines"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Categories */}
        <FlatList
          horizontal
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesList}
          contentContainerStyle={styles.categoriesContent}
        />

        {/* Featured Chefs */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Featured Chefs</Text>
          {filteredChefs.length === 0 ? (
            <View style={styles.noResultsContainer}>
              <MaterialIcons name="search-off" size={48} color="#ccc" />
              <Text style={styles.noResultsText}>No chefs found matching your search</Text>
            </View>
          ) : (
            <View style={styles.chefsContainer}>
              {filteredChefs.map((chef) => (
              <TouchableOpacity 
                key={chef.id}
                style={styles.chefCard}
                onPress={() => handleChefPress(chef.id)}
              >
                <Image source={chef.image} style={styles.chefImage} />
                <View style={styles.chefInfo}>
                  <Text style={styles.chefName}>{chef.name}</Text>
                  <StarRating rating={chef.rating} />
                  <Text style={styles.cuisineText}>{chef.cuisine}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          )}
        </View>

        {/* Daily Specials */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Daily Specials</Text>
          <FlatList
            horizontal
            data={dailySpecials}
            renderItem={renderSpecialItem}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.specialsContent}
          />
        </View>

        {/* Add some padding at the bottom for better scrolling */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  noResultsText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 32,
    fontFamily: 'Poppins_600SemiBold',
    color: '#333',
  },
  waveEmoji: {
    fontSize: 28,
  },
  iconButton: {
    padding: 4,
  },
  iconBackground: {
    backgroundColor: 'white',
    borderRadius: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 12,
    marginBottom: 24,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  categoriesList: {
    marginBottom: 24,
  },
  categoriesContent: {
    paddingRight: 16,
    gap: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedCategory: {
    backgroundColor: '#FF4B3E',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  categoryText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#333',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'Poppins_600SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  chefsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  chefCard: {
    width: (width - 42) / 2,  // Account for margins and padding
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chefImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  chefInfo: {
    padding: 12,
  },
  chefName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#666',
  },
  cuisineText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#666',
  },
  specialsContent: {
    paddingRight: 16,
  },
  specialCard: {
    width: width * 0.8,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  specialImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  specialInfo: {
    padding: 12,
  },
  specialName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: '#333',
  },
  specialChef: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  specialPrice: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#FF4B3E',
  },
  bottomPadding: {
    height: 80,
  },
});