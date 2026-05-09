import { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { adminOrderAPI, inventoryAPI } from '../../services/api';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';


const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/* ── Stat card component ── */

/* ── Stat card component ── */
function StatCard({ label, value, icon, color, loading }) {
  return (
    <div className="bg-white rounded-[20px] shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-6 flex items-center gap-5 border border-gray-50 h-full">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="flex-grow">
        {loading
          ? <div className="h-10 w-24 bg-gray-100 rounded animate-pulse mb-1" />
          : <p className="text-3xl xl:text-4xl font-extrabold text-[#464255] leading-tight truncate">{value ?? '0'}</p>
        }
        <p className="text-sm font-medium text-[#464255] opacity-70">{label}</p>
      </div>
    </div>
  );
}

/* ── Status badge component ── */

/* ── Status badge component ── */
function Badge({ status }) {
  const map = {
    pending:   'bg-blue-100 text-blue-700',
    preparing: 'bg-orange-100 text-orange-700',
    ready:     'bg-green-100 text-green-700',
    completed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}


export default function AdminDashboard() {
  const [stats, setStats] = useState({ active: 0, completed: 0, lowStock: 0, revenue: 0 });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    loadDashboardData(); 
  }, []);

  const loadDashboardData = async () => {

  useEffect(() => { 
    loadDashboardData(); 
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [ordRes, invRes] = await Promise.allSettled([
        adminOrderAPI.getAllOrders(),
        inventoryAPI.getInventory ? inventoryAPI.getInventory() : Promise.resolve({ data: [] }),
      ]);

      const allOrders = ordRes.status === 'fulfilled' ? (ordRes.value.data?.data || ordRes.value.data || []) : [];
      const inventory = invRes.status === 'fulfilled' ? (invRes.value.data?.data || invRes.value.data || []) : [];
      
      const lowStockCount = inventory.filter(item => (item.stock_quantity ?? item.stock) < 10).length;
      const activeCount = allOrders.filter(o => ['pending', 'preparing', 'ready'].includes(o.status)).length;
      const completedCount = allOrders.filter(o => o.status === 'completed').length;
      const totalRevenue = allOrders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

      setStats({ active: activeCount, completed: completedCount, lowStock: lowStockCount, revenue: totalRevenue });
      setOrders(allOrders);
    } catch (error) {
      console.error("Dashboard Load Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const areaData = DAYS.map((day, i) => {
    const dayOrders = orders.filter(o => new Date(o.created_at).getDay() === i);
    return { day, orders: dayOrders.length };
  });


  const barData = DAYS.map((day, i) => ({
    day,
    completed: orders.filter(o => o.status === 'completed' && new Date(o.created_at).getDay() === i).length,
    cancelled: orders.filter(o => o.status === 'cancelled' && new Date(o.created_at).getDay() === i).length,
  }));


  return (
    /* AdminLayout should ideally use min-h-screen */
    <AdminLayout title="Dashboard">
      {/* Removed "max-w" constraints to ensure edge-to-edge desktop coverage */}
      <div className="w-full min-h-[calc(100vh-64px)] p-6 lg:p-10 bg-[#F9F9F9]">
        
        {/* Stat Cards - Grid expands to full width */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <StatCard label="Active Orders" value={stats.active} icon="📋" color="bg-[#E7F7F2] text-[#00B074]" loading={loading} />
          <StatCard label="Completed" value={stats.completed} icon="✅" color="bg-[#E7ECF7] text-[#2D9CDB]" loading={loading} />
          <StatCard label="Low Stock" value={stats.lowStock} icon="⚠️" color="bg-[#FFF5E6] text-[#FF9900]" loading={loading} />
          <StatCard label="Revenue" value={`Rs ${stats.revenue.toLocaleString()}`} icon="💰" color="bg-[#FFE7E6] text-[#FF5B5B]" loading={loading} />
        </div>

        {/* Charts Section - 2/3 and 1/3 split */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10">
          <div className="xl:col-span-2 bg-white rounded-[20px] p-8 shadow-sm border border-gray-50 flex flex-col">
            <h2 className="text-xl font-extrabold text-[#464255] mb-1">Order Analytics</h2>
            <p className="text-sm text-gray-400 mb-8 font-medium">Weekly order volume overview</p>
            <div className="flex-grow">
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={areaData}>
                  <defs>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e85a2a" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#e85a2a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F2F2" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#A3A3A3', fontSize: 13}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#A3A3A3', fontSize: 13}} />
                  <Tooltip />
                  <Area type="monotone" dataKey="orders" stroke="#e85a2a" fillOpacity={1} fill="url(#colorOrders)" strokeWidth={4} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-[20px] p-8 shadow-sm border border-gray-50 flex flex-col">
            <h2 className="text-xl font-extrabold text-[#464255] mb-8">Success Rate</h2>
            <div className="flex-grow">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={barData} barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F2F2" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#A3A3A3', fontSize: 13}} />
                  <YAxis hide />
                  <Tooltip cursor={{fill: 'transparent'}}/>
                  <Legend verticalAlign="top" align="center" iconType="circle" wrapperStyle={{paddingBottom: '20px'}} />
                  <Bar dataKey="completed" fill="#00B074" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="cancelled" fill="#FF5B5B" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Transactions Table - Spans full width */}
        <div className="bg-white rounded-[20px] shadow-sm border border-gray-50 overflow-hidden mb-10">
          <div className="p-8 flex justify-between items-center bg-white">
            <h2 className="text-xl font-extrabold text-[#464255]">Recent Transactions</h2>
            <button onClick={loadDashboardData} className="text-[#e85a2a] text-sm font-bold hover:underline tracking-tight">
              Refresh Data
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-[#464255] text-xs font-bold uppercase tracking-widest border-y border-gray-100">
                  <th className="px-10 py-5">Order ID</th>
                  <th className="px-10 py-5">Customer ID</th>
                  <th className="px-10 py-5">Amount</th>
                  <th className="px-10 py-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                   Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse"><td colSpan="4" className="px-10 py-6"><div className="h-5 bg-gray-100 rounded w-full"></div></td></tr>
                  ))
                ) : orders.slice(0, 10).map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-all cursor-default">
                    <td className="px-10 py-6 font-bold text-[#2D9CDB] text-sm">
                      #{order.id.toString().slice(-6).toUpperCase()}
                    </td>
                    <td className="px-10 py-6 font-semibold text-[#464255]">
                      UID-{order.user_id || 'GUEST'}
                    </td>
                    <td className="px-10 py-6 font-black text-[#464255]">
                      Rs {order.total_amount}
                    </td>
                    <td className="px-10 py-6">
                      <Badge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && orders.length === 0 && (
              <div className="text-center py-24 text-gray-400 font-medium italic">No recent transactions to display</div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
  }}