import { NavLink } from 'react-router-dom';
import { AiOutlineHome } from 'react-icons/ai';
import { BsCart2 } from 'react-icons/bs';
import { MdOutlineHistory } from 'react-icons/md';
import { CgProfile } from 'react-icons/cg';
import { useCart } from '../context/CartContext';

export default function BottomNav() {
  const { cartCount } = useCart();

  const tabs = [
    { to: '/home',    icon: AiOutlineHome,     label: 'Home'    },
    { to: '/cart',    icon: BsCart2,           label: 'Cart'    },
    { to: '/orders',  icon: MdOutlineHistory,  label: 'Orders'  },
    { to: '/profile', icon: CgProfile,         label: 'Profile' },
  ];

  return (
    <nav className="bottom-nav h-[60px] flex items-center justify-around px-2">
      {tabs.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-4 py-1 relative transition-colors
             ${isActive ? 'text-primary-600' : 'text-neutral-500'}`
          }
        >
          <div className="relative">
            <Icon size={24} />
            {to === '/cart' && cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-[10px] font-bold
                               w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
