import { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { menuAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { MdEdit, MdDelete, MdAdd, MdSearch } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';

const EMPTY = { name: '', description: '', price: '', category_id: '', image_url: '' };

export default function AdminMenu() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ir, cr] = await Promise.all([
        menuAPI.getAll({ available_only: false }),
        menuAPI.getCategories(),
      ]);
      setItems(ir.data || []);
      setCategories(cr.data || []);
    } catch { 
      toast.error('Failed to load menu'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = { ...form, price: parseFloat(form.price) };

      if (modal === 'add') {
        const r = await menuAPI.createItem(payload);
        const newItem = r.data?.data || r.data;
        setItems(p => [newItem, ...p]);
        toast.success('Item added');
      } else {
        const id = modal.id;
        // Using PATCH for updates as requested
        const r = await menuAPI.updateItem(id, payload);
        const updatedItem = r.data?.data || r.data;
        setItems(p => p.map(i => i.id === id ? updatedItem : i));
        toast.success('Item updated');
      }
      closeModal();
    } catch (err) { 
      toast.error('Save failed'); 
    } finally { 
      setSaving(false); 
    }
  };

  const handleToggle = async (item) => {
    try {
      // Toggle logic based on your current availability check
      const nextStatus = item.availability === 'in_stock' ? 'out_of_stock' : 'in_stock';
      await menuAPI.toggleAvailability(item.id, { availability: nextStatus });
      setItems(p => p.map(i => i.id === item.id ? { ...i, availability: nextStatus } : i));
      toast.success('Status updated');
    } catch { 
      toast.error('Failed to update status'); 
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      // Using DELETE endpoint as requested
      await menuAPI.deleteItem(id);
      setItems(p => p.filter(i => i.id !== id));
      toast.success('Deleted');
    } catch { 
      toast.error('Delete failed'); 
    }
  };

  const openEdit = (item) => {
    setForm({ ...item, price: String(item.price) });
    setModal(item);
  };

  const closeModal = () => { 
    setModal(null); 
    setForm(EMPTY); 
  };

  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const visible = items.filter(i => 
    (!search || i.name.toLowerCase().includes(search.toLowerCase())) &&
    (!catFilter || String(i.category_id) === String(catFilter))
  );

  return (
    <AdminLayout title="Menu Management">
      <div className="p-6 max-w-6xl mx-auto">
        
        {/* Header Section - Added relative z-10 for button visibility */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 relative z-10">
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" placeholder="search items..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg bg-gray-50 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <select 
              value={catFilter} onChange={e => setCatFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-gray-50 focus:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          
          <button 
            type="button"
            onClick={() => { setForm(EMPTY); setModal('add'); }}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-md active:scale-95"
          >
            <MdAdd size={20} /> Add Item
          </button>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 text-sm">
                <th className="px-6 py-4 font-semibold text-center">Image</th>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Price</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-10 text-gray-400">Loading menu...</td></tr>
              ) : visible.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-10 text-gray-400">No items found.</td></tr>
              ) : visible.map(item => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-3 flex justify-center">
                    <img 
                      src={item.image_url || 'https://placehold.co/40x40'} 
                      className="w-10 h-10 rounded-lg object-cover bg-gray-100" 
                      alt={item.name} 
                    />
                  </td>
                  <td className="px-6 py-3 font-medium text-gray-700">{item.name}</td>
                  <td className="px-6 py-3 text-gray-600">Rs. {item.price}</td>
                  <td className="px-6 py-3 text-gray-500">
                    {categories.find(c => c.id === item.category_id)?.name || 'Uncategorized'}
                  </td>
                  <td className="px-6 py-3">
                    <button 
                      onClick={() => handleToggle(item)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                        item.availability === 'in_stock' 
                        ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                      }`}
                    >
                      {item.availability === 'in_stock' ? 'in stock' : 'out of stock'}
                    </button>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex gap-3">
                      <button onClick={() => openEdit(item)} className="text-gray-400 hover:text-blue-500 transition-colors"><MdEdit size={18} /></button>
                      <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-500 transition-colors"><MdDelete size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Centered for Admin Panel */}
      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-black/50" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl">
              <h2 className="text-xl font-bold mb-6">{modal === 'add' ? 'Add New Item' : 'Edit Item'}</h2>
              <form onSubmit={handleSave} className="space-y-4">
                <input placeholder="Name" value={form.name} onChange={upd('name')} className="w-full p-3 bg-gray-50 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-orange-500 outline-none" required />
                <div className="flex gap-4">
                  <input placeholder="Price" type="number" value={form.price} onChange={upd('price')} className="w-1/2 p-3 bg-gray-50 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-orange-500 outline-none" required />
                  <select value={form.category_id} onChange={upd('category_id')} className="w-1/2 p-3 bg-gray-50 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-orange-500 outline-none" required>
                    <option value="">Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <input placeholder="Image URL" value={form.image_url} onChange={upd('image_url')} className="w-full p-3 bg-gray-50 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-orange-500 outline-none" />
                <textarea placeholder="Description" value={form.description} onChange={upd('description')} className="w-full p-3 bg-gray-50 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-orange-500 outline-none h-24" />
                <button disabled={saving} className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200 disabled:opacity-50">
                  {saving ? 'Saving...' : modal === 'add' ? 'Add Item' : 'Save Changes'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}