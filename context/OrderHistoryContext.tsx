import React, { createContext, useState, useContext, useEffect } from 'react';
import { CartItem } from './CartContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  addOrder: (order: Omit<Order, 'id' | 'date' | 'status'>) => void;
  clearHistory: () => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
}

const OrderHistoryContext = createContext<OrderHistoryContextType | undefined>(undefined);

export function OrderHistoryProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);

  // Load orders from AsyncStorage on component mount
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

  // Save orders to AsyncStorage whenever they change
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

  const addOrder = (order: Omit<Order, 'id' | 'date' | 'status'>) => {
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
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrders((currentOrders) => 
      currentOrders.map(order => 
        order.id === id ? { ...order, status } : order
      )
    );
  };

  const clearHistory = () => {
    setOrders([]);
    AsyncStorage.removeItem('orderHistory');
  };

  return (
    <OrderHistoryContext.Provider value={{ orders, addOrder, clearHistory, updateOrderStatus }}>
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