import { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { notifAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { MdNotificationsNone } from 'react-icons/md';

export default function AdminNotifications() {
  const [notifs,  setNotifs]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const r = await notifAPI.getAll();
      setNotifs(r.data || []);
    } catch { toast.error('Failed to load notifications'); }
    finally  { setLoading(false); }
  };

  const markAll = async () => {
    try {
      await notifAPI.markRead();
      setNotifs(p => p.map(n => ({ ...n, is_read: true })));
      toast.success('All marked as read');
    } catch { toast.error('Failed'); }
  };

  const unread = notifs.filter(n => !n.is_read).length;

  return (
    <AdminLayout title="Notifications">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-500">
          {unread > 0
            ? <span className="font-semibold text-primary-600">{unread} unread</span>
            : 'All caught up!'}
        </p>
        {unread > 0 && (
          <button onClick={markAll}
                  className="text-sm font-semibold text-primary-600 hover:underline">
            Mark all as read
          </button>
        )}
      </div>

      <div className="card divide-y divide-gray-50 overflow-hidden">
        {loading
          ? Array(6).fill(0).map((_,i) => (
              <div key={i} className="flex items-start gap-3 p-5 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))
          : notifs.length === 0
            ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
                <MdNotificationsNone size={48} />
                <p className="font-medium">No notifications</p>
              </div>
            )
            : notifs.map((n, i) => (
                <div key={i}
                     className={`flex items-start gap-4 p-5 transition-colors
                                  ${n.is_read ? 'bg-white' : 'bg-orange-50'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0
                                    ${n.is_read ? 'bg-gray-100' : 'bg-primary-100'}`}>
                    🔔
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${n.is_read ? 'text-gray-700' : 'text-gray-900 font-medium'}`}>
                      {n.message || n.title || 'New notification'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {n.created_at ? new Date(n.created_at).toLocaleString('en-PK') : ''}
                    </p>
                  </div>
                  {!n.is_read && (
                    <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-1.5" />
                  )}
                </div>
              ))
        }
      </div>
    </AdminLayout>
  );
}