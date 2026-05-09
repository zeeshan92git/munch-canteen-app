import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const DEPARTMENTS = [
  'Computer Science', 'Software Engineering', 'Information Technology',
  'Electrical Engineering', 'Mathematics', 'Physics', 'Business Administration',
  'Other',
];

// Step 1 – choose role
function RoleStep({ onSelect }) {
  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                className="flex flex-col items-center gap-6 pt-4">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold text-neutral-900">CREATE ACCOUNT</h1>
        <p className="text-xl text-neutral-500 mt-1">Join as</p>
      </div>
      <button onClick={() => onSelect('student')}
              className="btn-primary text-lg rounded-2xl">
        Student
      </button>
      <button onClick={() => onSelect('staff')}
              className="btn-secondary text-lg rounded-2xl w-full">
        Staff / Faculty
      </button>
      <p className="text-base text-neutral-500 mt-4">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 font-semibold">Log In</Link>
      </p>
    </motion.div>
  );
}

// Step 2 – fill details
function FormStep({ role, onBack }) {
  const navigate   = useNavigate();
  const { register } = useAuth();
  const [form, setForm]         = useState({
    firstName: '', lastName: '', email: '', department: '', password: '', confirm: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [dept, setDept]         = useState('');
  const [showDept, setShowDept] = useState(false);

  const upd = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be ≥ 6 characters'); return; }
    try {
      setLoading(true);
      await register({ ...form, role, department: dept });
      toast.success('Account created! Please verify your email.');
      navigate('/verify-otp', { state: { email: form.email } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                className="flex flex-col gap-5 pt-2 pb-8">
      <h1 className="text-2xl font-bold text-neutral-900 text-center">CREATE YOUR ACCOUNT</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {[
          { label: 'First Name', key: 'firstName', placeholder: 'First Name' },
          { label: 'Last Name',  key: 'lastName',  placeholder: 'Last Name'  },
          { label: 'Email Address', key: 'email', placeholder: 'Email Address', type: 'email' },
        ].map(({ label, key, placeholder, type = 'text' }) => (
          <div key={key}>
            <label className="text-base font-semibold text-neutral-900 mb-1 block">{label}</label>
            <input type={type} placeholder={placeholder} value={form[key]}
                   onChange={upd(key)} required className="input-field" />
          </div>
        ))}

        {/* Department dropdown */}
        <div>
          <label className="text-base font-semibold text-neutral-900 mb-1 block">Department</label>
          <div className="relative">
            <button type="button" onClick={() => setShowDept(!showDept)}
                    className="input-field text-left flex items-center justify-between
                               text-neutral-900 bg-white">
              <span className={dept ? 'text-neutral-900' : 'text-[#aeaeb2]'}>
                {dept || 'Department'}
              </span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>
            {showDept && (
              <div className="absolute top-full left-0 right-0 bg-white border border-neutral-200 
                              rounded-xl shadow-lg z-10 max-h-40 overflow-y-auto mt-1">
                {DEPARTMENTS.map((d) => (
                  <button key={d} type="button"
                          onClick={() => { setDept(d); setShowDept(false); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-neutral-800 
                                     hover:bg-primary-50 hover:text-primary-700 transition-colors">
                    {d}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Password */}
        {[
          { label: 'Password',        key: 'password', show: showPass, toggle: () => setShowPass(!showPass) },
          { label: 'Confirm Password',key: 'confirm',  show: showConf, toggle: () => setShowConf(!showConf) },
        ].map(({ label, key, show, toggle }) => (
          <div key={key}>
            <label className="text-base font-semibold text-neutral-900 mb-1 block">{label}</label>
            <div className="relative">
              <input type={show ? 'text' : 'password'} placeholder={label}
                     value={form[key]} onChange={upd(key)} required className="input-field pr-12" />
              <button type="button" onClick={toggle}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                {show ? <AiOutlineEye size={22}/> : <AiOutlineEyeInvisible size={22}/>}
              </button>
            </div>
          </div>
        ))}

        <button type="submit" disabled={loading}
                className="btn-primary mt-2 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60">
          {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>}
          Create Account
        </button>
        <button type="button" onClick={onBack}
                className="text-center text-sm text-neutral-500 hover:text-primary-600">
          ← Back
        </button>
      </form>
    </motion.div>
  );
}

export default function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState('role'); // 'role' | 'form'
  const [role, setRole] = useState('');

  return (
    <div className="app-container flex flex-col min-h-screen">
      <button onClick={() => step === 'role' ? navigate(-1) : setStep('role')}
              className="m-4 text-neutral-700 hover:text-primary-600 transition-colors self-start">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
      </button>
      <div className="flex-1 px-8 overflow-y-auto">
        {step === 'role'
          ? <RoleStep onSelect={(r) => { setRole(r); setStep('form'); }} />
          : <FormStep role={role} onBack={() => setStep('role')} />
        }
      </div>
    </div>
  );
}
