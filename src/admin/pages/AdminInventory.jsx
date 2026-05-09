import { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { menuAPI, inventoryAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { MdWarning, MdClose } from 'react-icons/md';

export default function AdminInventory() {
  const [items,    setItems]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [adjModal, setAdjModal] = useState(null); // item
  const [logModal, setLogModal] = useState(null); // item
  const [qty,      setQty]      = useState('');
  const [reason,   setReason]   = useState('');
  const [saving,   setSaving]   = useState(false);
  const [logs,     setLogs]     = useState([]);
  const [logLoad,  setLogLoad]  = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const r = await menuAPI.getItems({ limit: 200 });
      setItems(r.data?.items || r.data || []);
    } catch { toast.error('Failed to load inventory'); }
    finally  { setLoading(false); }
  };

  const handleAdjust = async (e) => {
    e.preventDefault();
    if (!qty) { toast.error('Enter quantity'); return; }
    const id = adjModal.id || adjModal._id;
    try {
      setSaving(true);
      await inventoryAPI.adjust(id, Number(qty), reason);
      toast.success('Stock adjusted');
      setAdjModal(null); setQty(''); setReason('');
      load();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally    { setSaving(false); }
  };

  const openLogs = async (item) => {
    setLogModal(item); setLogs([]); setLogLoad(true);
    try {
      const r = await inventoryAPI.getLogs(item.id || item._id);
      setLogs(r.data || []);
    } catch { toast.error('Failed to load logs'); }
    finally  { setLogLoad(false); }
  };

  const lowItems = items.filter(i => typeof (i.stock ?? i.quantity) === 'number' && (i.stock ?? i.quantity) <= 5);

  return (
    <AdminLayout title="Inventory">

      {/* Low stock alert */}
      {lowItems.length > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5">
          <MdWarning size={22} className="text-amber-500 flex-shrink-0" />
          <p className="text-sm font-medium text-amber-700">
            <strong>{lowItems.length}</strong> item{lowItems.length > 1 ? 's are' : ' is'} running low on stock.
          </p>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Item','Category','Price','Stock','Availability','Actions'].map(h => (
                  <th key={h} className="table-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(8).fill(0).map((_,i) => (
                    <tr key={i} className="border-b border-gray-50">
                      {Array(6).fill(0).map((__,j) => (
                        <td key={j} className="table-td">
                          <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : items.map(item => {
                    const id    = item.id || item._id;
                    const stock = item.stock ?? item.quantity;
                    const low   = typeof stock === 'number' && stock <= 5;
                    return (
                      <tr key={id}
                          className={`border-b border-gray-50 transition-colors
                                       ${low ? 'bg-amber-50 hover:bg-amber-100' : 'hover:bg-orange-50'}`}>
                        <td className="table-td">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.image_url || `https://placehold.co/40x40?text=${encodeURIComponent(item.name[0])}`}
                              alt={item.name}
                              className="w-10 h-10 rounded-lg object-cover border border-gray-200 flex-shrink-0" />
                            <span className="font-medium text-gray-900 max-w-[130px] truncate">{item.name}</span>
                          </div>
                        </td>
                        <td className="table-td text-xs text-gray-500">{item.category?.name || '—'}</td>
                        <td className="table-td font-semibold text-gray-800 whitespace-nowrap">Rs. {item.price}</td>
                        <td className="table-td">
                          <span className={`font-bold text-sm ${low ? 'text-red-600' : 'text-gray-800'}`}>
                            {stock !== undefined ? stock : '—'} {low && '⚠️'}
                          </span>
                        </td>
                        <td className="table-td">
                          <span className={`badge ${item.is_available !== false
                            ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                            {item.is_available !== false ? 'Available' : 'Unavailable'}
                          </span>
                        </td>
                        <td className="table-td">
                          <div className="flex gap-2">
                            <button onClick={() => { setAdjModal(item); setQty(''); setReason(''); }}
                                    className="btn-primary text-xs px-3 py-1.5 rounded-lg">
                              Adjust
                            </button>
                            <button onClick={() => openLogs(item)}
                                    className="border border-gray-300 text-gray-600 text-xs font-semibold
                                               px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                              Logs
                            </button>
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

      {/* Adjust Modal */}
      {adjModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Adjust – {adjModal.name}</h2>
              <button onClick={() => setAdjModal(null)}><MdClose size={22} className="text-gray-400 hover:text-gray-700" /></button>
            </div>
            <form onSubmit={handleAdjust} className="px-6 py-5 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Quantity (+ to add, − to reduce)
                </label>
                <input type="number" placeholder="e.g. 50 or -10" value={qty}
                       onChange={e => setQty(e.target.value)} required className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Reason (optional)</label>
                <input type="text" placeholder="e.g. Restocked from supplier" value={reason}
                       onChange={e => setReason(e.target.value)} className="input-field" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setAdjModal(null)}
                        className="flex-1 border-2 border-gray-300 text-gray-700 font-semibold py-3
                                   rounded-xl hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving}
                        className="flex-1 btn-primary justify-center py-3 rounded-xl">
                  {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logs Modal */}
      {logModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Logs – {logModal.name}</h2>
              <button onClick={() => setLogModal(null)}><MdClose size={22} className="text-gray-400 hover:text-gray-700" /></button>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-4">
              {logLoad
                ? <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                : logs.length === 0
                  ? <p className="text-center text-gray-400 py-10 text-sm">No logs found</p>
                  : logs.map((log, i) => (
                      <div key={i} className="flex justify-between items-start py-3 border-b border-gray-50 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{log.reason || 'Manual adjustment'}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {log.created_at ? new Date(log.created_at).toLocaleString('en-PK') : '—'}
                          </p>
                        </div>
                        <span className={`text-sm font-bold ml-4 flex-shrink-0
                                          ${(log.quantity || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {(log.quantity || 0) >= 0 ? '+' : ''}{log.quantity}
                        </span>
                      </div>
                    ))
              }
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}