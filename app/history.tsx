import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useOrderHistory } from '@/context/OrderHistoryContext';
import { formatDistanceToNow } from 'date-fns';
import { Order } from '@/context/OrderHistoryContext';
import { CartItem } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function OrderHistoryScreen() {
  const { orders, firestoreOrders, refreshOrders, isLoading } = useOrderHistory();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Force re-render when orders update
  const [, setRefresh] = useState(0);

  // Poll for updates every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefresh(r => r + 1);
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  // Handle manual refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await refreshOrders();
    setRefreshing(false);
  };

  // Determine which orders to display
  const displayOrders = user ? firestoreOrders : orders;

  // Convert Firestore orders to the format our OrderCard component expects
  const normalizeOrder = (order: any): Order => {
    if ('customerId' in order) { // It's a Firestore order
      return {
        id: order.id,
        items: order.items.map((item: any) => ({
          ...item,
          chefId: order.chefId,
          chefName: order.chefName,
        })),
        totalAmount: order.subtotal,
        deliveryFee: order.deliveryFee,
        address: order.address,
        date: order.createdAt.toDate ? order.createdAt.toDate().toISOString() : order.createdAt,
        status: order.status === 'preparing' || order.status === 'new' || order.status === 'ready' 
          ? 'in-progress' 
          : order.status,
      };
    }
    return order; // It's already a legacy order
  };

  if (displayOrders.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order History</Text>
        </View>
        
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#FF4B3E" />
            <Text style={styles.loadingText}>Loading orders...</Text>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="receipt-long" size={80} color="#ddd" />
            <Text style={styles.emptyText}>No order history yet</Text>
            <TouchableOpacity 
              style={styles.browseButton}
              onPress={() => router.push('/(tabs)/home')}
            >
              <Text style={styles.browseButtonText}>Browse Chefs</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order History</Text>
      </View>
      
      <ScrollView 
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {displayOrders.map((order) => (
          <OrderCard key={order.id} order={normalizeOrder(order)} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function OrderCard({ order }: { order: Order }) {
  // Display time like "2 hours ago" or "3 days ago"
  const timeAgo = formatDistanceToNow(new Date(order.date), { addSuffix: true });
  
  // Get a count of total items
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
  
  // Show status with appropriate color
  const getStatusColor = () => {
    switch (order.status) {
      case 'delivered': return '#4CAF50';
      case 'in-progress': return '#FF9800';
      case 'cancelled': return '#F44336';
      default: return '#999';
    }
  };

  // Get status icon
  const getStatusIcon = () => {
    switch (order.status) {
      case 'delivered': return "check-circle";
      case 'in-progress': return "delivery-dining";
      case 'cancelled': return "cancel";
      default: return "help";
    }
  };

  return (
    <TouchableOpacity 
      style={styles.orderCard}
      onPress={() => router.push(`/order-details/${order.id}`)}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderDate}>{timeAgo}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <MaterialIcons name={getStatusIcon()} size={12} color="#fff" style={styles.statusIcon} />
          <Text style={styles.statusText}>{order.status}</Text>
        </View>
      </View>
      
      <View style={styles.orderSummary}>
        <Text style={styles.itemCount}>{totalItems} {totalItems === 1 ? 'item' : 'items'}</Text>
        <Text style={styles.totalAmount}>${(order.totalAmount + order.deliveryFee).toFixed(2)}</Text>
      </View>
      
      <View style={styles.orderItems}>
        {order.items.slice(0, 2).map((item) => (
          <View key={item.id} style={styles.itemPreview}>
            <Image source={item.image} style={styles.itemImage} />
            <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
          </View>
        ))}
        {order.items.length > 2 && (
          <View style={styles.moreItems}>
            <Text style={styles.moreItemsText}>+{order.items.length - 2} more</Text>
          </View>
        )}
      </View>
      
      <View style={styles.orderFooter}>
        <MaterialIcons name="location-on" size={16} color="#666" />
        <Text style={styles.addressText} numberOfLines={1}>{order.address}</Text>
        <MaterialIcons name="chevron-right" size={24} color="#999" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 16,
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  orderCard: {
    margin: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  orderSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  itemCount: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF4B3E',
  },
  orderItems: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  itemPreview: {
    marginRight: 12,
    alignItems: 'center',
    width: 60,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginBottom: 4,
  },
  itemName: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  moreItems: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreItemsText: {
    fontSize: 10,
    color: '#666',
  },
  orderFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginHorizontal: 8,
  },
});