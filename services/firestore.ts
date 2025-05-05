import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

// Define OrderStatus type
export type OrderStatus = 'new' | 'preparing' | 'ready' | 'completed' | 'cancelled';

// Define OrderItem interface
export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: any;
}

// Define FirestoreOrder interface
export interface FirestoreOrder {
  id: string;
  customerName: string;
  address: string;
  phone?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  createdAt: Timestamp;
  notes?: string;
}

/**
 * Fetch all orders for a specific chef
 * @param chefId The ID of the chef
 * @returns Promise that resolves to an array of FirestoreOrder objects
 */
export const fetchChefOrders = async (chefId: string): Promise<FirestoreOrder[]> => {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('chefId', '==', chefId));
    const querySnapshot = await getDocs(q);
    
    const orders: FirestoreOrder[] = [];
    querySnapshot.forEach(doc => {
      orders.push({
        id: doc.id,
        ...doc.data()
      } as FirestoreOrder);
    });
    
    return orders;
  } catch (error) {
    console.error('Error fetching chef orders:', error);
    throw error;
  }
};

/**
 * Get an order by its ID
 * @param orderId The order ID
 * @returns Promise with the order data or null if not found
 */
export const getOrderById = async (orderId: string): Promise<FirestoreOrder | null> => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (orderSnap.exists()) {
      return { id: orderSnap.id, ...orderSnap.data() } as FirestoreOrder;
    }
    return null;
  } catch (error: any) {
    console.error('Error getting order by ID:', error);
    throw error;
  }
};

/**
 * Update the status of an order
 * @param orderId The order ID
 * @param status The new status
 * @returns Promise that resolves when the update is complete
 */
export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<void> => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error: any) {
    console.error('Error updating order status:', error);
    throw error;
  }
};