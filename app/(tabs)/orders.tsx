import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  TextInput,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCart } from '@/context/CartContext'; // We'll create this context later

export default function OrdersScreen() {
  const { items, updateQuantity, totalAmount, clearCart } = useCart();
  const [address, setAddress] = useState('');
  
  // Fixed delivery fee
  const deliveryFee = 2.00;
  const total = totalAmount + deliveryFee;
  
  const handlePlaceOrder = () => {
    if (items.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before placing an order.');
      return;
    }
    
    if (!address) {
      Alert.alert('Address Required', 'Please enter your delivery address.');
      return;
    }
    
    // Here you would send the order to your backend/Firebase
    Alert.alert(
      'Order Placed!',
      `Your order of $${total.toFixed(2)} has been placed successfully.`,
      [
        {
          text: 'OK',
          onPress: () => {
            clearCart();
            // You could navigate to an order confirmation screen here
          },
        },
      ]
    );
  };
  
  // If cart is empty, show empty state
  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Order</Text>
        </View>
        
        <View style={styles.emptyContainer}>
          <MaterialIcons name="shopping-cart" size={80} color="#ddd" />
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <TouchableOpacity 
            style={styles.browseButton}
            onPress={() => router.push('/(tabs)/home')}
          >
            <Text style={styles.browseButtonText}>Browse Chefs</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Order</Text>
      </View>
      
      <ScrollView>
        {/* Order Items */}
        {items.map((item) => (
          <View key={item.id} style={styles.orderItem}>
            <Image source={item.image} style={styles.itemImage} />
            
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
            </View>
            
            <View style={styles.quantityControl}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
              >
                <Text style={styles.quantityButtonText}>−</Text>
              </TouchableOpacity>
              
              <Text style={styles.quantityText}>{item.quantity}</Text>
              
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity(item.id, item.quantity + 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        
        {/* Price Details */}
        <View style={styles.priceDetails}>
          <Text style={styles.priceDetailsTitle}>Price Details</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Item total</Text>
            <Text style={styles.priceValue}>${totalAmount.toFixed(2)}</Text>
          </View>
          
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Delivery fee</Text>
            <Text style={styles.priceValue}>${deliveryFee.toFixed(2)}</Text>
          </View>
          
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
          
          {/* Address Input */}
          <View style={styles.addressContainer}>
            <Text style={styles.addressLabel}>Address</Text>
            <TouchableOpacity style={styles.addressInput}>
              <TextInput
                style={styles.addressText}
                placeholder="Enter your address"
                value={address}
                onChangeText={setAddress}
                placeholderTextColor="#999"
              />
              <MaterialIcons name="keyboard-arrow-right" size={24} color="#999" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      {/* Place Order Button */}
      <TouchableOpacity 
        style={styles.placeOrderButton}
        onPress={handlePlaceOrder}
      >
        <Text style={styles.placeOrderText}>Place Order</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Poppins_600SemiBold',
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Poppins_500Medium',
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#FF4B3E',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    color: '#333',
  },
  itemPrice: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#666',
    marginTop: 4,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontFamily: 'Poppins_400Regular',
  },
  quantityText: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    marginHorizontal: 12,
  },
  priceDetails: {
    padding: 16,
    backgroundColor: '#fff',
  },
  priceDetailsTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#666',
  },
  priceValue: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#333',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#333',
  },
  addressContainer: {
    marginTop: 24,
  },
  addressLabel: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    color: '#333',
    marginBottom: 8,
  },
  addressInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
  placeOrderButton: {
    backgroundColor: '#FF4B3E',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  placeOrderText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
  },
});