import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import { BsCart2 } from 'react-icons/bs';
import { menuAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';
import FoodCard from '../components/FoodCard';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';


export default function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [item, setItem] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadItem();
  }, [id]);

  const loadItem = async () => {
    try {
      setLoading(true);
      const res = await menuAPI.getById(id);
      const itemData = res.data?.data || res.data;
      console.log("Item details on /item:",itemData); 
      setItem(itemData);
      // Load similar items by category
      if (res.data?.category) {
        const simRes = await menuAPI.getAll({ category: res.data.category, limit: 4 });
        setSimilar((simRes.data || []).filter((i) => i._id !== id).slice(0, 4));
      }
    } catch {
      toast.error('Item not found');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      setAdding(true);
      console.log("item to add to cart has id : ",item.id);
      await addToCart(item.id, qty);
      toast.success(`${item.name} × ${qty} added to cart!`);
      navigate('/cart');
    } catch(error) {
      console.log(error,error.message);
      toast.error('Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };
  const handleItemClick = (item) => {
    const itemId = item._id || item.id;
    if (itemId) {
      navigate(`/item/${itemId}`);
    } else {
      console.error("Item ID is missing", item);
    }
  };
  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate('/cart');
  };

  if (loading) return (
    <div className="app-container flex items-center justify-center min-h-screen">
      <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!item) return null;

  return (
    <div className="app-container flex flex-col pb-20">
      {/* Header */}
      <div className="flex items-center px-4 py-3 bg-white border-b border-neutral-100">
        <button onClick={() => navigate(-1)}
          className="mr-3 text-neutral-700 hover:text-primary-600 transition-colors">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold text-neutral-900">Item Details</h1>
      </div>

      {/* Item content */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col">
        {/* Image + info card */}
        <div className="bg-white px-4 pt-6 pb-4">
          <div className="flex gap-4">
            {/* Image */}
            <img
              src={item.image || `https://via.placeholder.com/150x150?text=${encodeURIComponent(item.name)}`}
              alt={item.name}
              className="w-36 h-36 rounded-2xl object-cover border border-neutral-200 shadow-md flex-shrink-0"
            />
            {/* Details */}
            <div className="flex flex-col justify-between py-1">
              <div>
                <h2 className="text-xl font-bold text-neutral-900">{item.name}</h2>
                <p className="text-lg font-bold text-primary-600 mt-1">Rs. {item.price}</p>
                <div className="flex items-center gap-1 mt-1">
                  <FaStar size={14} className="text-amber-400" />
                  <span className="text-base font-medium">{item.rating?.toFixed(1) || '4.5'}</span>
                </div>
              </div>
              {/* Qty control */}
              <div className="flex items-center gap-3 mt-3">
                <button onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-8 h-8 rounded-full border-2 border-neutral-300 flex items-center 
                                   justify-center text-neutral-700 hover:border-primary-500 transition-colors">
                  −
                </button>
                <span className="text-lg font-semibold w-6 text-center">{qty}</span>
                <button onClick={() => setQty(qty + 1)}
                  className="w-8 h-8 rounded-full border-2 border-neutral-300 flex items-center 
                                   justify-center text-neutral-700 hover:border-primary-500 transition-colors">
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-neutral-500 mt-4 leading-relaxed">{item.description}</p>

          {/* Order notes */}
          <div className="mt-5">
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Order Notes</h3>
            <textarea
              placeholder="Add your order notes here..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full border border-neutral-300 rounded-2xl px-4 py-3 text-sm text-neutral-700
                         placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-5">
            <button onClick={handleAddToCart} disabled={adding}
              className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white 
                               font-semibold rounded-2xl py-4 hover:bg-primary-700 active:scale-95 
                               transition-all disabled:opacity-60">
              <BsCart2 size={18} />
              Add to Cart
            </button>
            <button onClick={handleBuyNow} disabled={adding}
              className="flex-1 border-2 border-primary-600 text-primary-700 font-semibold 
                               rounded-2xl py-4 hover:bg-primary-50 active:scale-95 transition-all disabled:opacity-60">
              Buy Now
            </button>
          </div>
        </div>

        {/* Similar items */}
        {similar.length > 0 && (
          <section className="px-4 pt-5 pb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-neutral-900">Discover more like these</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {similar.map((s) => (
                <FoodCard key={s._id} item={s} onClick={handleItemClick} />
              ))}
            </div>
          </section>
        )}
      </motion.div>

      <BottomNav />
    </div>
  );
}
