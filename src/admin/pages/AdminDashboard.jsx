import { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { adminOrderAPI, menuAPI } from '../../services/api';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
 
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
 
/* ── Stat card ── */
function StatCard({ label, value, icon, color, loading }) {
  return (
    <div className="bg-white rounded-[14px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.04)] p-5 flex items-center gap-4">
      <div className={`w-[85px] h-[85px] rounded-full flex items-center justify-center text-3xl flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        {loading
          ? <div className="h-10 w-16 bg-gray-200 rounded animate-pulse mb-1" />
          : <p className="text-[46px] font-bold text-[#464255] leading-none">{value ?? '—'}</p>
        }
        <p className="text-[16px] text-[#464255] mt-1 leading-snug">{label}</p>
      </div>
    </div>
  );
}
 
/* ── Status badge ── */
function Badge({ status }) {
  const map = {
    pending:   'bg-blue-100 text-blue-700',
    preparing: 'bg-amber-100 text-amber-700',
    ready:     'bg-green-100 text-green-700',
    completed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`badge ${map[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>
  );
}
 
export default function AdminDashboard() {
  const [stats,   setStats]   = useState({ active: 0, completed: 0, lowStock: 0, revenue: 0 });
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => { load(); }, []);
 
  const load = async () => {
    try {
      setLoading(true);
      const [ordRes, lowRes] = await Promise.allSettled([
        adminOrderAPI.getAllOrders(),
        menuAPI.getLowStock(),
      ]);
      const all  = ordRes.status  === 'fulfilled' ? (ordRes.value.data  || []) : [];
      const low  = lowRes.status  === 'fulfilled' ? (lowRes.value.data  || []) : [];
      const lowCount = Array.isArray(low) ? low.length : (low?.items?.length ?? 0);
 
      const active    = all.filter(o => ['pending','preparing','ready'].includes(o.status)).length;
      const completed = all.filter(o => o.status === 'completed').length;
      const revenue   = all.filter(o => o.status === 'completed').reduce((s, o) => s + (o.total || 0), 0);
      setStats({ active, completed, lowStock: lowCount, revenue });
      setOrders(all);
    } catch {}
    finally { setLoading(false); }
  };
 
  /* chart data from real orders */
  const areaData = DAYS.map((day, i) => {
    const d = orders.filter(o => new Date(o.created_at).getDay() === i);
    return { day, orders: d.length, revenue: d.reduce((s, o) => s + (o.total || 0), 0) };
  });
 
  const barData = DAYS.map((day, i) => ({
    day,
    completed: orders.filter(o => o.status === 'completed' && new Date(o.created_at).getDay() === i).length,
    cancelled: orders.filter(o => o.status === 'cancelled' && new Date(o.created_at).getDay() === i).length,
  }));
 
  return (
    <AdminLayout title="Dashboard">
 
      {/* ── 4 stat cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        <StatCard label="Active orders"      value={stats.active}    icon="📋" color="bg-[#e8f5e9]" loading={loading} />
        <StatCard label="Completed orders"   value={stats.completed} icon="✅" color="bg-[#e3f2fd]" loading={loading} />
        <StatCard label="Low Stock Items"    value={stats.lowStock}  icon="⚠️" color="bg-[#fff8e1]" loading={loading} />
        <StatCard label="Total Revenue (Rs)" value={stats.revenue}   icon="💰" color="bg-[#fce4ec]" loading={loading} />
      </div>
 
      {/* ── Charts ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-5">
 
        {/* Area chart */}
        <div className="xl:col-span-2 bg-white rounded-[14px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.04)] p-5">
          <h2 className="text-2xl font-bold text-[#464255] mb-0.5">Chart Order</h2>
          <p className="text-[16px] text-[#b9bbbd] mb-4">Orders placed each day this week</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={areaData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="og" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#e85a2a" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#e85a2a" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#464255', fontFamily: 'Barlow,sans-serif' }} />
              <YAxis tick={{ fontSize: 12, fill: '#464255', fontFamily: 'Barlow,sans-serif' }} />
              <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12, fontFamily: 'Poppins,sans-serif' }} />
              <Area type="monotone" dataKey="orders" stroke="#e85a2a" strokeWidth={2.5}
                    fill="url(#og)" dot={{ fill: '#e85a2a', r: 4, stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
 
        {/* Bar chart */}
        <div className="bg-white rounded-[14px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.04)] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#464255]">Customer Map</h2>
            <span className="text-xs border border-[#b9bbbd] rounded-xl px-3 py-1 text-[#202020] font-medium">
              Weekly ▾
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barSize={9} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f2f7" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#a3a3a3', fontFamily: 'Barlow,sans-serif' }} />
              <YAxis tick={{ fontSize: 11, fill: '#a3a3a3', fontFamily: 'Barlow,sans-serif' }} />
              <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12, fontFamily: 'Poppins,sans-serif' }} />
              <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'Poppins,sans-serif' }} />
              <Bar dataKey="completed" fill="#f7c604" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cancelled" fill="#ff5b5b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
 
      {/* ── Recent orders table ── */}
      <div className="bg-white rounded-[14px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.04)] p-5">
        <h2 className="text-xl font-bold text-[#464255] mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-100">
              <tr>
                {['Order ID','Customer','Items','Total','Payment','Status'].map(h => (
                  <th key={h} className="table-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(6).fill(0).map((_,i) => (
                    <tr key={i} className="border-b border-gray-50">
                      {Array(6).fill(0).map((__,j) => (
                        <td key={j} className="table-td">
                          <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : orders.slice(0,8).map(o => (
                    <tr key={o.id || o._id} className="border-b border-gray-50 hover:bg-orange-50 transition-colors">
                      <td className="table-td font-medium">
                        #{String(o.id || o._id || '').slice(-6).toUpperCase()}
                      </td>
                      <td className="table-td">{o.user?.name || 'Customer'}</td>
                      <td className="table-td">
                        <div className="flex flex-col gap-0.5">
                          {o.items?.slice(0,2).map((it,i) => (
                            <span key={i} className="text-xs">{it.quantity}× {it.name}</span>
                          ))}
                          {(o.items?.length || 0) > 2 && (
                            <span className="text-xs text-gray-400">+{o.items.length - 2} more</span>
                          )}
                        </div>
                      </td>
                      <td className="table-td font-semibold text-gray-800">Rs. {o.total}</td>
                      <td className="table-td capitalize">{o.payment_method}</td>
                      <td className="table-td"><Badge status={o.status} /></td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
          {!loading && orders.length === 0 && (
            <p className="text-center text-gray-400 py-10 text-sm">No orders yet</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}