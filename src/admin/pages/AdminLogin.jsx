import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function AdminLogin() {

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

  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Fill all fields'); return; }
    try {
      setLoading(true);
      const user = await login(form.email, form.password);
      if (user?.role === 'admin' || user?.role === 'manager') {
        toast.success('Welcome back! 🎉');
        navigate('/admin/dashboard', { replace: true });
      } else {
        toast.error('Access denied. Admin credentials required.');
        localStorage.clear();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden"
      style={{ fontFamily: 'Poppins,sans-serif' }}>

      {/* Decorative food images (matching Figma bg) */}
      <div className="absolute bottom-0 left-0 w-64 h-64 opacity-40 pointer-events-none"
        style={{
          backgroundImage: "url('https://placehold.co/300x300/fff4f0/e85a2a?text=🍔')",
          backgroundSize: 'cover', borderRadius: '50%', transform: 'translate(-30%,30%)'
        }} />
      <div className="absolute bottom-0 right-0 w-64 h-64 opacity-40 pointer-events-none"
        style={{
          backgroundImage: "url('https://placehold.co/300x300/fff4f0/e85a2a?text=🥪')",
          backgroundSize: 'cover', borderRadius: '50%', transform: 'translate(30%,30%)'
        }} />

      <div className="relative z-10 w-full max-w-2xl px-4">

        {/* Logo */}
        <MunchLogo/>

        {/* Card */}
        <div className="bg-[#fff2ed] rounded-2xl shadow-[0px_8px_30px_1px_rgba(0,0,0,0.08)] px-10 py-10 mx-auto max-w-[600px]">
          <h2 className="text-3xl font-bold text-[#2d1b20] text-center mb-1">Welcome Back!</h2>
          <p className="text-center text-gray-500 text-lg mb-8">Login to continue</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div>
              <label className="text-xl font-semibold text-gray-900 block mb-2">Email</label>
              <input type="email" placeholder="Enter your Email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full border border-[#41337a] rounded-[10px] px-4 py-5 text-base
                                bg-transparent text-gray-900 placeholder:text-gray-400
                                focus:outline-none focus:ring-2 focus:ring-[#e85a2a]" />
            </div>

            {/* Password */}
            <div>
              <label className="text-xl font-semibold text-gray-900 block mb-2">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'}
                  placeholder="Enter Your Password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full border border-[#41337a] rounded-[10px] px-4 py-5 text-base
                                  bg-transparent text-gray-900 placeholder:text-gray-400
                                  focus:outline-none focus:ring-2 focus:ring-[#e85a2a] pr-12" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <AiOutlineEye size={22} /> : <AiOutlineEyeInvisible size={22} />}
                </button>
              </div>
            </div>

            <p className="text-right text-sm text-[#aeaeb2] -mt-2">Forgot Password?</p>

            <button type="submit" disabled={loading}
              className="w-full bg-[#e85a2a] text-white font-normal text-base py-[18px]
                               rounded-lg hover:bg-[#c94a20] transition-colors disabled:opacity-60
                               flex items-center justify-center gap-2">
              {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Log In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}