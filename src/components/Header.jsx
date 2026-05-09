import { HiOutlineMenuAlt3 } from 'react-icons/hi';
import { MdLocationOn } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';

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

export default function Header({ title, showBack, onBack }) {
  const { user } = useAuth();
  const firstName = user?.full_name || user?.name?.split(' ')[0] || 'User';
  const location = user?.location || 'PUCIT New Campus';

  if (title) {
    // Simple titled header
    return (
      <header className="flex items-center px-4 py-3 bg-white border-b border-neutral-100">
        {showBack && (
          <button onClick={onBack} className="mr-3 text-neutral-700 hover:text-primary-600 transition-colors">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
        )}
        <h1 className="flex-1 text-center text-xl font-semibold text-neutral-900 pr-8">{title}</h1>
      </header>
    );
  }

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white">
      <MunchLogo />
      <div className="flex flex-col ml-2 flex-1">
        <span className="text-xl font-semibold text-neutral-900">Hi, {firstName}!</span>
        <div className="flex items-center gap-1">
          <MdLocationOn size={16} className="text-primary-600" />
          <span className="text-sm text-neutral-700">{location}</span>
        </div>
      </div>
      <button className="text-neutral-700 hover:text-primary-600 transition-colors">
        <HiOutlineMenuAlt3 size={26} />
      </button>
    </header>
  );
}
