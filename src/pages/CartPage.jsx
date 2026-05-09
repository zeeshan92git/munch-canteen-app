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
  console.log("Items on /cart",cartItems);
  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to empty your cart?")) {
      await clearCart();
      toast.success("Cart cleared");
    }
  };

  // const handleRemoveFromCart = async (itemId) => {
  //   console.log("item to remove has id:",itemId);
  //   await removeFromCart(itemId);
  //   toast.success("Item removed");
  // };



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
            className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-white hover:bg-red-400 bg-red-500 px-3 py-1 rounded-lg"
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
            <AnimatePresence>
              {cartItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, opacity: 0 }}
                  className="bg-white border-2 border-neutral-200 rounded-2xl p-3 flex items-center gap-3 relative group"
                >
                  <img
                    src={item.menu_item.image_url || `https://via.placeholder.com/80x80`}
                    alt={item.menu_item.name}
                    className="w-20 h-20 rounded-full object-cover border border-neutral-200 flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-neutral-900 truncate pr-6">
                      {item.menu_item.name}
                    </p>
                    <p className="text-base font-bold text-neutral-900">Rs. {item.menu_item.price}</p>
                  </div>

                  {/* Individual Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="absolute top-2 right-2 p-1 text-red-400 hover:text-red-500 transition-colors"
                    title="Remove item"
                  >
                    <MdDeleteOutline size={20} />
                  </button>

                  <div className="flex flex-col items-start gap-2">
                    <p className="text-sm font-medium text-neutral-500">Qty</p>
                    <div className="flex items-center gap-2 border border-neutral-200 rounded-xl px-2 py-1 bg-neutral-50">
                      <button disabled={item.quantity === 1} onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="text-neutral-600 hover:text-primary-600 transition-colors w-5 text-center font-bold">
                        −
                      </button>
                      <span className="text-base font-semibold w-5 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="text-neutral-600 hover:text-primary-600 transition-colors w-5 text-center font-bold">
                        +
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Notes */}
            <div className="bg-white border-2 border-neutral-300 rounded-2xl p-4">
              <textarea
                placeholder="Add your order notes here..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="w-full text-sm text-neutral-700 placeholder:text-neutral-500 focus:outline-none resize-none"
              />
            </div>

            {/* Totals */}
            <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-sm space-y-2">
              <div className="flex justify-between text-base font-medium text-neutral-800">
                <span>Sub Total:</span> <span className="font-bold">Rs. {subtotal}</span>
              </div>
              <div className="flex justify-between text-base font-medium text-neutral-800">
                <span>Tax (15%):</span> <span className="font-bold">Rs. {tax}</span>
              </div>
              <div className="border-t border-neutral-100 pt-2 flex justify-between text-base font-bold text-neutral-900">
                <span>Total:</span> <span className="text-primary-600">Rs. {total}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl p-4 border border-neutral-100 shadow-sm">
              <p className="text-base font-semibold text-neutral-900 mb-3">Payment Method:</p>
              <div className="flex flex-col gap-3">
                {PAYMENT_METHODS.map((m) => (
                  <div key={m} className="flex flex-col">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div onClick={() => setPayment(m)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                        ${payment === m ? 'border-primary-600' : 'border-neutral-400'}`}>
                        {payment === m && <div className="w-2.5 h-2.5 rounded-full bg-primary-600" />}
                      </div>
                      <span className={`text-base ${payment === m ? 'font-bold text-neutral-900' : 'text-neutral-600'}`}>{m}</span>
                    </label>

                    {/* Dummy Account Details for Easypaisa/JazzCash */}
                    {m === "Easypaisa/JazzCash" && payment === "Easypaisa/JazzCash" && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="mt-3 ml-8 p-3 bg-neutral-900 text-white rounded-xl text-xs font-mono relative overflow-hidden"
                      >
                        <div className="relative z-10">
                          <p className="text-neutral-400 uppercase text-[10px] tracking-widest mb-1">Account Transfer</p>
                          <p className="text-lg font-bold">0312-4567890</p>
                          <p className="text-neutral-300">Title: MUNCH PVT LTD</p>
                        </div>
                        <div className="absolute right-[-10px] bottom-[-10px] opacity-20 text-4xl">💰</div>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Prep time */}
            <div className="flex justify-between text-sm text-neutral-500 px-1 italic">
              <span>Estimated Prep Time:</span>
              <span className="font-bold">~ 20 min</span>
            </div>

            {/* Proceed */}
            <button onClick={handleProceed}
              className="w-full btn-primary rounded-full py-4 text-lg font-bold shadow-lg shadow-primary-200 mb-4">
              Proceed to Summary
            </button>
            {/* Access menu items */}
            <button onClick={()=> navigate("/home")}
              className="w-full btn-primary rounded-full py-4 text-lg font-bold shadow-lg shadow-primary-200 mb-4">
              Want more ? Click me
            </button>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
}