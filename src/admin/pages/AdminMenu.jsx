import { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { menuAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { MdEdit, MdDelete, MdAdd, MdClose } from 'react-icons/md';
import { FaStar } from 'react-icons/fa';
 
const EMPTY = { name: '', description: '', price: '', category_id: '', image_url: '' };
 
export default function AdminMenu() {
  const [items,      setItems]      = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [catFilter,  setCatFilter]  = useState('');
  const [modal,      setModal]      = useState(null); // null | 'add' | item obj
  const [form,       setForm]       = useState(EMPTY);
  const [saving,     setSaving]     = useState(false);
  const [deleting,   setDeleting]   = useState(null);
  const [toggling,   setToggling]   = useState(null);
 
  useEffect(() => { loadData(); }, []);
 
  const loadData = async () => {
    try {
      setLoading(true);
      const [ir, cr] = await Promise.all([
        menuAPI.getItems({ limit: 200 }),
        menuAPI.getCategories(),
      ]);
      setItems(ir.data?.items || ir.data || []);
      setCategories(cr.data || []);
    } catch { toast.error('Failed to load menu'); }
    finally  { setLoading(false); }
  };
 
  const openAdd  = ()     => { setForm(EMPTY); setModal('add'); };
  const openEdit = (item) => {
    setForm({
      name:        item.name        || '',
      description: item.description || '',
      price:       String(item.price || ''),
      category_id: item.category_id || '',
      image_url:   item.image_url   || '',
    });
    setModal(item);
  };
  const closeModal = () => { setModal(null); setForm(EMPTY); };
  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
 
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price) { toast.error('Name and price required'); return; }
    try {
      setSaving(true);
      if (modal === 'add') {
        const r = await menuAPI.createItem(form);
        setItems(p => [r.data, ...p]);
        toast.success('Item created!');
      } else {
        const id = modal.id || modal._id;
        const r  = await menuAPI.updateItem(id, form);
        setItems(p => p.map(i => (i.id || i._id) === id ? r.data : i));
        toast.success('Item updated!');
      }
      closeModal();
    } catch (e) { toast.error(e.response?.data?.message || 'Save failed'); }
    finally    { setSaving(false); }
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
    finally  { setDeleting(null); }
  };
 
  const handleToggle = async (item) => {
    const id = item.id || item._id;
    try {
      setToggling(id);
      await menuAPI.toggleAvailability(id, !item.is_available);
      setItems(p => p.map(i => (i.id || i._id) === id ? { ...i, is_available: !i.is_available } : i));
      toast.success(`Marked ${!item.is_available ? 'available' : 'unavailable'}`);
    } catch { toast.error('Toggle failed'); }
    finally  { setToggling(null); }
  };
 
  const visible = items.filter(i => {
    const ms = !search     || i.name.toLowerCase().includes(search.toLowerCase());
    const mc = !catFilter  || i.category_id === catFilter;
    return ms && mc;
  });
 
  const catName = id => categories.find(c => c.id === id)?.name || '';
 
  return (
    <AdminLayout title="Menu Manage">
 
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 mb-5 items-center">
        <input type="text" placeholder="Search items…" value={search}
               onChange={e => setSearch(e.target.value)}
               className="input-field flex-1 min-w-[180px] max-w-xs" />
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
                className="input-field w-auto">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button onClick={openAdd} className="btn-primary whitespace-nowrap">
          <MdAdd size={20} /> Add Item
        </button>
      </div>
 
      {/* Stats bar */}
      <div className="flex gap-4 mb-5 text-sm text-gray-500">
        <span>Total: <strong className="text-gray-800">{items.length}</strong></span>
        <span>Available: <strong className="text-green-700">{items.filter(i => i.is_available !== false).length}</strong></span>
        <span>Unavailable: <strong className="text-red-600">{items.filter(i => i.is_available === false).length}</strong></span>
      </div>
 
      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_,i) => (
            <div key={i} className="card p-4 animate-pulse h-64">
              <div className="h-32 bg-gray-200 rounded-xl mb-3" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-3">🍽️</p>
          <p className="font-medium">No items found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {visible.map(item => {
            const id = item.id || item._id;
            const available = item.is_available !== false;
            return (
              <div key={id} className="card overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative">
                  <img
                    src={item.image_url || `https://placehold.co/300x150?text=${encodeURIComponent(item.name)}`}
                    alt={item.name}
                    className="w-full h-36 object-cover" />
                  <button onClick={() => handleToggle(item)} disabled={toggling === id}
                          className={`absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded-full
                                       transition-colors ${available ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                                      : 'bg-red-100 text-red-600 hover:bg-red-200'}`}>
                    {toggling === id ? '…' : available ? 'Available' : 'Unavailable'}
                  </button>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                  {item.description && (
                    <p className="text-xs text-gray-400 truncate mt-0.5">{item.description}</p>
                  )}
                  {catName(item.category_id) && (
                    <span className="inline-block mt-1 text-[10px] bg-orange-50 text-primary-600
                                     font-semibold px-2 py-0.5 rounded-full">
                      {catName(item.category_id)}
                    </span>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-base font-bold text-primary-600">Rs. {item.price}</span>
                    <div className="flex items-center gap-1">
                      <FaStar size={11} className="text-amber-400" />
                      <span className="text-xs text-gray-600">{item.rating?.toFixed(1) || '—'}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => openEdit(item)}
                            className="flex-1 flex items-center justify-center gap-1 border border-primary-600
                                       text-primary-600 text-xs font-semibold py-1.5 rounded-lg hover:bg-orange-50">
                      <MdEdit size={13} /> Edit
                    </button>
                    <button onClick={() => handleDelete(item)} disabled={deleting === id}
                            className="flex-1 flex items-center justify-center gap-1 border border-red-300
                                       text-red-600 text-xs font-semibold py-1.5 rounded-lg hover:bg-red-50
                                       disabled:opacity-50">
                      <MdDelete size={13} /> {deleting === id ? '…' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
 
      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {modal === 'add' ? 'Add Menu Item' : `Edit — ${modal.name}`}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-700"><MdClose size={24} /></button>
            </div>
            <form onSubmit={handleSave} className="px-6 py-5 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Item Name *</label>
                <input type="text" placeholder="e.g. Chicken Burger" value={form.name}
                       onChange={upd('name')} required className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Price (Rs) *</label>
                <input type="number" placeholder="e.g. 250" value={form.price} min="1"
                       onChange={upd('price')} required className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                <select value={form.category_id} onChange={upd('category_id')} className="input-field">
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Image URL</label>
                <input type="url" placeholder="https://…" value={form.image_url}
                       onChange={upd('image_url')} className="input-field" />
                {form.image_url && (
                  <img src={form.image_url} alt="preview"
                       className="mt-2 h-24 w-full object-cover rounded-xl border border-gray-200"
                       onError={e => e.target.style.display='none'} />
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea placeholder="Short description…" rows={3} value={form.description}
                          onChange={upd('description')} className="input-field resize-none" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={closeModal}
                        className="flex-1 border-2 border-gray-300 text-gray-700 font-semibold py-3
                                   rounded-xl hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                        className="flex-1 btn-primary justify-center py-3 rounded-xl">
                  {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {modal === 'add' ? 'Create Item' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}