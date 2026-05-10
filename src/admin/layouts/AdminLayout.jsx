import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  MdDashboard, MdOutlineRestaurantMenu, MdInventory2,
  MdNotificationsNone, MdLogout, MdMenu, MdClose,
} from 'react-icons/md';
import { BsCart3 } from 'react-icons/bs';
import { HiOutlineChartBar } from 'react-icons/hi';

// Munch logo 
const MunchLogo = ({ className = "w-16 h-16" }) => (
  <div className="flex flex-col items-center">
    <img
      src="/munch-logo.png"
      alt="Munch Logo"
      className={className}
    />
    <p className="text-xl  font-extrabold text-[#1a1a2eb4] font-poppins mt-1">
      MUNCH
    </p>
  </div>
);

const NAV = [
  { to: '/admin/dashboard', end: true, label: 'Dashboard', Icon: MdDashboard },
  { to: '/admin/orders', end: false, label: 'Orders', Icon: BsCart3 },
  { to: '/admin/menu', end: false, label: 'Menu Manage', Icon: MdOutlineRestaurantMenu },
  { to: '/admin/inventory', end: false, label: 'Inventory', Icon: MdInventory2 },
  { to: '/admin/reports', end: false, label: 'Reports', Icon: HiOutlineChartBar },
  { to: '/admin/notifications', end: false, label: 'Notifications', Icon: MdNotificationsNone },
];

export default function AdminLayout({ children, title }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const doLogout = () => { logout(); toast.success('Logged out'); navigate('/login', { replace: true }); };
  const initials = (user?.name || 'MG').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-100 shadow-lg w-[260px]">

      {/* Logo */}
      <div className="flex flex-col items-center py-7 px-4 border-b border-gray-100">
        {/* Munch icon */}
        <MunchLogo />
        <span className="text-sm font-semibold text-gray-700 mt-0.5">Canteen Manager</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1 px-[15px] pt-6 overflow-y-auto pb-4">
        {NAV.map(({ to, end, label, Icon }) => (
          <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-2.5 pl-4 pr-[18px] py-2 rounded-lg font-semibold text-xl
               transition-all duration-150 w-full
               ${isActive
                ? 'bg-[#fdc7ac] border-l-[3px] border-[#ff6b35] text-[#ff6b2c]'
                : 'text-gray-900 hover:bg-orange-50 hover:text-[#e85a2a]'}`
            }>
            <Icon size={22} className="flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-[15px] pb-5 border-t border-gray-100 pt-3">
        <button onClick={doLogout}
          className="flex items-center gap-2.5 pl-4 pr-[18px] py-2 rounded-lg font-semibold text-xl
                     text-gray-900 hover:bg-red-50 hover:text-red-600 transition-colors w-full">
          <MdLogout size={24} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f8f8]" style={{ fontFamily: 'Poppins,sans-serif' }}>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar drawer */}
      {open && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 flex lg:hidden">
            <Sidebar />
            <button onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
              <MdClose size={24} />
            </button>
          </div>
        </>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Topbar */}
        <header className="flex items-center justify-between bg-white border-b border-[#eee] px-6 h-[93px] flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-gray-600 hover:text-[#e85a2a]" onClick={() => setOpen(true)}>
              <MdMenu size={26} />
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          </div>
          <div className="flex items-center gap-[22px]">
            <button onClick={() => navigate('/admin/notifications')}
              className="text-gray-600 hover:text-[#e85a2a] transition-colors">
              <MdNotificationsNone size={24} />
            </button>
            {/* User icon */}
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5" className="hidden sm:block">
              <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
            <div className="flex flex-col items-start">
              <span className="text-[18px] font-medium text-gray-900 leading-tight">{user?.name || 'Manager'}</span>
              <span className="text-sm text-gray-500">Canteen Admin</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}