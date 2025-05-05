import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, updateDoc, getDoc , orderBy} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { Order, OrderStatus,  } from '@/types/orderTypes';

/**
 * Creates a new customer order in Firestore
 * @param orderData The order data to save
 * @returns Promise resolving to the order ID
 */
export const createCustomerOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    // Add createdAt and updatedAt timestamps automatically
    const orderRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return orderRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

/**
 * Fetches orders for a specific customer
 * @param customerId The customer user ID
 * @returns Promise resolving to array of orders
 */
export const fetchCustomerOrders = async (customerId: string): Promise<Order[]> => {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('customerId', '==', customerId));
    const querySnapshot = await getDocs(q);
    
    const orders: Order[] = [];
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() } as Order);
    });
    
    return orders;
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    throw error;
  }
};

/**
 * Fetches orders for a specific chef
 * @param chefId The chef user ID
 * @returns Promise resolving to array of orders
 */
export const fetchChefOrders = async (chefId: string): Promise<Order[]> => {
  try {
    // Validate input
    if (!chefId) {
      console.warn('No chef ID provided to fetchChefOrders');
      return [];
    }
    
    const ordersRef = collection(db, 'orders');
    
    // First try without orderBy to check if basic permissions work
    const basicQuery = query(ordersRef, where('chefId', '==', chefId));
    
    try {
      const querySnapshot = await getDocs(basicQuery);
      
      // If that worked, try with ordering
      const q = query(
        ordersRef, 
        where('chefId', '==', chefId),
        orderBy('createdAt', 'desc')
      );
      
      const orderedSnapshot = await getDocs(q);
      const orders: Order[] = [];
      
      orderedSnapshot.forEach((doc) => {
        const data = doc.data();
        orders.push({ 
          id: doc.id, 
          ...data,
          // Ensure createdAt is handled properly even if it's a Timestamp
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
        } as Order);
      });
      
      return orders;
    } catch (indexError) {
      console.warn('Index error, falling back to unordered query:', indexError);
      
      // Fall back to unordered query if index doesn't exist
      const fallbackSnapshot = await getDocs(basicQuery);
      const orders: Order[] = [];
      
      fallbackSnapshot.forEach((doc) => {
        const data = doc.data();
        orders.push({ 
          id: doc.id, 
          ...data,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
        } as Order);
      });
      
      // Sort in memory as fallback
      return orders.sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
    }
  } catch (error) {
    console.error('Error fetching chef orders:', error);
    throw error;
  }
};

/**
 * Updates the status of an order
 * @param orderId The order ID to update
 * @param status The new status
 * @returns Promise that resolves when update is complete
 */
export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<void> => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

/**
 * Fetches a single order by ID
 * @param orderId The order ID to fetch
 * @returns Promise resolving to the order or null if not found
 */
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (orderSnap.exists()) {
      return { id: orderSnap.id, ...orderSnap.data() } as Order;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};