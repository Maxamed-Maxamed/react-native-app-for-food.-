export type OrderStatus = 'pending' | 'new' | 'preparing' | 'ready' | 'completed' | 'cancelled' | 'delivered' | 'in-progress';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: any; // In a real app, this should be a URL string
  chefId?: string;
  chefName?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  chefId: string;
  chefName: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  address: string;
  phone?: string;
  status: OrderStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}