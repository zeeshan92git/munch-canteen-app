import { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { adminOrderAPI } from '../../services/api';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from 'recharts';

const DAYS  = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const COLORS = ['#e85a2a','#f7c604','#ff5b5b','#00b074','#41337a'];

export default function AdminReports() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [range,   setRange]   = useState('week'); // week | month

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const r = await adminOrderAPI.getAllOrders();
      setOrders(r.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  const completed = orders.filter(o => o.status === 'completed');
  const totalRev  = completed.reduce((s, o) => s + (o.total_amount || 0), 0);
  const totalRev  = completed.reduce((s, o) => s + (o.total_amount || 0), 0);
  const avgOrder  = completed.length ? Math.round(totalRev / completed.length) : 0;

  /* Weekly data */
  const weekData = DAYS.map((day, i) => {
  const d  = orders.filter(o => new Date(o.created_at).getDay() === i);
  const cd = d.filter(o => o.status === 'completed');
  return {
    day,
    orders:    d.length,
    revenue:   cd.reduce((s, o) => s + (o.total_amount || 0), 0), // Fixed field name
    completed: cd.length,
    cancelled: d.filter(o => o.status === 'cancelled').length,
  };
});

  /* Monthly data */
  const monthData = MONTHS.map((m, i) => {
  const d  = orders.filter(o => new Date(o.created_at).getMonth() === i);
  const cd = d.filter(o => o.status === 'completed');
  return {
    month: m,
    orders:  d.length,
    revenue: cd.reduce((s, o) => s + (o.total_amount || 0), 0), // Fixed field name
  };
});

  /* Payment method breakdown */
  const payMap = {};
orders.forEach(o => { 
  const method = o.payment_method || 'Cash'; // Default to Cash if null
  payMap[method] = (payMap[method] || 0) + 1; 
});
  const pieData = Object.entries(payMap).map(([name, value]) => ({ name: name || 'unknown', value }));

  /* Status breakdown */
  const statusMap = {};
  orders.forEach(o => { statusMap[o.status] = (statusMap[o.status] || 0) + 1; });

  const chartData = range === 'week' ? weekData : monthData;
  const xKey      = range === 'week' ? 'day' : 'month';

  return (
    <AdminLayout title="Reports">

      {/* Summary cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Total Orders',     value: orders.length,    icon: '📋', c: 'bg-blue-50'   },
          { label: 'Completed Orders', value: completed.length, icon: '✅', c: 'bg-green-50'  },
          { label: 'Total Revenue',    value: `Rs. ${totalRev}`,icon: '💰', c: 'bg-orange-50' },
          { label: 'Avg Order Value',  value: `Rs. ${avgOrder}`,icon: '📊', c: 'bg-purple-50' },
        ].map(({ label, value, icon, c }) => (
          <div key={label} className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${c}`}>
              {icon}
            </div>
            <div>
              {loading
                ? <div className="h-7 w-20 bg-gray-200 rounded animate-pulse mb-1" />
                : <p className="text-2xl font-bold text-[#464255]">{value}</p>
              }
              <p className="text-xs text-gray-500 leading-snug mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Range toggle */}
      <div className="flex gap-2 mb-4">
        {['week','month'].map(r => (
          <button key={r} onClick={() => setRange(r)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize border transition-colors
                               ${range === r ? 'bg-primary-600 text-white border-primary-600'
                                             : 'bg-white text-gray-600 border-gray-200 hover:border-primary-400'}`}>
            This {r}
          </button>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">

        {/* Revenue line chart */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-lg font-bold text-[#464255] mb-4">Revenue ({range})</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#464255' }} />
              <YAxis tick={{ fontSize: 11, fill: '#464255' }} />
              <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
              <Line type="monotone" dataKey="revenue" stroke="#e85a2a" strokeWidth={2.5}
                    dot={{ fill: '#e85a2a', r: 3 }} name="Revenue (Rs)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders bar chart */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-lg font-bold text-[#464255] mb-4">Orders ({range})</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#464255' }} />
              <YAxis tick={{ fontSize: 11, fill: '#464255' }} />
              <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
              <Bar dataKey="orders" fill="#e85a2a" radius={[4,4,0,0]} name="Total Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

       
        {/* Status breakdown */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-lg font-bold text-[#464255] mb-4">Order Status Breakdown</h2>
          <div className="flex flex-col gap-3">
            {Object.entries(statusMap).map(([status, count]) => {
              const pct = orders.length ? Math.round((count / orders.length) * 100) : 0;
              const barC = {
                pending:   'bg-blue-400', preparing: 'bg-amber-400',
                ready:     'bg-green-400', completed: 'bg-emerald-500', cancelled: 'bg-red-400',
              }[status] || 'bg-gray-400';
              return (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize font-medium text-gray-700">{status}</span>
                    <span className="text-gray-500">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${barC} transition-all duration-500`}
                         style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {Object.keys(statusMap).length === 0 && (
              <p className="text-center text-gray-400 text-sm py-6">No data</p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}