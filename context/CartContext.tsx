import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the cart item interface
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: any;
  chefId: string;
  chefName: string;
}

// Define the cart context interface
interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  totalAmount: number;
  getItemCount: () => number;
}

// Create the context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart provider component
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  
  // Calculate total amount
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // Add item to cart
  const addToCart = (newItem: CartItem) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === newItem.id);
      
      if (existingItem) {
        // If item already exists, increase the quantity
        return currentItems.map(item => 
          item.id === newItem.id 
            ? { ...item, quantity: item.quantity + newItem.quantity } 
            : item
        );
      }
      
      // Otherwise, add as a new item
      return [...currentItems, newItem];
    });
  };
  
  // Update item quantity
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    setItems(currentItems => 
      currentItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };
  
  // Remove item from cart
  const removeFromCart = (id: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== id));
  };
  
  // Clear the cart
  const clearCart = () => {
    setItems([]);
  };
  
  // Get total number of items
  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };
  
  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      totalAmount,
      getItemCount
    }}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook to use the cart context
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}