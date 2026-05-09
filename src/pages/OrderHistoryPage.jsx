import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const STATUS_COLORS = {
  placed:    'bg-blue-100 text-blue-700',
  preparing: 'bg-amber-100 text-amber-700',
  ready:     'bg-green-100 text-green-700',
  picked_up: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-700',
};

export default function OrderHistoryPage() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const res = await orderAPI.getMyOrders();
      // Handle nested data if necessary
      const data = res.data?.data || res.data || [];
      const orders = data.filter((o) => o.status != "cancelled");
      console.log(orders);
      setOrders(orders);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // Updated to handle individual items specifically
  const handleReorderItem = async (item) => {
    try {
      // Use item_id to match your backend expectations
      const targetId = item.id;
      await addToCart(targetId, item.quantity);
      toast.success(`${item.item_name} added to cart!`);
      navigate('/cart');
    } catch (err) {
      toast.error('Failed to add item to cart');
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="app-container flex flex-col pb-20">
      <Header title="Your previous orders" showBack onBack={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto px-4 pt-4 flex flex-col gap-6">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 animate-pulse space-y-3">
              <div className="h-4 bg-neutral-200 rounded w-32" />
              <div className="h-20 bg-neutral-200 rounded-xl" />
            </div>
          ))
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <span className="text-6xl">📋</span>
            <p className="text-xl font-semibold text-neutral-400">No orders yet</p>
            <button onClick={() => navigate('/home')} className="btn-primary w-auto px-8">
              Order Now
            </button>
          </div>
        ) : (
          orders.map((order, idx) => (
            <motion.div key={order._id || idx}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}>
              <p className="text-sm font-semibold text-neutral-500 mb-2">{formatDate(order.createdAt)}</p>
              <div className="bg-white border-2 border-neutral-300 rounded-2xl p-4 shadow-sm">
                
                {/* Status badge */}
                <div className="flex justify-between items-center mb-4 border-b border-neutral-50 pb-2">
                  <span className="text-sm font-medium text-neutral-500">
                    Order #{order.order_token?.toUpperCase()}
                  </span>
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full
                                    ${STATUS_COLORS[order.status] || 'bg-neutral-100 text-neutral-600'}`}>
                    {order.status?.replace('_', ' ')}
                  </span>
                </div>

                {/* Items List with Individual Reorder */}
                <div className="space-y-4">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-neutral-900">
                          {item.quantity}x {item.item_name}
                        </p>
                        <p className="text-xs font-medium text-neutral-500">
                          Rs. {item.item_price} per unit
                        </p>
                      </div>
                      <button 
                        onClick={() => handleReorderItem(item)}
                        className="bg-primary-200 text-primary-600 text-xs font-bold px-4 py-2 rounded-lg 
                                   hover:bg-primary-600 hover:text-white transition-all duration-200"
                      >
                        Reorder
                      </button>
                    </div>
                  ))}
                </div>

                {/* Total Display (Reorder All Removed) */}
                <div className="border-t border-neutral-100 mt-4 pt-3 flex justify-between items-center">
                  <span className="text-sm font-medium text-neutral-500">Total Amount</span>
                  <span className="text-lg font-black text-primary-600">Rs. {order.total_amount}</span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
      <BottomNav />
    </div>
  );
}