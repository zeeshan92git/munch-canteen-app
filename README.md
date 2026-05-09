# 🍽️ MUNCH – Food Ordering System (Frontend)

A full-featured food ordering web app built with **React + Vite + Tailwind CSS**, 
designed pixel-perfect from the Figma prototype.

---

## 📱 Screens Included

| Screen | Route |
|--------|-------|
| Splash / Onboarding | `/` |
| Login | `/login` |
| Sign Up (Role + Form) | `/signup` |
| OTP Verification | `/verify-otp` |
| Home (Categories, Recommended, Popular) | `/home` |
| Item Detail | `/item/:id` |
| Cart | `/cart` |
| Order Summary | `/order-summary` |
| Order Tracking (live status) | `/order-tracking` |
| Order History + Reorder | `/orders` |
| Profile (view + edit) | `/profile` |

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set your backend URL
cp .env.example .env.local
# Edit .env.local and set:
# VITE_API_URL=https://your-backend.onrender.com/api

# 3. Start dev server
npm run dev
```

---

## ☁️ Deploy to Vercel

1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project → import your repo
3. Vercel auto-detects Vite. No extra config needed.
4. In Vercel dashboard → **Settings → Environment Variables**, add:
   ```
   VITE_API_URL = https://your-backend.onrender.com/api
   ```
5. Redeploy → done ✅

---

## 🔌 Backend API Contract

Your Render backend must expose these endpoints:

### Auth
| Method | Endpoint | Body |
|--------|----------|------|
| POST | `/api/auth/register` | `{ firstName, lastName, email, password, role, department }` |
| POST | `/api/auth/login` | `{ email, password }` → returns `{ token, user }` |
| POST | `/api/auth/verify-otp` | `{ email, otp }` |
| POST | `/api/auth/resend-otp` | `{ email }` |
| GET  | `/api/auth/me` | (auth header) |
| PUT  | `/api/auth/profile` | `{ firstName, lastName, department, location }` |

### Menu
| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/api/menu` | supports `?category=X&limit=N` |
| GET | `/api/menu/:id` | single item |
| GET | `/api/menu/categories` | returns `[{ name, _id }]` |
| GET | `/api/menu/recommended` | |
| GET | `/api/menu/popular` | |
| GET | `/api/menu/search?q=X` | |

### Cart
| Method | Endpoint | Body |
|--------|----------|------|
| GET    | `/api/cart` | |
| POST   | `/api/cart/add` | `{ menuItemId, quantity }` |
| PUT    | `/api/cart/update` | `{ menuItemId, quantity }` |
| DELETE | `/api/cart/remove/:menuItemId` | |
| DELETE | `/api/cart/clear` | |

All cart responses return `{ items: [...] }` where each item has:
`{ menuItemId, name, price, image, quantity }`

### Orders
| Method | Endpoint | Body |
|--------|----------|------|
| POST   | `/api/orders` | `{ items, notes, paymentMethod }` |
| GET    | `/api/orders/my` | |
| GET    | `/api/orders/:id` | |
| PUT    | `/api/orders/:id/cancel` | |
| POST   | `/api/orders/:id/reorder` | |

Order status values: `placed` → `preparing` → `ready` → `picked_up`

---

## 🎨 Design System

- **Font:** Poppins (400, 500, 600, 700)
- **Primary:** `#e85a2a` (orange-red)
- **Neutral bg:** `#f8f8f4`
- **Border accent:** `#41337a` (inputs)

---

## 📦 Tech Stack

- React 18 + Vite 5
- React Router v6
- Tailwind CSS v3
- Axios (HTTP client)
- Framer Motion (animations)
- React Hot Toast (notifications)
- React Icons
