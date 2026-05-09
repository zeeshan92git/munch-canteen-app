import { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { notifAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { MdNotificationsNone, MdDoneAll, MdFilterList } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminNotifications() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false); // Controls the API param

  // Reload whenever the filter changes
  useEffect(() => { load(); }, [unreadOnly]);

  const load = async () => {
    try {
      setLoading(true);
      const r = await notifAPI.getAll(unreadOnly);
      setNotifs(r.data?.data || r.data || []);
    } catch { 
      toast.error('Failed to load notifications'); 
    } finally { 
      setLoading(false); 
    }
  };

  const markAll = async () => {
    try {
      await notifAPI.markRead();
      // Optimistic UI update: mark all current items as read locally
      setNotifs(p => p.map(n => ({ ...n, is_read: true })));
      toast.success('All marked as read');
    } catch { 
      toast.error('Failed to update'); 
    }
  };

  const unreadCount = notifs.filter(n => !n.is_read).length;

  return (
    <AdminLayout title="Notifications">
      {/* Header Actions - Optimized for Mobile */}
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setUnreadOnly(!unreadOnly)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border
              ${unreadOnly 
                ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-100' 
                : 'bg-white border-gray-200 text-gray-600'}`}
          >
            <MdFilterList size={18} />
            {unreadOnly ? 'SHOWING UNREAD' : 'SHOWING ALL'}
          </button>
        </div>

        {unreadCount > 0 && (
          <button 
            onClick={markAll}
            className="flex items-center justify-center gap-2 text-sm font-black text-primary-600 bg-primary-50 py-3 px-6 rounded-2xl sm:bg-transparent sm:py-0 sm:px-0"
          >
            <MdDoneAll size={20} />
            MARK ALL AS READ
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-5 animate-pulse flex gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))
        ) : notifs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <MdNotificationsNone size={40} className="text-gray-300" />
            </div>
            <p className="font-bold">No notifications found</p>
            <p className="text-sm">You're all caught up!</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {notifs.map((n) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={n.id || n._id}
                className={`group relative flex items-start gap-4 p-5 rounded-[2rem] border transition-all
                  ${n.is_read 
                    ? 'bg-white border-gray-100 opacity-80' 
                    : 'bg-white border-primary-100 shadow-md shadow-primary-50/50'}`}
              >
                {/* Status Dot */}
                {!n.is_read && (
                  <div className="absolute top-6 left-2 w-2 h-2 rounded-full bg-primary-500 shadow-[0_0_10px_rgba(232,90,42,0.5)]" />
                )}

                {/* Icon */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0
                  ${n.is_read ? 'bg-gray-50 text-gray-400' : 'bg-primary-50 text-primary-600'}`}>
                  {n.type === 'order' ? '🍔' : '🔔'}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className={`text-[15px] leading-tight pr-4 ${n.is_read ? 'text-gray-600' : 'text-gray-900 font-black'}`}>
                      {n.message || n.title}
                    </p>
                  </div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">
                    {n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }) : ''}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </AdminLayout>
  );
}