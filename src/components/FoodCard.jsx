import { useState } from 'react';
import { AiOutlinePlus } from 'react-icons/ai';
import { FaStar } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function FoodCard({ item, onClick }) {
  const { addToCart } = useCart();
  const { user }      = useAuth();
  const navigate      = useNavigate();
  const [adding, setAdding] = useState(false);

  const handleAdd = async (e) => {
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    try {
      setAdding(true);
      await addToCart(item.id, 1);
      toast.success(`${item.name} added to cart!`);
    } catch {
      toast.error('Failed to add item');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div
      onClick={() => onClick ? onClick(item) : navigate(`/item/${item._id}`)}
      className="bg-neutral-100 rounded-2xl p-3 cursor-pointer hover:shadow-md 
                 active:scale-95 transition-transform duration-150 select-none"
    >
      {/* Food image */}
      <div className="flex justify-center mb-2">
        <img
          src={item.image || `https://via.placeholder.com/100x100?text=${encodeURIComponent(item.name)}`}
          alt={item.name}
          className="w-[100px] h-[100px] rounded-full object-cover border border-neutral-300 shadow"
        />
      </div>

      {/* Name + Rating row */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-neutral-900 truncate max-w-[70%]">{item.name}</span>
        <div className="flex items-center gap-0.5">
          <FaStar size={10} className="text-amber-400" />
          <span className="text-[11px] text-neutral-700">{item.rating?.toFixed(1) || '4.5'}</span>
        </div>
      </div>

      {/* Price + Add button */}
      <div className="flex items-center justify-between">
        <span className="text-base font-bold text-neutral-900">Rs. {item.price}</span>
        <button
          onClick={handleAdd}
          disabled={adding}
          className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center
                     text-white hover:bg-primary-700 active:scale-90 transition-all disabled:opacity-60"
        >
          <AiOutlinePlus size={14} />
        </button>
      </div>
    </div>
  );
}
