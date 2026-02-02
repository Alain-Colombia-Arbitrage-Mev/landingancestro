import { atom, computed } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';

// ===== PRODUCT INTERFACE =====
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'solar' | 'battery' | 'charger' | 'vehicle' | 'token';
  quantity?: number;
}

// ===== CART ITEM =====
export interface CartItem extends Product {
  quantity: number;
}

// ===== CART STATE =====
export const cartItems = persistentAtom<CartItem[]>('ancestro:cart', [], {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export const isCartOpen = atom<boolean>(false);

// ===== COMPUTED VALUES =====
export const cartCount = computed(cartItems, (items) => 
  items.reduce((sum, item) => sum + item.quantity, 0)
);

export const cartTotal = computed(cartItems, (items) =>
  items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
);

export const hasItems = computed(cartItems, (items) => items.length > 0);

// ===== CART ACTIONS =====
export function addToCart(product: Product, quantity = 1) {
  const items = cartItems.get();
  const existingIndex = items.findIndex(item => item.id === product.id);
  
  if (existingIndex >= 0) {
    // Update quantity
    const updated = [...items];
    updated[existingIndex] = {
      ...updated[existingIndex],
      quantity: updated[existingIndex].quantity + quantity,
    };
    cartItems.set(updated);
  } else {
    // Add new item
    cartItems.set([...items, { ...product, quantity }]);
  }
  
  // Open cart drawer
  isCartOpen.set(true);
}

export function removeFromCart(productId: string) {
  cartItems.set(cartItems.get().filter(item => item.id !== productId));
}

export function updateQuantity(productId: string, quantity: number) {
  if (quantity <= 0) {
    removeFromCart(productId);
    return;
  }
  
  const items = cartItems.get();
  const updated = items.map(item => 
    item.id === productId ? { ...item, quantity } : item
  );
  cartItems.set(updated);
}

export function clearCart() {
  cartItems.set([]);
}

export function toggleCart() {
  isCartOpen.set(!isCartOpen.get());
}

export function openCart() {
  isCartOpen.set(true);
}

export function closeCart() {
  isCartOpen.set(false);
}

// ===== PRESALE TOKENS =====
export interface TokenPurchase {
  amount: number;
  pricePerToken: number;
  total: number;
  paymentMethod: 'crypto' | 'card' | 'bank';
  timestamp: string;
}

export const tokenPurchases = persistentAtom<TokenPurchase[]>('ancestro:tokens', [], {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export const totalTokens = computed(tokenPurchases, (purchases) =>
  purchases.reduce((sum, p) => sum + p.amount, 0)
);

export function addTokenPurchase(purchase: Omit<TokenPurchase, 'timestamp'>) {
  tokenPurchases.set([
    ...tokenPurchases.get(),
    { ...purchase, timestamp: new Date().toISOString() }
  ]);
}
