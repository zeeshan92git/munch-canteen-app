import { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);

  // Load cart when user logs in
  useEffect(() => {
    if (user) fetchCart();
    else setCartItems([]);
  }, [user]);

  const fetchCart = async () => {
    try {
      setCartLoading(true);
      const res = await cartAPI.getCart();
      // Handle standard response or nested data object
      const items = res.data?.items || res.data?.data?.items || res.data || [];
      setCartItems(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Fetch cart error:", err);
      setCartItems([]);
    } finally {
      setCartLoading(false);
    }
  };

  const addToCart = async (menuItemId, quantity = 1) => {
    try {
      const res = await cartAPI.addItem(menuItemId, quantity);
      const updatedItems = res.data?.items || res.data?.data?.items || res.data || [];
      setCartItems(Array.isArray(updatedItems) ? updatedItems : []);
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    // If quantity is 0 or less, remove the item entirely
    if (quantity <= 0) return removeFromCart(cartItemId);
    
    try {
      const res = await cartAPI.updateItem(cartItemId, quantity);
      const updatedItems = res.data?.items || res.data?.data?.items || res.data || [];
      setCartItems(Array.isArray(updatedItems) ? updatedItems : []);
    } catch (err) {
      console.error("Update quantity error:", err);
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      const res = await cartAPI.removeItem(cartItemId);
      console.log("Item from cart removed with Id:",cartItemId);
      const updatedItems = res.data?.items || res.data?.data?.items || res.data || [];
      setCartItems(Array.isArray(updatedItems) ? updatedItems : []);
    } catch (err) {
      console.error("Remove item error:", err);
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clearCart();
      setCartItems([]);
    } catch (err) {
      console.error("Clear cart error:", err);
    }
  };

  /**
   * CALCULATION LOGIC
   * Based on your data format: 
   * item.quantity exists at top level.
   * item.menu_item.price contains the unit price.
   */
  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.menu_item?.price || 0;
    const qty = item.quantity || 0;
    return sum + (price * qty);
  }, 0);

  const tax = Math.round(subtotal * 0.15);
  const total = subtotal + tax;

  return (
    <CartContext.Provider value={{
      cartItems, 
      cartLoading, 
      cartCount, 
      subtotal, 
      tax, 
      total,
      addToCart, 
      updateQuantity, 
      removeFromCart, 
      clearCart, 
      fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};