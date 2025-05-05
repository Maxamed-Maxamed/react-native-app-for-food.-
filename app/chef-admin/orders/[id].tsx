import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import ScreenHeader from '../components/ScreenHeader';
import { getOrderById, updateOrderStatus } from '@/services/firestore'; // Assuming these functions are defined in services/firestore

// Define OrderStatus type for consistency
type OrderStatus = 'new' | 'preparing' | 'ready' | 'completed' | 'cancelled';

// Define OrderItem interface
interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: any;
}

// Define Order interface
interface Order {
  id: string;
  customerName: string;
  address: string;
  phone: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  orderTime: string;
  notes: string;
}

// Define MockOrderDetails interface with index signature
interface MockOrderDetails {
  [key: string]: Order;
}

// Mock order data
const mockOrderDetails: MockOrderDetails = {
  order_1: {
    id: 'order_1',
    customerName: 'John Smith',
    address: '123 Main Street, Apt 4B, New York, NY 10001',
    phone: '(212) 555-1234',
    items: [
      {
        id: 'item_1',
        name: 'Spaghetti Carbonara',
        price: 16.99,
        quantity: 1,
        image: require('@/assets/images/dish1.png'),
      },
      {
        id: 'item_2',
        name: 'Tiramisu',
        price: 7.99,
        quantity: 1,
        image: require('@/assets/images/dish3.png'),
      },
      {
        id: 'item_3',
        name: 'House Red Wine',
        price: 17.97,
        quantity: 1,
        image: require('@/assets/images/dish2.png'),
      },
    ],
    subtotal: 42.95,
    deliveryFee: 3.99,
    total: 46.94,
    status: 'new',
    orderTime: '2023-07-15T10:30:00',
    notes: 'Please include extra parmesan cheese if possible.',
  },
  order_2: {
    id: 'order_2',
    customerName: 'Sarah Johnson',
    address: '456 Park Avenue, New York, NY 10022',
    phone: '(212) 555-5678',
    items: [
      {
        id: 'item_4',
        name: 'Caprese Salad',
        price: 9.99,
        quantity: 1,
        image: require('@/assets/images/dish2.png'),
      },
      {
        id: 'item_5',
        name: 'Tiramisu',
        price: 7.99,
        quantity: 1,
        image: require('@/assets/images/dish3.png'),
      },
    ],
    subtotal: 17.98,
    deliveryFee: 3.99,
    total: 21.97,
    status: 'preparing',
    orderTime: '2023-07-15T10:00:00',
    notes: '',
  },
  // Add more mock orders as needed
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && typeof id === 'string') {
      // Try to fetch from Firestore first
      getOrderById(id)
        .then(firestoreOrder => {
          if (firestoreOrder) {
            // Convert Firestore order to our local format
            setOrder({
              id: firestoreOrder.id,
              customerName: firestoreOrder.customerName,
              address: firestoreOrder.address,
              phone: firestoreOrder.phone || '',
              items: firestoreOrder.items,
              subtotal: firestoreOrder.subtotal,
              deliveryFee: firestoreOrder.deliveryFee,
              total: firestoreOrder.total,
              status: firestoreOrder.status,
              orderTime: firestoreOrder.createdAt.toDate ? 
                firestoreOrder.createdAt.toDate().toISOString() : 
                firestoreOrder.createdAt.toString(),
              notes: firestoreOrder.notes || '',
            });
          } else if (mockOrderDetails[id]) {
            // Fall back to mock data
            setOrder(mockOrderDetails[id]);
          } else {
            // Not found anywhere
            Alert.alert('Error', 'Order not found');
            router.back();
          }
        })
        .catch(error => {
          console.error('Error fetching order:', error);
          
          // Fall back to mock data
          if (mockOrderDetails[id]) {
            setOrder(mockOrderDetails[id]);
          } else {
            Alert.alert('Error', 'Failed to load order details');
            router.back();
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  const updateStatus = async (newStatus: OrderStatus) => {
    if (!order) return;
    
    try {
      // Update in Firestore
      await updateOrderStatus(order.id, newStatus);
      
      // Update local state
      setOrder({...order, status: newStatus});
      
      Alert.alert('Status Updated', `Order status changed to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const getStatusColor = (status: OrderStatus): string => {
    switch (status) {
      case 'new': return '#FF4B3E';
      case 'preparing': return '#FFB800';
      case 'ready': return '#4CAF50';
      case 'completed': return '#999';
      case 'cancelled': return '#F44336';
      default: return '#999';
    }
  };

  const getStatusText = (status: OrderStatus): string => {
    switch (status) {
      case 'new': return 'New Order';
      case 'preparing': return 'Preparing';
      case 'ready': return 'Ready';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader
          title="Order Details"
          showBackButton={true}
          onBackPress={() => router.push('/chef-admin/orders')}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader
          title="Order Details"
          showBackButton={true}
          onBackPress={() => router.push('/chef-admin/orders')}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Order not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <ScreenHeader
        title={`Order #${order.id.split('_')[1]}`}
        showBackButton={true}
        onBackPress={() => router.push('/chef-admin/orders')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status Badge */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status as OrderStatus) }]}>
            <Text style={styles.statusText}>{getStatusText(order.status as OrderStatus)}</Text>
          </View>
        </View>
        
        {/* Customer Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Customer Information</Text>
          
          <View style={styles.infoRow}>
            <MaterialIcons name="person" size={wp('5%')} color="#666" />
            <Text style={styles.infoText}>{order.customerName}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <MaterialIcons name="phone" size={wp('5%')} color="#666" />
            <Text style={styles.infoText}>{order.phone}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <MaterialIcons name="location-on" size={wp('5%')} color="#666" />
            <Text style={styles.infoText}>{order.address}</Text>
          </View>
        </View>
        
        {/* Order Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Items</Text>
          
          {order.items.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <Image source={item.image} style={styles.itemImage} />
              
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
              </View>
              
              <Text style={styles.itemQuantity}>x{item.quantity}</Text>
            </View>
          ))}
          
          <View style={styles.divider} />
          
          <View style={styles.priceSummary}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal</Text>
              <Text style={styles.priceValue}>${order.subtotal.toFixed(2)}</Text>
            </View>
            
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Delivery Fee</Text>
              <Text style={styles.priceValue}>${order.deliveryFee.toFixed(2)}</Text>
            </View>
            
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${order.total.toFixed(2)}</Text>
            </View>
          </View>
        </View>
        
        {/* Order Notes */}
        {order.notes && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Special Instructions</Text>
            <Text style={styles.notesText}>{order.notes}</Text>
          </View>
        )}
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {order.status === 'new' && (
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#FFB800' }]}
              onPress={() => updateStatus('preparing')}
            >
              <Text style={styles.actionButtonText}>Start Preparing</Text>
            </TouchableOpacity>
          )}
          
          {order.status === 'preparing' && (
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
              onPress={() => updateStatus('ready')}
            >
              <Text style={styles.actionButtonText}>Mark as Ready</Text>
            </TouchableOpacity>
          )}
          
          {order.status === 'ready' && (
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#999' }]}
              onPress={() => updateStatus('completed')}
            >
              <Text style={styles.actionButtonText}>Complete Order</Text>
            </TouchableOpacity>
          )}
          
          {['new', 'preparing'].includes(order.status) && (
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#F44336' }]}
              onPress={() => Alert.alert(
                'Cancel Order',
                'Are you sure you want to cancel this order?',
                [
                  {text: 'No', style: 'cancel'},
                  {
                    text: 'Yes', 
                    style: 'destructive',
                    onPress: () => {
                      updateStatus('cancelled');
                      router.push('/chef-admin/orders');
                    }
                  }
                ]
              )}
            >
              <Text style={styles.actionButtonText}>Cancel Order</Text>
            </TouchableOpacity>
          )}
        </View>
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
  scrollContent: {
    padding: wp('5%'),
    paddingBottom: hp('10%'),
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
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  statusBadge: {
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1%'),
    borderRadius: wp('2%'),
  },
  statusText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: wp('4%'),
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: wp('4%'),
    padding: wp('4%'),
    marginBottom: hp('2%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: wp('4.5%'),
    color: '#333',
    marginBottom: hp('2%'),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  infoText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: wp('3.8%'),
    color: '#333',
    marginLeft: wp('2%'),
    flex: 1,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  itemImage: {
    width: wp('15%'),
    height: wp('15%'),
    borderRadius: wp('2%'),
  },
  itemDetails: {
    flex: 1,
    marginLeft: wp('3%'),
  },
  itemName: {
    fontFamily: 'Poppins_500Medium',
    fontSize: wp('4%'),
    color: '#333',
  },
  itemPrice: {
    fontFamily: 'Poppins_400Regular',
    fontSize: wp('3.5%'),
    color: '#666',
  },
  itemQuantity: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: wp('4%'),
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: hp('2%'),
  },
  priceSummary: {
    marginTop: hp('1%'),
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp('1%'),
  },
  priceLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: wp('3.8%'),
    color: '#666',
  },
  priceValue: {
    fontFamily: 'Poppins_400Regular',
    fontSize: wp('3.8%'),
    color: '#333',
  },
  totalLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: wp('4%'),
    color: '#333',
  },
  totalValue: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: wp('4%'),
    color: '#FF4B3E',
  },
  notesText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: wp('3.8%'),
    color: '#333',
    fontStyle: 'italic',
  },
  actionButtons: {
    marginTop: hp('2%'),
  },
  actionButton: {
    paddingVertical: hp('1.5%'),
    borderRadius: wp('2%'),
    alignItems: 'center',
    marginBottom: hp('1.5%'),
  },
  actionButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: wp('4%'),
    color: '#fff',
  },
});