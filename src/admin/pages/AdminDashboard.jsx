import { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { adminOrderAPI } from '../../services/api'; 
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/* ── Stat card component ── */
function StatCard({ label, value, icon, color, loading }) {
  return (
    <div className="bg-white rounded-[14px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.04)] p-5 flex items-center gap-4">
      <div className={`w-[85px] h-[85px] rounded-full flex items-center justify-center text-3xl flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        {loading
          ? <div className="h-10 w-16 bg-gray-200 rounded animate-pulse mb-1" />
          : <p className="text-[46px] font-bold text-[#464255] leading-none">{value ?? '0'}</p>
        }
        <p className="text-[16px] text-[#464255] mt-1 leading-snug">{label}</p>
      </div>
    </div>
  );
}

/* ── Status badge component ── */
function Badge({ status }) {
  const map = {
    pending:   'bg-blue-100 text-blue-700',
    preparing: 'bg-amber-100 text-amber-700',
    ready:     'bg-green-100 text-green-700',
    completed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

export default function AdminDashboard() {
  // Removed lowStock from state, added total
  const [stats, setStats] = useState({ active: 0, completed: 0, total: 0, revenue: 0 });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    loadDashboardData(); 
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Removed inventoryAPI.getInventory() as requested
      const ordRes = await adminOrderAPI.getAllOrders(); 
      const allOrders = ordRes.data?.data || ordRes.data || [];
      
      // Calculate Stats based only on Orders
      const activeCount = allOrders.filter(o => o.status != 'cancelled').length;
      const completedCount = allOrders.filter(o => o.status === 'completed').length;
      const totalRevenue = allOrders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + (Number(o.total_amount || o.total) || 0), 0);

      setStats({ 
        active: activeCount, 
        completed: completedCount, 
        total: allOrders.length, // Replaced lowStock with total orders
        revenue: totalRevenue 
      });
      
      setOrders(allOrders);
    } catch (error) {
      console.error("Dashboard Load Error:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ── Chart Data Processing ── */
  const areaData = DAYS.map((day, i) => {
    const dayOrders = orders.filter(o => new Date(o.created_at).getDay() === i);
    return { 
      day, 
      orders: dayOrders.length, 
      revenue: dayOrders.reduce((s, o) => s + (Number(o.total_amount || o.total) || 0), 0) 
    };
  });

  const barData = DAYS.map((day, i) => ({
    day,
    completed: orders.filter(o => o.status === 'completed' && new Date(o.created_at).getDay() === i).length,
    cancelled: orders.filter(o => o.status === 'cancelled' && new Date(o.created_at).getDay() === i).length,
  }));

  return (
    <AdminLayout title="Dashboard">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatCard label="Active Orders" value={stats.active} icon="📋" color="bg-emerald-50" loading={loading} />
        <StatCard label="Completed" value={stats.completed} icon="✅" color="bg-blue-50" loading={loading} />
        {/* Replaced Low Stock with Total Orders */}
        <StatCard label="Total Orders" value={stats.total} icon="📊" color="bg-amber-50" loading={loading} />
        <StatCard label="Revenue (Rs)" value={stats.revenue.toLocaleString()} icon="💰" color="bg-rose-50" loading={loading} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-neutral-100">
          <h2 className="text-xl font-bold text-neutral-800 mb-1">Order Analytics</h2>
          <p className="text-sm text-neutral-400 mb-6">Daily order volume for the current week</p>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={areaData}>
              <defs>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e85a2a" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#e85a2a" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
              <Tooltip cursor={{stroke: '#e85a2a', strokeWidth: 2}} />
              <Area type="monotone" dataKey="orders" stroke="#e85a2a" fillOpacity={1} fill="url(#colorOrders)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-neutral-100">
          <h2 className="text-xl font-bold text-neutral-800 mb-6">Order Success Rate</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData} barSize={12}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
              <YAxis hide />
              <Tooltip />
              <Legend verticalAlign="top" align="right" iconType="circle" />
              <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cancelled" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-neutral-800">Recent Transactions</h2>
          <button onClick={loadDashboardData} className="text-primary-600 text-sm font-semibold hover:underline">
            Refresh Data
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Order ID</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="4" className="px-6 py-4"><div className="h-4 bg-neutral-100 rounded w-full"></div></td>
                  </tr>
                ))
              ) : orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm text-neutral-600">
                    #{order.id.toString().slice(-6).toUpperCase()}
                  </td>
                  <td className="px-6 py-4 font-medium text-neutral-800">
                    {order.user_Id || 'Guest User'}
                  </td>
                  <td className="px-6 py-4 font-bold text-neutral-900">
                    Rs. {order.total_amount || order.total}
                  </td>
                  <td className="px-6 py-4">
                    <Badge status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && orders.length === 0 && (
            <div className="text-center py-12 text-neutral-400">No recent orders found.</div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}