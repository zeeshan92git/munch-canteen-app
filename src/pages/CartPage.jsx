import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { MdDeleteOutline } from 'react-icons/md';

const PAYMENT_METHODS = ['COD', 'Easypaisa/JazzCash'];

export default function CartPage() {
  const navigate = useNavigate();
  const { cartItems, subtotal, tax, total, updateQuantity, removeFromCart, clearCart } = useCart();
  const [note, setNote] = useState('');
  const [payment, setPayment] = useState('COD');
  const [isRemoving, setIsRemoving] = useState(null); // Track specific item being removed

  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to empty your cart?")) {
      await clearCart();
      toast.success("Cart cleared");
    }
  };

  // Improved remove handler to prevent UI glitches
  const handleRemove = async (id) => {
    try {
      setIsRemoving(id); 
      await removeFromCart(id);
      toast.success("Item removed");
    } catch (err) {
      toast.error("Failed to remove item");
    } finally {
      setIsRemoving(null);
    }
  };

  const handleProceed = () => {
    if (cartItems.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    navigate('/order-summary', { state: { note, payment } });
  };

  return (
    <div className="app-container flex flex-col pb-20">
      <div className="relative">
        <Header title="My Cart" showBack onBack={() => navigate(-1)} />
        {cartItems.length > 0 && (
          <button
            onClick={handleClearCart}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-white hover:bg-red-400 bg-red-500 px-3 py-1 rounded-lg z-10"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 flex flex-col gap-4">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <span className="text-6xl">🛒</span>
            <p className="text-xl font-semibold text-neutral-400">Your cart is empty</p>
            <button onClick={() => navigate('/home')}
              className="btn-primary w-auto px-8">Browse Menu</button>
          </div>
        ) : (
          <>
            {/* Cart items */}
            <div className="flex flex-col gap-4">
              <AnimatePresence mode='popLayout'>
                {cartItems.map((item) => (
                  <motion.div
                    key={item.id} // Ensure this ID is unique and constant
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: isRemoving === item.id ? 0.5 : 1, scale: 1 }}
                    exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
                    className="bg-white border-2 border-neutral-200 rounded-2xl p-3 flex items-center gap-3 relative"
                  >
                    <img
                      src={item.menu_item.image_url || `https://via.placeholder.com/80x80`}
                      alt={item.menu_item.name}
                      className="w-20 h-20 rounded-full object-cover border border-neutral-200 flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-neutral-900 truncate pr-8">
                        {item.menu_item.name}
                      </p>
                      <p className="text-base font-bold text-neutral-900">Rs. {item.menu_item.price}</p>
                    </div>

                    <button
                      onClick={() => handleRemove(item.id)}
                      disabled={isRemoving === item.id}
                      className="absolute top-2 right-2 p-1 text-red-400 hover:text-red-600 transition-colors disabled:opacity-30"
                    >
                      <MdDeleteOutline size={22} />
                    </button>

                    <div className="flex flex-col items-center gap-1">
                      <p className="text-[10px] uppercase font-bold text-neutral-400">Qty</p>
                      <div className="flex items-center gap-2 border border-neutral-200 rounded-xl px-2 py-1 bg-neutral-50">
                        <button 
                          disabled={item.quantity <= 1 || isRemoving === item.id}
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="text-neutral-600 disabled:opacity-30 hover:text-primary-600 transition-colors w-5 text-center font-bold"
                        >
                          −
                        </button>
                        <span className="text-base font-semibold w-5 text-center">{item.quantity}</span>
                        <button 
                          disabled={isRemoving === item.id}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-neutral-600 hover:text-primary-600 transition-colors w-5 text-center font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Notes */}
            <div className="bg-white border-2 border-neutral-200 rounded-2xl p-4 mt-2">
              <textarea
                placeholder="Special instructions (e.g. no onions)..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="w-full text-sm text-neutral-700 placeholder:text-neutral-400 focus:outline-none resize-none"
              />
            </div>

            {/* Totals & Payment */}
            <div className="bg-white rounded-2xl p-4 border border-neutral-200 space-y-3">
              <div className="flex justify-between text-sm text-neutral-600">
                <span>Subtotal</span> <span>Rs. {subtotal}</span>
              </div>
              <div className="flex justify-between text-sm text-neutral-600">
                <span>Tax (15%)</span> <span>Rs. {tax}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-neutral-900 border-t pt-2">
                <span>Total</span> <span className="text-primary-600">Rs. {total}</span>
              </div>
            </div>

            <button onClick={handleProceed}
              className="w-full btn-primary rounded-full py-4 text-lg font-bold shadow-lg mt-2">
              Proceed to Summary
            </button>
            
            <button onClick={()=> navigate("/home")}
              className="w-full border-2 border-primary-600 text-primary-600 rounded-full py-3 font-bold mb-4">
              + Add More Items
            </button>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
}