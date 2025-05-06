import { collection, addDoc, doc, updateDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { db as firestore } from '@/services/firebase'; // Changed from '@/firebase'
import { MenuItem, generateMenuItemId } from '@/utils/menuHelpers';

// Collection reference
const menuItemsCollection = collection(firestore, 'menuItems');

// Get chef's menu items
export const getChefMenuItems = async (chefId: string): Promise<MenuItem[]> => {
  try {
    const q = query(menuItemsCollection, where("chefId", "==", chefId));
    const querySnapshot = await getDocs(q);
    
    const menuItems: MenuItem[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      menuItems.push({
        ...data,
        id: doc.id,
      } as MenuItem);
    });
    
    return menuItems;
  } catch (error) {
    console.error("Error getting menu items:", error);
    throw error;
  }
};

// Add a new menu item
export const addMenuItem = async (item: Omit<MenuItem, 'id'>, chefId: string): Promise<string> => {
  try {
    const newItem = {
      ...item,
      chefId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const docRef = await addDoc(menuItemsCollection, newItem);
    return docRef.id;
  } catch (error) {
    console.error("Error adding menu item:", error);
    throw error;
  }
};

// Update a menu item
export const updateMenuItem = async (id: string, item: Partial<MenuItem>): Promise<void> => {
  try {
    const docRef = doc(firestore, 'menuItems', id);
    await updateDoc(docRef, {
      ...item,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error updating menu item:", error);
    throw error;
  }
};

// Delete a menu item
export const deleteMenuItem = async (id: string): Promise<void> => {
  try {
    const docRef = doc(firestore, 'menuItems', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting menu item:", error);
    throw error;
  }
};

// Toggle availability
export const toggleMenuItemAvailability = async (id: string, available: boolean): Promise<void> => {
  try {
    const docRef = doc(firestore, 'menuItems', id);
    await updateDoc(docRef, { 
      available, 
      updatedAt: new Date() 
    });
  } catch (error) {
    console.error("Error toggling menu item availability:", error);
    throw error;
  }
};