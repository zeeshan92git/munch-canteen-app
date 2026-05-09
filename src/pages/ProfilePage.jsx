import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import toast from 'react-hot-toast';
import { CgProfile } from 'react-icons/cg';
import { MdHistory, MdLogout, MdEdit } from 'react-icons/md';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const navigate        = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [isEditing, setIsEditing]    = useState(false);
  const [form, setForm]              = useState({ firstName: '', lastName: '', department: '', location: '' });
  const [loading, setLoading]        = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        firstName:  user.firstName  || '',
        lastName:   user.lastName   || '',
        department: user.department || '',
        location:   user.location   || 'PUCIT New Campus',
      });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await authAPI.updateProfile(form);
      updateUser(res.data.user);
      toast.success('Profile updated!');
      setIsEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login', { replace: true });
  };

  const fullName = user.full_name || 'User';
  const initials = fullName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="app-container flex flex-col pb-20">
      <Header title="My Profile" showBack onBack={() => navigate(-1)} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="flex-1 overflow-y-auto px-4 pt-6 flex flex-col gap-5">
        {/* Avatar */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-primary-100 border-4 border-primary-300
                            flex items-center justify-center text-3xl font-bold text-primary-600 shadow-lg">
              {initials || <CgProfile size={40} />}
            </div>
            {isEditing && (
              <button className="absolute bottom-0 right-0 bg-primary-600 text-white rounded-full p-1.5
                                 border-2 border-white shadow">
                <MdEdit size={16} />
              </button>
            )}
          </div>
        </div>

        {!isEditing ? (
          /* ── View mode ── */
          <>
            <div className="bg-white rounded-2xl p-4 space-y-4">
              {[
                { label: 'Name:',       value: fullName },
                { label: 'Email id:',   value: user?.email },
                { label: 'Department:', value: user?.department || 'FCIT' },
                { label: 'Location:',   value: user?.location || 'PUCIT New Campus' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-sm font-semibold text-neutral-500 mb-1">{label}</p>
                  <div className="border border-neutral-200 rounded-xl px-4 py-2.5 bg-neutral-50">
                    <p className="text-base text-neutral-900">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3">
              <button onClick={() => setIsEditing(true)}
                      className="flex items-center justify-between btn-primary rounded-2xl py-4 px-6">
                <span>Edit Profile</span>
                <MdEdit size={20} />
              </button>
              <button onClick={() => navigate('/orders')}
                      className="flex items-center justify-between btn-secondary rounded-2xl py-4 px-6">
                <span>Order History</span>
                <MdHistory size={20} />
              </button>
              <button onClick={handleLogout}
                      className="flex items-center justify-between border-2 border-red-300 text-red-600
                                 font-semibold rounded-2xl py-4 px-6 hover:bg-red-50 transition-colors">
                <span>Logout</span>
                <MdLogout size={20} />
              </button>
            </div>
          </>
        ) : (
          /* ── Edit mode ── */
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-neutral-900">Edit Profile</h2>
            {[
              { label: 'First Name', key: 'firstName' },
              { label: 'Last Name',  key: 'lastName'  },
              { label: 'Department', key: 'department' },
              { label: 'Location',   key: 'location'  },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="text-sm font-semibold text-neutral-700 mb-1 block">{label}</label>
                <input
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="input-field"
                />
              </div>
            ))}
            <div className="flex gap-3 mt-2 pb-6">
              <button type="button" onClick={() => setIsEditing(false)}
                      className="flex-1 border-2 border-neutral-400 text-neutral-700 font-semibold 
                                 rounded-2xl py-4 hover:bg-neutral-50">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                      className="flex-1 btn-primary rounded-2xl py-4 flex items-center justify-center gap-2 disabled:opacity-60">
                {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>}
                Save
              </button>
            </div>
          </form>
        )}
      </motion.div>
      <BottomNav />
    </div>
  );
}
