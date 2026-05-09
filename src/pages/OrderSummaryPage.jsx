import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { orderAPI } from '../services/api';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import toast from 'react-hot-toast';

export default function OrderSummaryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, subtotal, tax, total, clearCart } = useCart();
  const { note = '', payment = 'COD' } = location.state || {};
  const [loading, setLoading] = useState(false);
  console.log("/ordersummary total price:", total);
  console.log("Items /ordersummary", cartItems);
  const handleConfirm = async () => {
    try {
      setLoading(true);
      const res = await orderAPI.placeOrder({
        // Swagger expects item_id (not menuItemId) in the array
        items: cartItems.map((i) => ({
          item_id: i.menu_item_id || i.menuItemId || i._id,
          quantity: i.quantity
        })),
        notes: note,
        // Map 'Easypaisa/JazzCash' to lowercase if your backend prefers it
        paymentMethod: payment === 'COD' ? 'cash' : payment.toLowerCase(),
      });

      // Check where the ID is located based on your Swagger/Backend
      const orderData = res.data?.data || res.data;
      const orderId = orderData._id || orderData.id;

      if (!orderId) {
        throw new Error("Order created but No ID returned from server");
      }

      console.log("Order data",orderData);
      await clearCart();
      toast.success('Order placed! 🎉');
      navigate('/order-tracking', { state: { orderId: res.data.id }, replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container flex flex-col pb-20">
      <Header title="Order Summary" showBack onBack={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto px-4 pt-4 flex flex-col gap-4">
        {/* Items */}
        {cartItems.map((item) => (
          <div key={item.menu_Item_Id}
            className="bg-white border-2 border-neutral-200 rounded-2xl p-3 flex items-center gap-3">
            <img
              src={item.menu_item.image_url || `https://via.placeholder.com/80x80?text=${encodeURIComponent(item.name)}`}
              alt={item.menu_item.name}
              className="w-20 h-20 rounded-full object-cover border border-neutral-200 flex-shrink-0"
            />
            <div className="flex-1">
              <p className="text-base font-semibold text-neutral-900">{item.menu_item.name}</p>
              <p className="text-base font-bold text-neutral-900">Rs. {item.menu_item.price}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-neutral-500">Qty</p>
              <p className="text-base font-bold">{item.quantity}</p>
            </div>
          </div>
        ))}

        {/* Order notes */}
        {note && (
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Order Notes</h3>
            <div className="bg-white border-2 border-neutral-200 rounded-2xl p-4 text-sm text-neutral-700">
              {note}
            </div>
          </div>
        )}

        {/* Totals */}
        <div className="bg-white rounded-2xl p-4 space-y-2">
          <div className="flex justify-between text-base font-medium text-neutral-800">
            <span>Sub Total:</span> <span className="font-bold">Rs. {subtotal}</span>
          </div>
          <div className="flex justify-between text-base font-medium text-neutral-800">
            <span>Tax:</span> <span className="font-bold">Rs. {tax}</span>
          </div>
          <div className="border-t border-neutral-100 pt-2 flex justify-between text-base font-bold text-neutral-900">
            <span>Total:</span> <span className="text-primary-600">Rs. {total}</span>
          </div>
        </div>

        {/* Payment + time */}
        <div className="bg-white rounded-2xl p-4 flex flex-col gap-2">
          <div className="flex justify-between text-base text-neutral-800">
            <span className="font-semibold">Payment Method:</span>
            <span className="font-bold">{payment}</span>
          </div>
          <div className="flex justify-between text-base text-neutral-800">
            <span className="font-semibold">Estimated Prep Time:</span>
            <span className="font-bold">20 min</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-2 pb-4">
          <button onClick={() => navigate(-1)}
            className="flex-1 border-2 border-neutral-400 text-neutral-700 font-semibold 
                             rounded-2xl py-4 hover:bg-neutral-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleConfirm} disabled={loading}
            className="flex-1 bg-primary-600 text-white font-semibold rounded-2xl py-4 
                             hover:bg-primary-700 disabled:opacity-60 flex items-center justify-center gap-2">
            {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            Confirm
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
