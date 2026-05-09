import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { orderAPI } from '../services/api';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const STATUS_STEPS = ['Placed', 'Preparing', 'Ready', 'Picked up'];
const STATUS_EMOJIS = ['📋', '👨‍🍳', '✅', '🛵'];

function statusToIndex(status) {
  const map = { placed: 0, preparing: 1, ready: 2, picked_up: 3, delivered: 3 };
  return map[status?.toLowerCase()] ?? 0;
}

export default function OrderTrackingPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const orderId   = location.state?.orderId;
  console.log("Order Id received is:",orderId);
  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) fetchOrder();
    // Poll every 15s
    const interval = setInterval(() => { if (orderId) fetchOrder(); }, 15000);
    return () => clearInterval(interval);
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const res = await orderAPI.getOrderById(orderId);
      console.log("Order data received By id from /tracking",res.data);
      setOrder(res.data);
    } catch(error) {
      console.log(error,error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await orderAPI.cancelOrder(orderId);
      toast.success('Order cancelled');
      navigate('/orders', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel order');
    }
  };

  const stepIdx = order ? statusToIndex(order.status) : 0;

  if (loading) return (
    <div className="app-container flex items-center justify-center min-h-screen">
      <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="app-container flex flex-col pb-20">
      <Header title="Your Order" showBack onBack={() => navigate('/orders')} />

      <div className="flex-1 overflow-y-auto px-4 pt-4 flex flex-col gap-4">
        {/* Order ID */}
        <div className="flex justify-between items-center bg-white rounded-2xl p-4">
          <span className="text-lg font-semibold text-neutral-900">Order ID:</span>
          <span className="text-lg font-bold text-primary-600">{order?.order_token}</span>
        </div>

        {/* Track bar */}
        <div className="bg-white rounded-2xl p-5">
          <h3 className="text-base font-semibold text-neutral-900 mb-4">Order Status</h3>
          <div className="relative flex justify-between">
            {/* Progress line */}
            <div className="absolute top-5 left-5 right-5 h-1 bg-neutral-200 rounded-full z-0">
              <motion.div
                className="h-full bg-primary-500 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${(stepIdx / (STATUS_STEPS.length - 1)) * 100}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
            {/* Steps */}
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex flex-col items-center gap-2 z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg
                                 border-2 transition-all duration-300
                                 ${i <= stepIdx
                                   ? 'bg-primary-600 border-primary-600 text-white shadow-md scale-110'
                                   : 'bg-white border-neutral-300 text-neutral-400'}`}>
                  {i <= stepIdx ? '✓' : STATUS_EMOJIS[i]}
                </div>
                <span className={`text-xs font-medium text-center leading-tight max-w-[54px]
                                   ${i <= stepIdx ? 'text-primary-600' : 'text-neutral-400'}`}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Order items */}
        {order?.items?.map((item) => (
          <div key={item.menuItemId} className="bg-white border-2 border-neutral-200 rounded-2xl p-3 flex gap-3">
            <div>
              <p className="text-base font-semibold text-neutral-900">{item.quantity}x {item.item_name}</p>
              <p className="text-base font-bold text-neutral-700">Rs. {item.item_price}</p>
            </div>
          </div>
        ))}

        {/* Summary */}
        {order && (
          <div className="bg-white rounded-2xl p-4 space-y-2">
            <div className="border-t pt-2 flex justify-between text-base font-bold text-neutral-900">
              <span>Total:</span> <span className="text-primary-600">Rs. {order.total_amount}</span>
            </div>
            <div className="flex justify-between text-base text-neutral-800 pt-1">
              <span className="font-semibold">Payment Method:</span>
              <span className="font-bold">{order.paymentMethod || 'COD'}</span>
            </div>
            <div className="flex justify-between text-base text-neutral-800">
              <span className="font-semibold">Estimated Prep Time:</span>
              <span className="font-bold">20 min</span>
            </div>
            <div className="flex justify-between text-base text-neutral-800">
              <span className="font-semibold">Remaining Time:</span>
              <span className="font-bold">10 min</span>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pb-4">
          {order?.status === 'placed' && (
            <button onClick={handleCancel}
                    className="flex-1 border-2 border-neutral-400 text-neutral-700 font-semibold 
                               rounded-2xl py-4 hover:bg-neutral-50">
              Cancel
            </button>
          )}
          <button onClick={() => navigate('/orders')}
                  className="flex-1 bg-primary-600 text-white font-semibold rounded-2xl py-4 
                             hover:bg-primary-700">
            Continue
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
