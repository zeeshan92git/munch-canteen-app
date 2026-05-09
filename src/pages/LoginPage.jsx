import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm]         = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill all fields'); return; }
    try {
      setLoading(true);
      const user = await login(form.email, form.password);
      toast.success('Welcome back! 🎉');
      // role based redirect
      if (user?.role === 'admin'){
          navigate('/admin', { replace: true });
      }else{
          navigate('/home', { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container flex flex-col min-h-screen">
      {/* Back */}
      <button onClick={() => navigate(-1)}
              className="m-4 text-neutral-700 hover:text-primary-600 transition-colors self-start">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="flex-1 flex flex-col px-8 pt-4">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-neutral-900">Welcome</h1>
          <h2 className="text-3xl font-bold text-primary-600 mt-1">Login In</h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Email */}
          <div>
            <label className="text-lg font-semibold text-neutral-900 mb-2 block">Email</label>
            <input
              type="email" placeholder="Enter your Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-lg font-semibold text-neutral-900 mb-2 block">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Enter Your Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field pr-12"
              />
              <button type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 
                                 hover:text-neutral-600">
                {showPass ? <AiOutlineEye size={22}/> : <AiOutlineEyeInvisible size={22}/>}
              </button>
            </div>
          </div>

          {/* Login button */}
          <button type="submit" disabled={loading}
                  className="btn-primary mt-2 disabled:opacity-60 flex items-center justify-center gap-2">
            {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>}
            Log In
          </button>

          {/* Forgot */}
          <p className="text-center text-sm text-neutral-400 -mt-2">
            <Link to="/forgot-password" className="hover:text-primary-600">Forgot Password?</Link>
          </p>

          {/* Sign up link */}
          <div className="text-center mt-2 bg-primary-600 rounded-xl py-3">
            <span className="text-white text-base">Don't have an account? </span>
            <Link to="/signup" className="text-white font-semibold underline">Sign Up</Link>
          </div>
        </form>
      </motion.div>

    </div>
  );
}
