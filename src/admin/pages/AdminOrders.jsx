import { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { adminOrderAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const ALL_STATUSES = ['received', 'preparing', 'ready', 'completed', 'cancelled'];
const BADGE = {
  received:   'bg-blue-100 text-blue-700',
  preparing: 'bg-amber-100 text-amber-700',
  ready:     'bg-green-100 text-green-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};
const NEXT = { received: 'preparing', preparing: 'ready', ready: 'completed' };
const PAY_LABEL = { cash: 'COD', easypaisa: 'Easypaisa', jazzcash: 'JazzCash' };

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetch();
    const t = setInterval(fetch, 20000);
    return () => clearInterval(t);
  }, []);

  const fetch = async () => {
    try {
      const res = await adminOrderAPI.getAllOrders();
      // Ensure data extraction matches your API structure
      setOrders(res.data?.data || res.data || []);
    } catch { 
      toast.error('Failed to load orders'); 
    } finally { 
      setLoading(false); 
    }
  };

  const updateStatus = async (id, status) => {
    try {
      setUpdating(id);
      await adminOrderAPI.updateStatus(id, status);
      setOrders(prev => prev.map(o => (o.id === id || o._id === id) ? { ...o, status } : o));
      toast.success(`Order is now ${status}`);
    } catch (e) { 
      toast.error(e.response?.data?.message || 'Update failed'); 
    } finally { 
      setUpdating(null); 
    }
  };

  const visible = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <AdminLayout title="Orders">
      {/* 1. Mobile-friendly horizontal filter scroll */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {['all', ...ALL_STATUSES].map(s => (
          <button 
            key={s} 
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap capitalize transition-all border
              ${filter === s
                ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                : 'bg-white text-gray-500 border-gray-100 hover:border-primary-200'}`}
          >
            {s} ({s === 'all' ? orders.length : orders.filter(o => o.status === s).length})
          </button>
        ))}
      </div>

      {/* 2. Responsive Card Grid (Replaces Table) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 h-48 animate-pulse shadow-sm border border-gray-50" />
          ))
        ) : (
          <AnimatePresence mode="popLayout">
            {visible.map((o) => {
              const id = o.id || o._id;
              const time = o.created_at ? new Date(o.created_at).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }) : '--:--';
              
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={id}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden"
                >
                  {/* Status Indicator Bar */}
                  <div className={`absolute top-0 left-0 w-full h-1 ${BADGE[o.status]?.split(' ')[0]}`} />
                  
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">#{String(id).slice(-6).toUpperCase()}</h3>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{time} • {PAY_LABEL[o.payment_method] || 'Paid'}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${BADGE[o.status]}`}>
                      {o.status}
                    </span>
                  </div>

                  {/* Items List */}
                  <div className="space-y-2 mb-4 bg-gray-50 rounded-xl p-3">
                    {o.items?.map((it, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-600 font-medium truncate max-w-[150px]">
                          {it.quantity}x {it.item_name || it.name}
                        </span>
                        <span className="text-gray-400 font-mono text-xs">Rs.{it.price || ''}</span>
                      </div>
                    ))}
                    {o.notes && (
                      <div className="mt-2 pt-2 border-t border-gray-200 border-dashed">
                        <p className="text-[11px] text-primary-600 italic">“{o.notes}”</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-2">
                    <div className="text-xl font-black text-gray-900">
                      <span className=" font-normal text-gray-400 mr-1 text-base">Rs.</span>
                      {o.total_amount || o.total}
                    </div>
                    
                    <div className="flex gap-2">
                      {o.status === 'received' && (
                        <button 
                          onClick={() => updateStatus(id, 'cancelled')}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                      
                      {NEXT[o.status] && (
                        <button 
                          onClick={() => updateStatus(id, NEXT[o.status])}
                          disabled={updating === id}
                          className="bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary-100 disabled:opacity-50"
                        >
                          {updating === id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            `Mark ${NEXT[o.status]}`
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {!loading && visible.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <p className="text-lg">No orders found here</p>
          <button onClick={fetch} className="mt-2 text-primary-600 font-bold underline">Refresh list</button>
        </div>
      )}

      {/* Floating Refresh Button for Mobile */}
      <button 
        onClick={fetch}
        className="fixed bottom-6 right-6 w-14 h-14 bg-white shadow-2xl rounded-full border border-gray-100 flex items-center justify-center text-primary-600 active:scale-95 transition-all md:hidden z-50"
      >
        ↻
      </button>
    </AdminLayout>
  );
}