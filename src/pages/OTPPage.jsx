import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function OTPPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const email     = location.state?.email || '';
  const [otp, setOtp]       = useState(['', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const refs = [useRef(), useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    refs[0].current?.focus();
    const t = setInterval(() => setResendTimer((v) => (v > 0 ? v - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const handleChange = (val, i) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[i] = val;
    setOtp(next);
    if (val && i < 4) refs[i + 1].current?.focus();
  };

  const handleKey = (e, i) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs[i - 1].current?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 5) { toast.error('Enter full OTP'); return; }
    try {
      setLoading(true);
      await authAPI.verifyOTP({ email, otp: code });
      toast.success('Email verified! 🎉');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    try {
      await authAPI.resendOTP({ email });
      toast.success('OTP resent!');
      setResendTimer(30);
    } catch {
      toast.error('Failed to resend OTP');
    }
  };

  return (
    <div className="app-container flex flex-col min-h-screen">
      <button onClick={() => navigate(-1)}
              className="m-4 text-neutral-700 hover:text-primary-600 self-start">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="flex-1 flex flex-col justify-center px-8 gap-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-3">OTP Verification</h1>
          <p className="text-base text-neutral-500 leading-relaxed">
            Enter the verification code we just sent to your email address
            {email && <span className="font-semibold text-neutral-700"> {email}</span>}.
          </p>
        </div>

        {/* OTP inputs */}
        <div className="flex gap-3 justify-center">
          {otp.map((d, i) => (
            <input key={i} ref={refs[i]}
                   value={d} maxLength={1}
                   onChange={(e) => handleChange(e.target.value, i)}
                   onKeyDown={(e) => handleKey(e, i)}
                   className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-2xl
                               focus:outline-none transition-colors
                               ${d ? 'border-primary-600 bg-primary-50 text-primary-700'
                                   : 'border-neutral-300 bg-white text-neutral-900'}`}
            />
          ))}
        </div>

        {/* Verify */}
        <button onClick={handleVerify} disabled={loading}
                className="btn-primary rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60">
          {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>}
          Verify
        </button>

        {/* Resend */}
        <p className="text-center text-base text-neutral-500">
          Didn't receive a code?{' '}
          <button onClick={handleResend}
                  className={`font-semibold ${resendTimer > 0 ? 'text-neutral-300' : 'text-primary-600'}`}>
            Resend {resendTimer > 0 ? `(${resendTimer}s)` : ''}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
