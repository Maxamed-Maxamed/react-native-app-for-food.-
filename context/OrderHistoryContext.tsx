import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem } from './CartContext';
import { createCustomerOrder, fetchCustomerOrders, updateOrderStatus as updateFirestoreOrderStatus } from '@/services/orderService';
import { useAuth } from './AuthContext';
import { Order as FirestoreOrder, OrderStatus } from '@/types/orderTypes';

// Keep the existing Order type for backward compatibility
export interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  deliveryFee: number;
  address: string;
  date: string;
  status: 'delivered' | 'in-progress' | 'cancelled';
}

interface OrderHistoryContextType {
  orders: Order[];
  firestoreOrders: FirestoreOrder[];
  addOrder: (order: Omit<Order, 'id' | 'date' | 'status'>) => Promise<void>;
  clearHistory: () => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  refreshOrders: () => Promise<void>;
  isLoading: boolean;
}

const OrderHistoryContext = createContext<OrderHistoryContextType | undefined>(undefined);

export function OrderHistoryProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [firestoreOrders, setFirestoreOrders] = useState<FirestoreOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  
  // Load orders from AsyncStorage on component mount - for backward compatibility
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const storedOrders = await AsyncStorage.getItem('orderHistory');
        if (storedOrders) {
          setOrders(JSON.parse(storedOrders));
        }
      } catch (error) {
        console.error('Failed to load order history:', error);
      }
    };
    loadOrders();
  }, []);

  // Fetch orders from Firestore when user changes
  useEffect(() => {
    if (user) {
      refreshOrders();
    }
  }, [user]);

  // Function to refresh orders from Firestore
  const refreshOrders = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const userOrders = await fetchCustomerOrders(user.id);
      setFirestoreOrders(userOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save legacy orders to AsyncStorage whenever they change
  useEffect(() => {
    const saveOrders = async () => {
      try {
        await AsyncStorage.setItem('orderHistory', JSON.stringify(orders));
      } catch (error) {
        console.error('Failed to save order history:', error);
      }
    };
    if (orders.length > 0) {
      saveOrders();
    }
  }, [orders]);
  
  const addOrder = async (order: Omit<Order, 'id' | 'date' | 'status'>) => {
    // For backward compatibility, continue using the old system
    const newOrder: Order = {
      ...order,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      status: 'in-progress',
    };
    
    setOrders((currentOrders) => [newOrder, ...currentOrders]);
    
    // Set a timer to automatically change status to "delivered" after 1 minute
    setTimeout(() => {
      updateOrderStatus(newOrder.id, 'delivered');
    }, 60000); // 60000 ms = 1 minute
    
    // Also save to Firestore if user is logged in
    if (user) {
      try {
        // Get chef info from the first item (assuming all items are from the same chef)
        const chefId = order.items[0]?.chefId || '';
        const chefName = order.items[0]?.chefName || '';
        
        // Create the Firestore order
        await createCustomerOrder({
          customerId: user.id,
          customerName: user.name,
          chefId,
          chefName,
          items: order.items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
          subtotal: order.totalAmount,
          deliveryFee: order.deliveryFee,
          total: order.totalAmount + order.deliveryFee,
          address: order.address,
          status: 'new',
          notes: '',
        });
        
        // Refresh orders to include the new one
        refreshOrders();
      } catch (error) {
        console.error('Error creating Firestore order:', error);
      }
    }
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    // Update local state
    setOrders((currentOrders) => 
      currentOrders.map(order => 
        order.id === id ? { ...order, status } : order
      )
    );
    
    // If the order exists in Firestore, update it there too
    if (user) {
      const firestoreOrder = firestoreOrders.find(order => order.id === id);
      if (firestoreOrder) {
        updateFirestoreOrderStatus(id, status as OrderStatus)
          .then(() => refreshOrders())
          .catch(err => console.error('Error updating Firestore order status:', err));
      }
    }
  };

  const clearHistory = () => {
    setOrders([]);
    AsyncStorage.removeItem('orderHistory');
    // Note: This doesn't delete orders from Firestore, just clears local state
  };

  return (
    <OrderHistoryContext.Provider 
      value={{ 
        orders, 
        firestoreOrders,
        addOrder, 
        clearHistory, 
        updateOrderStatus,
        refreshOrders,
        isLoading
      }}
    >
      {children}
    </OrderHistoryContext.Provider>
  );
}

export function useOrderHistory() {
  const context = useContext(OrderHistoryContext);
  if (context === undefined) {
    throw new Error('useOrderHistory must be used within an OrderHistoryProvider');
  }
  return context;
}