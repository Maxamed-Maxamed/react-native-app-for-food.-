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
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { useCart, CartItem } from '@/context/CartContext';
import { useOrderHistory } from '@/context/OrderHistoryContext';
import { useAuth } from '@/context/AuthContext';

export default function OrdersScreen() {
  const { items, updateQuantity, totalAmount, clearCart } = useCart();
  const { addOrder } = useOrderHistory();
  const [address, setAddress] = useState('');
  const { user } = useAuth();
  
  const deliveryFee = 2.00;
  const total = totalAmount + deliveryFee;
  
  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before placing an order.');
      return;
    }
    
    if (!address) {
      Alert.alert('Address Required', 'Please enter your delivery address.');
      return;
    }

    if (!user) {
      Alert.alert(
        'Login Required',
        'You need to be logged in to place an order.',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Login',
            onPress: () => router.push('/login')
          }
        ]
      );
      return;
    }
    
    try {
      await addOrder({
        items: [...items],
        totalAmount,
        deliveryFee,
        address,
      });
      
      Alert.alert(
        'Order Placed!',
        `Your order of $${total.toFixed(2)} has been placed successfully.\n\nIt will be delivered in about a minute.`,
        [
          {
            text: 'View Order History',
            onPress: () => {
              clearCart();
              router.push('/history');
            },
          },
          {
            text: 'OK',
            onPress: () => {
              clearCart();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Error', 'There was a problem placing your order. Please try again.');
    }
  };
  
  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <MaterialIcons name="shopping-cart" size={80} color="#ddd" />
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <TouchableOpacity 
            style={styles.browseButton}
            onPress={() => router.push('/(tabs)/home')}
          >
            <Text style={styles.browseButtonText}>Browse Chefs</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.historyButton}
            onPress={() => router.push('/history')}
          >
            <Text style={styles.historyButtonText}>View Order History</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  const renderRightActions = (item: CartItem) => {
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => {
          Alert.alert(
            'Remove Item',
            'Are you sure you want to remove this item?',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => updateQuantity(item.id, 0),
              },
            ]
          );
        }}
      >
        <MaterialIcons name="delete" size={24} color="#fff" />
      </TouchableOpacity>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Order</Text>
        </View>
        
        <ScrollView>
          {items.map((item) => (
            <Swipeable
              key={item.id}
              renderRightActions={() => renderRightActions(item)}
              rightThreshold={40}
            >
              <View style={styles.orderItem}>
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
            </Swipeable>
          ))}
        
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
        
        <TouchableOpacity 
          style={styles.placeOrderButton}
          onPress={handlePlaceOrder}
        >
          <Text style={styles.placeOrderText}>Place Order</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </GestureHandlerRootView>
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
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#FF4B3E',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  orderItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    color: '#333',
  },
  quantityText: {
    fontSize: 16,
    marginHorizontal: 12,
    color: '#333',
  },
  priceDetails: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    marginTop: 16,
  },
  priceDetailsTitle: {
    fontSize: 18,
    fontWeight: '600',
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
    color: '#666',
  },
  priceValue: {
    fontSize: 14,
    color: '#333',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF4B3E',
  },
  addressContainer: {
    marginTop: 24,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  addressInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    paddingVertical: 12,
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
    fontSize: 16,
    fontWeight: '600',
  },
  deleteAction: {
    backgroundColor: '#FF4B3E',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  historyButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FF4B3E',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  historyButtonText: {
    color: '#FF4B3E',
    fontSize: 16,
    fontWeight: '600',
  },
});