import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsSearch } from 'react-icons/bs';
import { FaStar } from 'react-icons/fa';
import { AiOutlinePlus } from 'react-icons/ai';
import { menuAPI } from '../services/api';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import FoodCard from '../components/FoodCard';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

// Category icons mapping
const categoryIcons = {
  'Fast Food': '🍔',
  'Desi Food': '🍛',
  'Drinks': '☕',
  'Salads': '🥗',
  'Snacks': '🍟',
  'Desserts': '🍰',
  'Noodles': '🍜',
  'Steak': '🥩',
  'Coffee': '☕',
  'default': '🍽️',
};

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [categories, setCategories] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [popular, setPopular] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [catRes, recRes, popRes] = await Promise.all([
        menuAPI.getCategories(),
        menuAPI.getRecommended(),
        menuAPI.getPopular(),
      ]);
      setCategories(catRes.data?.data || catRes.data || []);
      setRecommended(recRes.data?.data || recRes.data || []);
      setPopular(popRes.data?.data || popRes.data || []);
    } catch (error) {
      console.error("Home data load failed", error);
    } finally {
      setLoadingData(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const id = setTimeout(async () => {
      try {
        setSearching(true);
        const res = await menuAPI.searchItems(searchQuery);
        setSearchResults(res.data || []);
      } catch { } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(id);
  }, [searchQuery]);

  // Ensure the ID exists. Some APIs use 'id', others use '_id'
  const handleItemClick = (item) => {
    const itemId = item._id || item.id;
    if (itemId) {
      navigate(`/item/${itemId}`);
    } else {
      console.error("Item ID is missing", item);
    }
  };

  const handleQuickAdd = async (item, e) => {
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    try {
      await addToCart(item._id, 1);
      toast.success(`${item.name} added!`);
    } catch {
      toast.error('Failed to add item');
    }
  };

  const SkeletonCard = () => (
    <div className="bg-neutral-100 rounded-2xl p-3 animate-pulse">
      <div className="w-24 h-24 rounded-full bg-neutral-300 mx-auto mb-2" />
      <div className="h-3 bg-neutral-300 rounded w-3/4 mb-1" />
      <div className="h-3 bg-neutral-300 rounded w-1/2" />
    </div>
  );

  return (
    <div className="app-container flex flex-col pb-20">
      <Header />

      {/* Search bar */}
      <div className="px-4 py-2 bg-white">
        <div className="relative">
          <BsSearch size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text" placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-neutral-300 rounded-full pl-10 pr-4 py-2 text-sm
                       bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all"
          />
          {searching && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2
                            w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      </div>

      {/* Search results */}
      {searchQuery.trim() && (
        <div className="px-4 bg-white pb-4">
          {searchResults.length === 0 && !searching
            ? <p className="text-center text-neutral-500 text-sm py-4">No results found</p>
            : <div className="grid grid-cols-2 gap-3">
              {searchResults.map((item) => (
                <FoodCard key={item._id} item={item} onClick={handleItemClick} />
              ))}
            </div>
          }
        </div>
      )}

      {!searchQuery.trim() && (
        <>
          {/* ── Categories ── */}
          <section className="bg-white border-t border-neutral-100 pt-4">
            <div className="px-4 flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold text-neutral-900">Categories</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide">
              {loadingData
                ? Array(4).fill(0).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 min-w-[72px] animate-pulse">
                    <div className="w-16 h-16 rounded-full bg-neutral-300" />
                    <div className="h-3 bg-neutral-300 rounded w-12" />
                  </div>
                ))
                : categories.map((cat) => (
                  <button key={cat._id || cat.name}
                    onClick={() => navigate(`/category/${encodeURIComponent(cat.name)}`)}
                    className="flex flex-col items-center gap-3 min-w-[72px] group">
                    <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center
                                      text-3xl border-2 border-neutral-200 group-hover:border-primary-400
                                      transition-colors shadow-sm">
                      {categoryIcons[cat.name] || categoryIcons.default}
                    </div>
                    <span className="text-xs font-medium text-neutral-700 text-center leading-tight">
                      {cat.name}
                    </span>
                  </button>
                ))
              }
            </div>
            <div className="border-t border-neutral-100 mx-0" />
          </section>

          {/* ── Recommended For You ── */}
          <section className="bg-white pt-4">
            <div className="px-4 flex items-center justify-between mb-3">
              <div className="flex items-center gap-1">
                <h2 className="text-xl font-semibold text-neutral-900">Recommended For You</h2>
                <span className="text-primary-500">✦</span>
              </div>
              <button onClick={() => navigate('/recommended')}
                className="text-primary-600 text-sm font-medium hover:underline">→</button>
            </div>
            <div className="grid grid-cols-2 gap-3 px-4 pb-4">
              {loadingData
                ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
                : recommended.length > 0
                  ? recommended.map((item) => (
                    <FoodCard key={item._id} item={item} onClick={handleItemClick} />
                  ))
                  : <p className="col-span-2 text-center text-neutral-400 text-sm py-6">
                    Place your first order to get recommendations!
                  </p>
              }
            </div>
            <div className="border-t border-neutral-100" />
          </section>

          {/* ── Popular Items ── */}
          <section className="bg-white pt-4">
            <div className="px-4 flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold text-neutral-900">Popular Items</h2>
              <button onClick={() => navigate('/popular')}
                className="text-primary-600 text-sm font-medium hover:underline">→</button>
            </div>
            <div className="grid grid-cols-2 gap-3 px-4 pb-6">
              {loadingData
                ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
                : popular.map((item) => (
                  <FoodCard key={item._id} item={item} onClick={handleItemClick} />
                ))
              }
            </div>
          </section>
        </>
      )}

      <BottomNav />
    </div>
  );
}
