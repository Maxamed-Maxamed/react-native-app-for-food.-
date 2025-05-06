// Menu categories for filtering and organization
export const MENU_CATEGORIES = [
  { id: 'appetizers', name: 'Appetizers' },
  { id: 'main-courses', name: 'Main Courses' },
  { id: 'desserts', name: 'Desserts' },
  { id: 'drinks', name: 'Drinks' },
  { id: 'specials', name: 'Specials' },
];

// Dietary restrictions for menu items
export const DIETARY_OPTIONS = [
  { id: 'vegetarian', name: 'Vegetarian' },
  { id: 'vegan', name: 'Vegan' },
  { id: 'gluten-free', name: 'Gluten-Free' },
  { id: 'dairy-free', name: 'Dairy-Free' },
  { id: 'nut-free', name: 'Nut-Free' },
];

// Menu item interface
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: any; // In a real app, this would be a URL string
  category: string;
  dietary?: string[];
  available: boolean;
  chefId?: string;     // ID of the chef who created this item
  createdAt?: Date;    // When the item was created
  updatedAt?: Date;    // When the item was last updated
}

// Generate a unique ID for new menu items
export function generateMenuItemId(): string {
  return 'menu_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Format price for display
export function formatPrice(price: number): string {
  return price.toFixed(2);
}

// Validate menu item data
export function validateMenuItem(item: Partial<MenuItem>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!item.name || item.name.trim() === '') {
    errors.push('Menu item name is required');
  }
  
  if (!item.description || item.description.trim() === '') {
    errors.push('Description is required');
  }
  
  if (!item.price || item.price <= 0) {
    errors.push('Price must be greater than 0');
  }
  
  if (!item.category) {
    errors.push('Category is required');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// Mock data for menu items
export const mockMenuItems: MenuItem[] = [
  {
    id: 'menu_1',
    name: 'Margherita Pizza',
    description: 'Classic tomato and mozzarella pizza with fresh basil leaves',
    price: 12.99,
    image: require('@/assets/images/dish1.png'),
    category: 'main-courses',
    dietary: ['vegetarian'],
    available: true,
  },
  {
    id: 'menu_2',
    name: 'Pasta Carbonara',
    description: 'Creamy pasta with pancetta, eggs, and parmesan cheese',
    price: 14.99,
    image: require('@/assets/images/dish2.png'),
    category: 'main-courses',
    available: true,
  },
  {
    id: 'menu_3',
    name: 'Tiramisu',
    description: 'Italian dessert made of layers of coffee-soaked ladyfingers and mascarpone cream',
    price: 7.99,
    image: require('@/assets/images/dish3.png'),
    category: 'desserts',
    dietary: ['vegetarian'],
    available: true,
  },
  {
    id: 'menu_4',
    name: 'Caprese Salad',
    description: 'Fresh tomatoes, mozzarella, and basil drizzled with balsamic glaze',
    price: 9.99,
    image: require('@/assets/images/dish2.png'),
    category: 'appetizers',
    dietary: ['vegetarian', 'gluten-free'],
    available: false,
  },
  {
    id: 'menu_5',
    name: 'House Red Wine',
    description: 'Medium-bodied Italian red wine with notes of cherry and spice',
    price: 6.99,
    image: require('@/assets/images/dish3.png'),
    category: 'drinks',
    dietary: ['vegan', 'gluten-free'],
    available: true,
  }
];