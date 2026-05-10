import { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { menuAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { MdEdit, MdDelete, MdAdd, MdClose, MdSearch, MdFilterList } from 'react-icons/md';
import { FaStar } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const EMPTY = { name: '', description: '', price: '', category_id: '', image_url: '' };

export default function AdminMenu() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | item obj
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [toggling, setToggling] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ir, cr] = await Promise.all([
        menuAPI.getItems({ limit: 200 }),
        menuAPI.getCategories(),
      ]);
      // Standardizing data access based on common API wraps
      setItems(ir.data?.data || ir.data?.items || ir.data || []);
      setCategories(cr.data?.data || cr.data || []);
    } catch { toast.error('Failed to load menu'); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setForm(EMPTY); setModal('add'); };
  const openEdit = (item) => {
    setForm({
      name: item.name || '',
      description: item.description || '',
      price: String(item.price || ''),
      category_id: item.category_id || '',
      image_url: item.image_url || '',
    });
    setModal(item);
  };
  
  const closeModal = () => { setModal(null); setForm(EMPTY); };
  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price) return toast.error('Name and price required');
    
    try {
      setSaving(true);
      if (modal === 'add') {
        const r = await menuAPI.createItem(form);
        const newItem = r.data?.data || r.data;
        setItems(p => [newItem, ...p]);
        toast.success('Item created!');
      } else {
        const id = modal.id || modal._id;
        const r = await menuAPI.updateItem(id, form);
        const updatedItem = r.data?.data || r.data;
        setItems(p => p.map(i => (i.id || i._id) === id ? updatedItem : i));
        toast.success('Item updated!');
      }
      closeModal();
    } catch (err) { 
      toast.error(err.response?.data?.message || 'Save failed'); 
    } finally { setSaving(false); }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    const id = item.id || item._id;
    try {
      setDeleting(id);
      await menuAPI.deleteItem(id);
      setItems(p => p.filter(i => (i.id || i._id) !== id));
      toast.success('Deleted');
    } catch { toast.error('Delete failed'); }
    finally { setDeleting(null); }
  };

  const handleToggle = async (item) => {
    const id = item.id || item._id;
    const currentStatus = item.is_available !== false;
    try {
      setToggling(id);
      // Logic: If available is true, we send false to API
      await menuAPI.toggleAvailability(id, !currentStatus);
      setItems(p => p.map(i => (i.id || i._id) === id ? { ...i, is_available: !currentStatus } : i));
      toast.success(`${item.name} is now ${!currentStatus ? 'Available' : 'Unavailable'}`);
    } catch { toast.error('Toggle failed'); }
    finally { setToggling(null); }
  };

  const visible = items.filter(i => {
    const ms = !search || i.name.toLowerCase().includes(search.toLowerCase());
    const mc = !catFilter || String(i.category_id) === String(catFilter);
    return ms && mc;
  });

  const getCatName = id => categories.find(c => String(c.id) === String(id))?.name || 'Uncategorized';

  return (
    <AdminLayout title="Menu">
      
      {/* 1. Mobile-First Search & Filter Row */}
      <div className="sticky top-0 z-20 bg-gray-50/95 backdrop-blur-sm pb-4 pt-1">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search dishes..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-primary-500 transition-all outline-none" 
            />
          </div>
          <div className="relative">
            <select 
              value={catFilter} 
              onChange={e => setCatFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <MdFilterList className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
          </div>
        </div>
      </div>

      {/* 2. Responsive Grid: 1 column on mobile, more on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-24">
        {loading ? (
          Array(6).fill(0).map((_,i) => (
            <div key={i} className="bg-white rounded-3xl p-4 h-32 animate-pulse flex gap-4">
              <div className="w-24 h-24 bg-gray-100 rounded-2xl" />
              <div className="flex-1 space-y-2 py-2">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))
        ) : visible.map(item => {
          const id = item.id || item._id;
          const isAvail = item.is_available !== false;
          
          return (
            <motion.div 
              layout
              key={id} 
              className={`bg-white rounded-3xl p-3 shadow-sm border transition-all flex gap-3 relative
                ${!isAvail ? 'opacity-75 grayscale-[0.5]' : 'border-gray-100'}`}
            >
              {/* Item Image */}
              <div className="relative w-24 h-24 flex-shrink-0">
                <img
                  src={item.image_url || `https://placehold.co/200x200?text=Food`}
                  alt={item.name}
                  className="w-full h-full object-cover rounded-2xl"
                />
                <button 
                  onClick={() => handleToggle(item)}
                  disabled={toggling === id}
                  className={`absolute -top-1 -left-1 w-6 h-6 rounded-full border-2 border-white shadow-sm flex items-center justify-center
                    ${isAvail ? 'bg-green-500' : 'bg-red-500'}`}
                >
                  {toggling === id ? <div className="w-2 h-2 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                </button>
              </div>

              {/* Item Details */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900 truncate pr-2">{item.name}</h3>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <FaStar className="text-amber-400" size={12} />
                      <span className="text-xs font-bold text-gray-500">{item.rating || 'New'}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400 line-clamp-1 mb-1">{getCatName(item.category_id)}</p>
                  <p className="text-lg font-black text-primary-600">
                    <span className="text-xs font-normal mr-0.5">Rs.</span>{item.price}
                  </p>
                </div>

                <div className="flex gap-2 mt-2">
                  <button onClick={() => openEdit(item)} className="p-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-primary-50 hover:text-primary-600 transition-colors">
                    <MdEdit size={18} />
                  </button>
                  <button onClick={() => handleDelete(item)} disabled={deleting === id} className="p-2 bg-gray-50 text-red-400 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors">
                    <MdDelete size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 3. Floating Action Button (FAB) for Mobile */}
      <button 
        onClick={openAdd}
        className="fixed bottom-6 right-6 w-16 h-16 bg-primary-600 text-white rounded-full shadow-2xl shadow-primary-300 flex items-center justify-center active:scale-90 transition-transform z-30"
      >
        <MdAdd size={32} />
      </button>

      {/* 4. Bottom Sheet style Modal for Mobile */}
      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeModal} className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" 
            />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative bg-white w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black text-gray-900">{modal === 'add' ? 'New Item' : 'Update Item'}</h2>
                  <button onClick={closeModal} className="p-2 bg-gray-100 rounded-full text-gray-500"><MdClose size={20}/></button>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-xs font-bold text-gray-400 uppercase ml-1">Name</label>
                      <input type="text" value={form.name} onChange={upd('name')} className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-primary-500 mt-1" required />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase ml-1">Price (Rs)</label>
                      <input type="number" value={form.price} onChange={upd('price')} className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-primary-500 mt-1" required />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase ml-1">Category</label>
                      <select value={form.category_id} onChange={upd('category_id')} className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-primary-500 mt-1">
                        <option value="">Select</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Image URL</label>
                    <input type="url" value={form.image_url} onChange={upd('image_url')} placeholder="https://..." className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-primary-500 mt-1" />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Description</label>
                    <textarea rows={2} value={form.description} onChange={upd('description')} className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-primary-500 mt-1 resize-none" />
                  </div>

                  <button 
                    disabled={saving}
                    className="w-full bg-primary-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-primary-100 disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
                  >
                    {saving && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    {modal === 'add' ? 'Add to Menu' : 'Save Changes'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}