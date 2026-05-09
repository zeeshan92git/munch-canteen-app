import axios from 'axios';
 
const BASE_URL = import.meta.env.VITE_API_URL || 'https://munch-api-8ljq.onrender.com/api/v1';
 
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});
 
/* ── Attach access token to every request ── */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
 
/* ── Auto-refresh on 401 ── */
let isRefreshing = false;
let failedQueue  = [];
 
const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};
 
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }
      original._retry = true;
      isRefreshing    = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        isRefreshing = false;
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(err);
      }
      try {
        const res = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefresh } = res.data.data || res.data;
        localStorage.setItem('token', accessToken);
        if (newRefresh) localStorage.setItem('refreshToken', newRefresh);
        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(err);
  }
);
 

export const authAPI = {
  register: ({ firstName, lastName, email, password, role }) =>
    api.post('/auth/register', {
      name:     `${firstName} ${lastName}`.trim(),
      email,
      password,
      role:     role || 'student',
    }),
 
  login: ({ email, password }) =>
    api.post('/auth/login', { email, password }),
  
  refresh: (refreshToken) =>
    api.post('/auth/refresh', { refreshToken }),
 
  getMe: () => api.get('/auth/me'),
};
 

export const menuAPI = {
  getCategories: () =>
    api.get('/menu/categories'),
 
  getAll: (params = {}) =>
    api.get('/menu/items', { params }),
 
  getById: (item_id) =>
    api.get(`/menu/items/${item_id}`),
 
  searchItems: (search, category = '') =>
    api.get('/menu/items', {
      params: { search, ...(category ? { category } : {}), limit: 30, available: true },
    }),
 
  getPopular: () =>                     
    api.get('/menu/items', { params: { limit: 10, available: true } }),
 
  getRecommended: () =>
    api.get('/recommendations'),
 
  getReviews: (item_id) =>
    api.get(`/menu/items/${item_id}/reviews`),
 
  postReview: (item_id, { rating, comment }) =>
    api.post(`/menu/items/${item_id}/reviews`, { rating, comment }),
  createItem: (data) => 
    api.post('/menu/items', data),

  updateItem: (id, data) => 
    api.patch(`/menu/items/${id}`, data), // Using PATCH as requested

  deleteItem: (id) => 
    api.delete(`/menu/items/${id}`), // Using DELETE as requested

  toggleAvailability: (id, data) => 
    api.patch(`/menu/items/${id}/availability`, data),
};

export const cartAPI = {
  getCart: () =>
    api.get('/cart'),
 
  addItem: (menu_item_id, quantity = 1) =>
    api.post('/cart', { menu_item_id, quantity }),
 
  updateItem: (cart_item_id, quantity) =>
    api.patch(`/cart/${cart_item_id}`, { quantity }),
 
  removeItem: (cart_item_id) =>
    api.delete(`/cart/${cart_item_id}`),
 
  clearCart: () =>
    api.delete('/cart')
};
 
export const orderAPI = {
  getMyOrders: () =>
    api.get('/orders'),
 
  placeOrder: ({ items, paymentMethod, notes }) =>
    api.post('/orders', {
      items,                        // [{ item_id, quantity }]
      payment_method: paymentMethod, // 'cash' | 'easypaisa' | 'jazzcash'
      notes:          notes || '',
    }),
 
  getOrderById: (order_id) =>
    api.get(`/orders/${order_id}`),
 
  cancelOrder: (order_id) =>
    api.post(`/orders/${order_id}/cancel`),
};

export const notifAPI = {

  getAll:   () => api.get('/notifications'),

  markRead: () => api.post('/notifications/mark-read'),

};

 
/* ── Admin Specific APIs ── */
export const adminOrderAPI = {
  // Get all orders for the admin dashboard
  getAllOrders: (params = {}) => 
    api.get('/admin/orders', { params }),

  // Update order status (placed -> preparing -> ready, etc.)
  updateStatus: (order_id, status) => 
    api.patch(`/admin/orders/${order_id}/status`, { status }),

  // Get statistics for the dashboard (total sales, order counts)
  getStats: () => 
    api.get('/admin/stats'),

  // Get data for reports/charts
  getReports: (range = '7d') => 
    api.get('/admin/reports', { params: { range } }),
};

export const inventoryAPI = {
  
  // POST /api/v1/admin/inventory/{item_id}/adjust
  adjustStock: (itemId, adjustment, notes) => 
    api.post(`/admin/inventory/${itemId}/adjust`, { adjustment, notes }),

  // GET /api/v1/admin/inventory/logs/{item_id}
  getLogs: (itemId) => 
    api.get(`/admin/inventory/logs/${itemId}`),
};


export default api;