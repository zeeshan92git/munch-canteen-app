import { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { inventoryAPI, menuAPI } from '../../services/api'; 
import toast from 'react-hot-toast';
import { MdHistory, MdExposure, MdClose, MdInventory2 } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeItem, setActiveItem] = useState(null);
  const [modalType, setModalType] = useState(null); 
  
  // States matching Swagger keys
  const [delta, setDelta] = useState(''); // "delta" in Swagger
  const [reason, setReason] = useState(''); // "reason" in Swagger
  
  const [logs, setLogs] = useState([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const r = await menuAPI.getItems(); 
      setItems(r.data?.data || r.data || []);
    } catch {
      toast.error('Failed to fetch inventory list');
    } finally {
      setLoading(false);
    }
  };

  const handleAdjust = async (e) => {
    e.preventDefault();
    if (!delta || !reason) return toast.error('Please fill all fields');

    try {
      setProcessing(true);
      // Passing delta and reason to match the updated API service
      await inventoryAPI.adjustStock(activeItem.id, delta, reason);
      
      toast.success('Stock adjusted successfully');
      closeModals();
      loadItems(); 
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setProcessing(false);
    }
  };

  const viewLogs = async (item) => {
    setActiveItem(item);
    setModalType('logs');
    setProcessing(true);
    try {
      const r = await inventoryAPI.getLogs(item.id);
      // Your JSON is a direct array, so we handle both wraps
      setLogs(Array.isArray(r.data) ? r.data : r.data?.data || []);
    } catch {
      toast.error('Failed to load history');
    } finally {
      setProcessing(false);
    }
  };

  const closeModals = () => {
    setActiveItem(null);
    setModalType(null);
    setDelta('');
    setReason('');
    setLogs([]);
  };

  return (
    <AdminLayout title="Inventory Management">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-20 text-center font-bold text-gray-400">Loading...</div>
        ) : items.map(item => (
          <div key={item.id} className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-bold text-gray-900">{item.name}</h3>
                <p className="text-[10px] text-primary-500 font-black uppercase">{item.category?.name || 'Menu Item'}</p>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-bold text-gray-400 uppercase block">In Stock</span>
                <span className="text-xl font-black text-gray-800">{item.stock_quantity}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => { setActiveItem(item); setModalType('adjust'); }}
                className="flex-1 bg-gray-900 text-white text-xs font-black py-3 rounded-2xl flex items-center justify-center gap-2"
              >
                <MdExposure size={18} /> ADJUST
              </button>
              <button 
                onClick={() => viewLogs(item)}
                className="px-4 bg-gray-50 text-gray-400 rounded-2xl hover:text-primary-600 transition-colors"
              >
                <MdHistory size={22} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Adjust Stock Modal */}
      <AnimatePresence>
        {modalType === 'adjust' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModals} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
              <h2 className="text-xl font-black mb-1">Adjust Stock</h2>
              <p className="text-sm text-gray-400 mb-6">Updating: {activeItem?.name}</p>

              <form onSubmit={handleAdjust} className="space-y-4">
                <div>
                   <label className="text-[10px] font-black text-gray-400 ml-2 uppercase">Amount (Delta)</label>
                   <input 
                    type="number" placeholder="e.g. +10 or -5" 
                    value={delta} onChange={e => setDelta(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-primary-500 mt-1"
                  />
                </div>
                <div>
                   <label className="text-[10px] font-black text-gray-400 ml-2 uppercase">Reason</label>
                   <input 
                    type="text" placeholder="e.g. Manual Restock" 
                    value={reason} onChange={e => setReason(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-primary-500 mt-1"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeModals} className="flex-1 py-4 font-bold text-gray-400">Cancel</button>
                  <button disabled={processing} className="flex-[2] bg-primary-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-primary-200">
                    {processing ? 'UPDATING...' : 'CONFIRM'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Logs Modal (Updated to match your JSON structure) */}
      <AnimatePresence>
        {modalType === 'logs' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModals} className="absolute inset-0 bg-black/60" />
            <motion.div initial={{ y: 20 }} animate={{ y: 0 }} exit={{ y: 20 }} className="relative bg-white w-full max-w-lg rounded-[2.5rem] flex flex-col max-h-[80vh]">
              <div className="p-8 flex justify-between items-center border-b border-gray-50">
                <div>
                  <h2 className="text-xl font-black">Stock History</h2>
                  <p className="text-sm text-gray-400">{activeItem?.name}</p>
                </div>
                <button onClick={closeModals} className="p-2 bg-gray-100 rounded-full text-gray-500"><MdClose /></button>
              </div>
              <div className="overflow-y-auto p-8 space-y-3">
                {processing ? (
                  <div className="text-center py-10 font-bold text-gray-300">Loading history...</div>
                ) : logs.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">No activity logs yet.</div>
                ) : logs.map((log) => (
                  <div key={log.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex-1 pr-4">
                      <p className="text-sm font-bold text-gray-800">{log.reason}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">
                        {new Date(log.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className={`text-sm font-black px-3 py-1 rounded-xl flex-shrink-0 ${log.delta > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {log.delta > 0 ? '+' : ''}{log.delta}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}