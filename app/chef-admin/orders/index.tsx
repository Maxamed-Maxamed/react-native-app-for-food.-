import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { formatDistanceToNow } from 'date-fns';

import ScreenHeader from '../components/ScreenHeader';
// In files that need authentication
import { useAuth } from '@/hooks/useAuth';

// In files that need firestore services
import { getOrderById, updateOrderStatus, fetchChefOrders } from '@/services/firestore';

// Define a type for the order status
type OrderStatus = 'new' | 'preparing' | 'ready' | 'completed';

// Define interface for order item
interface Order {
  id: string;
  customerName: string;
  items: number;
  amount: number;
  status: OrderStatus;
  time: string;
}

// Define interface for Firestore order
interface FirestoreOrder {
  id: string;
  customerName: string;
  items: { name: string; quantity: number }[];
  total: number;
  status: string;
  createdAt: { seconds: number; nanoseconds: number };
}

// Mock data for orders
const mockOrders: Order[] = [
  {
    id: 'order_1',
    customerName: 'John Smith',
    items: 3,
    amount: 42.95,
    status: 'new',
    time: '10 minutes ago',
  },
  {
    id: 'order_2',
    customerName: 'Sarah Johnson',
    items: 2,
    amount: 27.50,
    status: 'preparing',
    time: '25 minutes ago',
  },
  {
    id: 'order_3',
    customerName: 'Michael Brown',
    items: 4,
    amount: 52.75,
    status: 'ready',
    time: '40 minutes ago',
  },
  {
    id: 'order_4',
    customerName: 'Emily Davis',
    items: 1,
    amount: 18.50,
    status: 'completed',
    time: '1 hour ago',
  },
  {
    id: 'order_5',
    customerName: 'David Wilson',
    items: 5,
    amount: 65.30,
    status: 'completed',
    time: '2 hours ago',
  },
];

export default function OrdersScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [firestoreOrders, setFirestoreOrders] = useState<FirestoreOrder[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch orders when component mounts
  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  // Fetch orders from Firestore
  const fetchOrders = async () => {
    if (!user) return;
    
    try {
      const fetchedOrders = await fetchChefOrders(user.id);
      setFirestoreOrders(fetchedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', 'Failed to fetch orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  // Map Firestore orders to the format our component expects
  const displayOrders = firestoreOrders.length > 0
    ? firestoreOrders.map(order => ({
        id: order.id,
        customerName: order.customerName,
        items: order.items.length,
        amount: order.total,
        status: order.status as OrderStatus,
        time: formatDistanceToNow(new Date(order.createdAt.seconds * 1000), { addSuffix: true })
      }))
    : orders;  // Fallback to mock data if no Firestore orders

  const getStatusColor = (status: OrderStatus): string => {
    switch (status) {
      case 'new': return '#FF4B3E';
      case 'preparing': return '#FFB800';
      case 'ready': return '#4CAF50';
      case 'completed': return '#999';
      default: return '#999';
    }
  };

  const getStatusText = (status: OrderStatus): string => {
    switch (status) {
      case 'new': return 'New Order';
      case 'preparing': return 'Preparing';
      case 'ready': return 'Ready';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  const handleOrderPress = (id: string) => {
    router.push(`/chef-admin/orders/${id}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <ScreenHeader
        title="Orders"
        subtitle="Manage your orders"
        showBackButton={true}
        onBackPress={() => router.push('/chef-admin/dashboard/dashboard')}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF4B3E" />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      ) : (
        <FlatList
          data={displayOrders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.orderCard}
              onPress={() => handleOrderPress(item.id)}
            >
              <View style={styles.orderHeader}>
                <Text style={styles.customerName}>{item.customerName}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                  <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
                </View>
              </View>

              <View style={styles.orderDetails}>
                <View style={styles.detailItem}>
                  <MaterialIcons name="restaurant" size={wp('4%')} color="#666" />
                  <Text style={styles.detailText}>{item.items} items</Text>
                </View>
                
                <View style={styles.detailItem}>
                  <MaterialIcons name="attach-money" size={wp('4%')} color="#666" />
                  <Text style={styles.detailText}>${item.amount.toFixed(2)}</Text>
                </View>
                
                <View style={styles.detailItem}>
                  <MaterialIcons name="access-time" size={wp('4%')} color="#666" />
                  <Text style={styles.detailText}>{item.time}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="receipt-long" size={80} color="#ddd" />
              <Text style={styles.emptyText}>No orders yet</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingTop: hp('5%'),
  },
  listContainer: {
    padding: wp('5%'),
    paddingBottom: hp('10%'),
  },
  orderCard: {
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  customerName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: wp('4%'),
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.5%'),
    borderRadius: wp('2%'),
  },
  statusText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: wp('3%'),
    color: '#fff',
  },
  orderDetails: {
    flexDirection: 'row',
    marginTop: hp('1%'),
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: wp('4%'),
  },
  detailText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: wp('3.5%'),
    color: '#666',
    marginLeft: wp('1%'),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: wp('4%'),
    color: '#666',
    marginTop: hp('1%'),
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('10%'),
  },
  emptyText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: wp('4%'),
    color: '#666',
    marginTop: hp('2%'),
  },
});