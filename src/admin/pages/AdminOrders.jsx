import { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { adminOrderAPI } from '../../services/api';
import toast from 'react-hot-toast';
 
const ALL_STATUSES = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
const BADGE = {
  pending:   'bg-blue-100 text-blue-700',
  preparing: 'bg-amber-100 text-amber-700',
  ready:     'bg-green-100 text-green-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};
const NEXT = { pending: 'preparing', preparing: 'ready', ready: 'completed' };
const PAY_LABEL = { cash: 'COD', easypaisa: 'Easypaisa', jazzcash: 'JazzCash' };
 
export default function AdminOrders() {
  const [orders,   setOrders]   = useState([]);
  const [filter,   setFilter]   = useState('all');
  const [loading,  setLoading]  = useState(true);
  const [updating, setUpdating] = useState(null);
 
  useEffect(() => {
    fetch();
    const t = setInterval(fetch, 20000);
    return () => clearInterval(t);
  }, []);
 
  const fetch = async () => {
    try {
      const res = await adminOrderAPI.getAllOrders();
      setOrders(res.data || []);
    } catch { toast.error('Failed to load orders'); }
    finally  { setLoading(false); }
  };
 
  const updateStatus = async (id, status) => {
    try {
      setUpdating(id);
      await adminOrderAPI.updateStatus(id, status);
      setOrders(prev => prev.map(o => (o.id === id || o._id === id) ? { ...o, status } : o));
      toast.success(`Marked as ${status}`);
    } catch (e) { toast.error(e.response?.data?.message || 'Update failed'); }
    finally    { setUpdating(null); }
  };
 
  const visible = filter === 'all' ? orders : orders.filter(o => o.status === filter);
 
  return (
    <AdminLayout title="Orders">
 
      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {['all', ...ALL_STATUSES].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors border
                         ${filter === s
                           ? 'bg-primary-600 text-white border-primary-600'
                           : 'bg-white text-gray-600 border-gray-200 hover:border-primary-400 hover:text-primary-600'}`}>
            {s === 'all' ? 'All' : s}
            <span className="ml-1 opacity-60 text-xs">
              ({s === 'all' ? orders.length : orders.filter(o => o.status === s).length})
            </span>
          </button>
        ))}
        <button onClick={fetch}
          className="ml-auto px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-gray-200
                     text-gray-600 hover:border-primary-400 hover:text-primary-600 transition-colors">
          ↻ Refresh
        </button>
      </div>
 
      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Order ID','Customer','Items','Total','Payment','Notes','Time','Status','Action'].map(h => (
                  <th key={h} className="table-th whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(7).fill(0).map((_,i) => (
                    <tr key={i} className="border-b border-gray-50">
                      {Array(9).fill(0).map((__,j) => (
                        <td key={j} className="table-td">
                          <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : visible.length === 0
                  ? <tr><td colSpan={9} className="text-center py-14 text-gray-400 text-sm">No orders found</td></tr>
                  : visible.map(o => {
                      const id = o.id || o._id;
                      return (
                        <tr key={id} className="border-b border-gray-50 hover:bg-orange-50 transition-colors">
                          <td className="table-td font-semibold">
                            #{String(id).slice(-6).toUpperCase()}
                          </td>
                          <td className="table-td">{o.user?.name || 'Customer'}</td>
                          <td className="table-td max-w-[140px]">
                            <div className="flex flex-col gap-0.5">
                              {o.items?.slice(0,2).map((it,i) => (
                                <span key={i} className="text-xs truncate">{it.quantity}× {it.name}</span>
                              ))}
                              {(o.items?.length || 0) > 2 && (
                                <span className="text-xs text-gray-400">+{o.items.length-2} more</span>
                              )}
                            </div>
                          </td>
                          <td className="table-td font-semibold text-gray-800 whitespace-nowrap">
                            Rs. {o.total}
                          </td>
                          <td className="table-td capitalize whitespace-nowrap">
                            {PAY_LABEL[o.payment_method] || o.payment_method}
                          </td>
                          <td className="table-td text-xs text-gray-500 max-w-[100px] truncate">
                            {o.notes || '—'}
                          </td>
                          <td className="table-td whitespace-nowrap text-xs text-gray-500">
                            {o.created_at ? new Date(o.created_at).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }) : '—'}
                          </td>
                          <td className="table-td">
                            <span className={`badge ${BADGE[o.status] || 'bg-gray-100 text-gray-600'}`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="table-td">
                            <div className="flex flex-col gap-1.5">
                              {NEXT[o.status] && (
                                <button onClick={() => updateStatus(id, NEXT[o.status])}
                                  disabled={updating === id}
                                  className="bg-primary-600 text-white text-xs font-semibold px-3 py-1.5
                                             rounded-lg hover:bg-primary-700 disabled:opacity-50 whitespace-nowrap
                                             flex items-center gap-1">
                                  {updating === id && (
                                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                                  )}
                                  → {NEXT[o.status]}
                                </button>
                              )}
                              {o.status === 'pending' && (
                                <button onClick={() => updateStatus(id, 'cancelled')}
                                  disabled={updating === id}
                                  className="border border-red-300 text-red-600 text-xs font-semibold
                                             px-3 py-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50">
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
              }
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}