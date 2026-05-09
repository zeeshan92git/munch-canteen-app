import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  // Munch logo component used in Admin design
  const MunchLogo = () => (
    <div className="flex flex-col items-center mb-8">
      <img src="/munch-logo.png" alt="Munch Logo" className="w-16 h-16" />
      <p className="text-xl font-extrabold text-[#1a1a2eb4] font-poppins mt-1">
        MUNCH
      </p>
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      const user = await login(form.email, form.password);
      
      toast.success('Welcome back! 🎉');

      // --- Unified Role-Based Redirection ---
      if (user?.role === 'admin') {
        // Redirect to admin panel if user is staff
        navigate('/admin/dashboard', { replace: true });
      } else {
        // Redirect to customer home
        navigate('/home', { replace: true });
      }
      
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container flex flex-col min-h-screen bg-white relative overflow-hidden">
      
      {/* Decorative Background Elements from Admin Design */}
      <div className="absolute bottom-0 left-0 w-48 h-48 opacity-20 pointer-events-none -translate-x-1/4 translate-y-1/4 bg-[#fff4f0] rounded-full flex items-center justify-center text-4xl">🍔</div>
      <div className="absolute top-0 right-0 w-48 h-48 opacity-20 pointer-events-none translate-x-1/4 -translate-y-1/4 bg-[#fff4f0] rounded-full flex items-center justify-center text-4xl">🥪</div>

      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="m-4 text-neutral-700 hover:text-primary-600 transition-colors self-start z-20"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col px-8 pt-4 z-10"
      >
        {/* Logo Section */}
        <MunchLogo />

        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Welcome Back!</h1>
          <p className="text-neutral-500 mt-1">Login to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email */}
          <div>
            <label className="text-sm font-bold text-neutral-700 mb-2 block ml-1 uppercase tracking-wider">Email</label>
            <input
              type="email" 
              placeholder="Enter your Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border-2 border-neutral-100 rounded-xl px-4 py-4 focus:border-primary-500 focus:outline-none transition-all bg-neutral-50"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-2 ml-1">
                <label className="text-sm font-bold text-neutral-700 uppercase tracking-wider">Password</label>
                <Link to="/forgot-password" size="sm" className="text-xs text-primary-600 font-semibold">Forgot?</Link>
            </div>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Enter Your Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border-2 border-neutral-100 rounded-xl px-4 py-4 focus:border-primary-500 focus:outline-none transition-all bg-neutral-50 pr-12"
              />
              <button 
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showPass ? <AiOutlineEye size={22}/> : <AiOutlineEyeInvisible size={22}/>}
              </button>
            </div>
          </div>

          {/* Unified Login Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-100 flex items-center justify-center gap-3 disabled:opacity-60 mt-4"
          >
            {loading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>}
            Log In
          </button>

          {/* Sign up link - Hide for Admin-specific contexts if needed, but useful for general login */}
          <div className="text-center mt-6">
            <span className="text-neutral-500">Don't have an account? </span>
            <Link to="/signup" className="text-primary-600 font-bold hover:underline">Sign Up</Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}