import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

// Types for menu items
interface MenuItem {
  id: string;
  name: string;
  description: string;
  image: any;
  price: number;
  dietary?: string[];
}

// Types for chef data
interface ChefDetails {
  id: string;
  name: string;
  image: any;
  rating: number;
  cuisine: string;
  bio: string;
  menuItems: MenuItem[];
}

// Mock data - you'll replace this with Firebase data later
const chefData: Record<string, ChefDetails> = {
  '1': {
    id: '1',
    name: 'Jacob Jones',
    image: require('@/assets/images/chef1.png'),
    rating: 4.5,
    cuisine: 'Italian Food',
    bio: 'Jacob specializes in authentic Italian cuisine with a modern twist. His dishes feature fresh, locally-sourced ingredients.',
    menuItems: [
      {
        id: 'm1',
        name: 'Margherita',
        description: 'Classic tomato and mozzarella pizza',
        image: require('@/assets/images/dish1.png'),
        price: 10.99,
        dietary: ['Vegetarian']
      },
      {
        id: 'm2',
        name: 'Pasta Carbonara',
        description: 'Creamy pasta with pancetta and parmesan',
        image: require('@/assets/images/dish2.png'),
        price: 12.99,
      },
    ]
  },
  '2':{
    id: '2',
    name: 'John Doe',
    image: require('@/assets/images/chef2.png'),
    rating: 4.8,
    cuisine: 'Mexican Cuisine',
    bio: 'John is known for his vibrant and flavorful Mexican dishes. He brings the taste of Mexico to your table.',
    menuItems: [
      {
        id: 'm3',
        name: 'Tacos al Pastor',
        description: 'Spicy pork tacos with pineapple salsa',
        image: require('@/assets/images/dish3.png'),
        price: 9.99,
      },
    ]
    
  },
  '3': {
    id: '3',
    name: 'Jenny Wilson',
    image: require('@/assets/images/chef3.png'),
    rating: 4.7,
    cuisine: 'Pastry Expert',
    bio: 'Jenny is a master of sweet treats and desserts. Her creations are as beautiful as they are delicious.',
    menuItems: [
      {
        id: 'm4',
        name: 'Chocolate Soufflé',
        description: 'Rich and moist chocolate dessert',
        image: require('@/assets/images/dish3.png'),
        price: 7.99,
      },
    ]
  },
  '4': {
    id: '4',
    name: 'Robert Fox',
    image: require('@/assets/images/chef4.png'),
    rating: 4.9,
    cuisine: 'Asian Fusion',
    bio: 'Robert combines traditional Asian techniques with modern flavors for a unique dining experience.',
    menuItems: [
      {
        id: 'm5',
        name: 'Spicy Ramen',
        description: 'Noodles in rich broth with vegetables',
        image: require('@/assets/images/dish1.png'),
        price: 11.99,
      },
    ]
  },
};

// Create a context for managing the cart
import { useCart } from '@/context/CartContext';

export default function ChefProfileScreen() {
  const { id } = useLocalSearchParams();
  const [chef, setChef] = useState<ChefDetails | null>(null);
  const { addToCart, getItemCount } = useCart();

  useEffect(() => {
    // In a real app, fetch this data from Firebase
    if (id && typeof id === 'string') {
      setChef(chefData[id]);
    }
  }, [id]);

  if (!chef) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading chef details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Function to handle adding items to cart
  const handleAddToCart = (item: MenuItem) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
      chefId: chef.id,
      chefName: chef.name
    });
  };

  // Function to view cart and navigate to order screen
  const viewCart = () => {
    router.push('/orders');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with back button and cart */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={wp('6%')} color="#333" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={viewCart} style={styles.cartButton}>
            <MaterialIcons name="shopping-cart" size={wp('6%')} color="#FF4B3E" />
            {getItemCount() > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{getItemCount()}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        
        {/* Chef Profile */}
        <View style={styles.profileContainer}>
          <Image source={chef.image} style={styles.chefImage} />
          
          <Text style={styles.chefName}>{chef.name}</Text>
          
          <View style={styles.ratingContainer}>
            {[...Array(5)].map((_, i) => (
              <MaterialIcons
                key={i}
                name={i < Math.floor(chef.rating) ? 'star' : (i === Math.floor(chef.rating) && chef.rating % 1 > 0 ? 'star-half' : 'star-outline')}
                size={wp('4.5%')}
                color="#FFB800"
              />
            ))}
            <Text style={styles.ratingText}> {chef.rating}</Text>
          </View>
          
          <Text style={styles.cuisineText}>{chef.cuisine}</Text>
          
          <Text style={styles.bioText}>{chef.bio}</Text>
        </View>
        
        {/* Menu Section */}
        <View style={styles.menuSection}>
          <Text style={styles.menuTitle}>Menu</Text>
          
          {chef.menuItems.map((item) => (
            <View key={item.id} style={styles.menuItem}>
              <View style={styles.menuItemImageContainer}>
                <Image source={item.image} style={styles.menuItemImage} />
              </View>
              
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemName}>{item.name}</Text>
                <Text style={styles.menuItemDescription}>{item.description}</Text>
                {item.dietary && (
                  <Text style={styles.dietaryText}>{item.dietary.join(' • ')}</Text>
                )}
                
                <View style={styles.menuItemFooter}>
                  <Text style={styles.menuItemPrice}>${item.price.toFixed(2)}</Text>
                  
                  <TouchableOpacity 
                    style={styles.addButton}
                    onPress={() => handleAddToCart(item)}
                  >
                    <MaterialIcons name="shopping-cart" size={wp('5%')} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: hp('5%'),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: wp('4%'),
    fontFamily: 'Poppins_500Medium',
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    paddingTop: hp('2%'),
    paddingBottom: hp('1%'),
  },
  backButton: {
    padding: wp('2%'),
  },
  cartButton: {
    padding: wp('2%'),
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF4B3E',
    borderRadius: wp('2.5%'),
    width: wp('5%'),
    height: wp('5%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: wp('2.5%'),
    fontFamily: 'Poppins_600SemiBold',
  },
  profileContainer: {
    alignItems: 'center',
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('4%'),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  chefImage: {
    width: wp('28%'),
    height: wp('28%'),
    borderRadius: wp('14%'),
    marginBottom: hp('2%'),
  },
  chefName: {
    fontSize: wp('6%'),
    fontFamily: 'Poppins_600SemiBold',
    color: '#333',
    marginBottom: hp('1%'),
    textAlign: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  ratingText: {
    fontSize: wp('4%'),
    fontFamily: 'Poppins_400Regular',
    color: '#666',
  },
  cuisineText: {
    fontSize: wp('4%'),
    fontFamily: 'Poppins_500Medium',
    color: '#333',
    marginBottom: hp('1.5%'),
  },
  bioText: {
    fontSize: wp('3.5%'),
    fontFamily: 'Poppins_400Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: hp('2.5%'),
    paddingHorizontal: wp('5%'),
  },
  menuSection: {
    padding: wp('4%'),
  },
  menuTitle: {
    fontSize: wp('5%'),
    fontFamily: 'Poppins_600SemiBold',
    color: '#333',
    marginBottom: hp('2%'),
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: wp('3%'),
    marginBottom: hp('2%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  menuItemImageContainer: {
    width: wp('25%'),
    height: wp('25%'),
    overflow: 'hidden',
  },
  menuItemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  menuItemContent: {
    flex: 1,
    padding: wp('3%'),
    justifyContent: 'space-between',
  },
  menuItemName: {
    fontSize: wp('4%'),
    fontFamily: 'Poppins_600SemiBold',
    color: '#333',
    marginBottom: hp('0.5%'),
  },
  menuItemDescription: {
    fontSize: wp('3.5%'),
    fontFamily: 'Poppins_400Regular',
    color: '#666',
    marginBottom: hp('0.5%'),
    flexShrink: 1,
  },
  dietaryText: {
    fontSize: wp('3%'),
    fontFamily: 'Poppins_400Regular',
    color: '#00669B',
    marginBottom: hp('1%'),
  },
  menuItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: hp('0.5%'),
  },
  menuItemPrice: {
    fontSize: wp('4%'),
    fontFamily: 'Poppins_600SemiBold',
    color: '#FF4B3E',
  },
  addButton: {
    backgroundColor: '#FF4B3E',
    borderRadius: wp('2%'),
    width: wp('9%'),
    height: wp('9%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
});