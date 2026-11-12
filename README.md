# ReturnIQ Lite

**Product Return Intelligence for Small Retailers**

---

## Project Details

| Field | Value |
|---|---|
| **Project Name** | ReturnIQ Lite |
| **Student** | Mahendar M |
| **Project ID** | 2102508597 |
| **Course** | Semester 3 — Backend Development CIA-II |
| **Theme** | Product return reason analysis for small retailers |

---

## Problem Statement

Small retailers process product returns without recognising recurring product or supplier problems.
ReturnIQ Lite solves this by maintaining a return log with reason categories, product records, and trend summaries.
Products whose return rate rises above a configurable threshold are automatically flagged with an **ALERT** status.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Backend | Node.js + Express.js |
| Database | MongoDB (Atlas) + Mongoose |
| Validation | express-validator |
| Icons | lucide-react |

> **No Firebase, Supabase, MySQL, PostgreSQL, or SQLite is used.**

---

## Project Structure

```
ReturnIQ-Lite/
├── client/                          # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.jsx           # Sidebar, header, mobile nav, backend status
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx        # KPI cards, alert products, return rate visual
│   │   │   ├── Products.jsx         # Product list with search, filter, edit, delete
│   │   │   ├── AddProduct.jsx       # Add product form
│   │   │   ├── EditProduct.jsx      # Edit existing product
│   │   │   ├── Returns.jsx          # Return log audit table
│   │   │   ├── AddReturn.jsx        # Record a return
│   │   │   ├── Analytics.jsx        # Return reason charts, category breakdown
│   │   │   └── Settings.jsx         # Configure alert threshold
│   │   ├── services/
│   │   │   └── api.js               # Axios base client + all API helpers
│   │   ├── App.jsx                  # React Router routes
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css                # Full CSS design system (tokens, responsive)
│   ├── .env.example
│   └── package.json
│
├── server/                          # Express backend API
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                # Mongoose connection with 3-attempt retry
│   │   ├── models/
│   │   │   ├── Product.js           # Product schema
│   │   │   ├── Return.js            # Return schema (enum reasons)
│   │   │   └── Settings.js          # App settings (alert threshold)
│   │   ├── controllers/
│   │   │   ├── productController.js
│   │   │   ├── returnController.js
│   │   │   ├── settingsController.js
│   │   │   ├── dashboardController.js
│   │   │   └── analyticsController.js
│   │   ├── routes/
│   │   │   ├── productRoutes.js
│   │   │   ├── returnRoutes.js
│   │   │   ├── settingsRoutes.js
│   │   │   ├── dashboardRoutes.js
│   │   │   └── analyticsRoutes.js
│   │   ├── middleware/
│   │   │   ├── productValidator.js
│   │   │   └── returnValidator.js
│   │   ├── utils/
│   │   │   └── returnRate.js        # Return rate + status calculation (never stored in DB)
│   │   ├── seed.js                  # Demo seed data script
│   │   └── server.js                # Express app entry point
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Environment Variables

### Backend — `server/.env`

```
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
CLIENT_URL=http://localhost:5173
```

> Copy `server/.env.example` → `server/.env` and fill in your MongoDB URI.
> **Never commit `.env` to Git.**

### Frontend — `client/.env`

```
VITE_API_URL=http://localhost:5000/api
```

> Copy `client/.env.example` → `client/.env`.

---

## Installation & Setup

### 1. Clone / Open the project

```bash
cd ReturnIQ-Lite
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Configure backend environment

```bash
# Copy the example file
copy .env.example .env
# Edit .env and paste your MongoDB Atlas connection string
```

### 4. Install frontend dependencies

```bash
cd ../client
npm install
```

### 5. Configure frontend environment

```bash
copy .env.example .env
```

---

## Running the Application

### Start the backend (Terminal 1)

```bash
cd server
npm run dev
```

Expected output:
```
MongoDB connected: cluster0.xxxxx.mongodb.net
ReturnIQ Lite server running on port 5000
```

### Start the frontend (Terminal 2)

```bash
cd client
npm run dev
```

Open: **http://localhost:5173**

---

## Seed Demo Data

Load 9 demo products + 26 return records into MongoDB:

```bash
cd server
npm run seed
```

Expected output:
```
EL-BTH-001 | Wireless Bluetooth Headphones  | 240 sold | 50 returned | 20.8% | ALERT
EL-USBC-002| USB-C Fast Charging Cable      | 580 sold | 35 returned | 6.0%  | HEALTHY
CL-MRS-003 | Men's Running Sneakers          | 190 sold | 42 returned | 22.1% | ALERT
CL-WFK-004 | Women's Floral Kurta Set        | 310 sold | 28 returned | 9.0%  | HEALTHY
HM-SSW-005 | Stainless Steel Water Bottle    | 420 sold | 18 returned | 4.3%  | HEALTHY
KT-NSC-006 | Non-Stick Cookware Set          | 145 sold | 32 returned | 22.1% | ALERT
AC-LLB-007 | Leather Laptop Backpack         | 215 sold | 16 returned | 7.4%  | HEALTHY
EL-PBS-008 | Portable Bluetooth Speaker      | 165 sold | 29 returned | 17.6% | ALERT
HM-CBT-009 | Cotton Bath Towel Set           | 530 sold | 22 returned | 4.2%  | HEALTHY

Demo seed complete. ReturnIQ Lite database is ready for demonstration.
```

> **Note:** The seed script clears all existing data before inserting demo data.

---

## REST API Reference

Base URL: `http://localhost:5000`

### Health

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Server health check |

### Products

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products` | List all products (with returnRate + status) |
| GET | `/api/products/:id` | Get single product |
| GET | `/api/products/alerts` | List products above alert threshold |
| POST | `/api/products` | Create a product |
| PUT | `/api/products/:id` | Update a product |
| DELETE | `/api/products/:id` | Delete product + all its returns |

### Returns

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/returns` | List all return records |
| GET | `/api/returns/:id` | Get single return |
| POST | `/api/returns` | Record a return (auto-increments product.totalReturned) |
| DELETE | `/api/returns/:id` | Delete a return (auto-decrements product.totalReturned) |

### Settings

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/settings` | Get current settings (alert threshold) |
| PUT | `/api/settings` | Update alert threshold |

### Dashboard

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/summary` | KPI summary (totalProducts, totalUnitsSold, totalReturns, averageReturnRate, productsWithAlerts) |

### Analytics

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/analytics/summary` | Full analytics (returnsByReason, returnRateByProduct, topReturnedProducts, productsAboveThreshold, categorySummary) |

---

## Return Rate Logic

```
Return Rate = (totalReturned / totalSold) × 100
```

- If `totalSold = 0`, return rate = `0%` (never divide by zero)
- Return rate and status are **calculated dynamically** — never stored in the database
- Default alert threshold: **10%**
- Threshold is configurable via Settings page (range: 0.01% – 100%)

| Condition | Status |
|---|---|
| `returnRate >= threshold` | 🔴 **ALERT** |
| `returnRate < threshold` | 🟢 **HEALTHY** |

---

## Allowed Return Reasons

- Damaged
- Wrong Product
- Size/Fit
- Quality Issue
- Customer Changed Mind
- Late Delivery
- Other

---

## Key Features

- **Dashboard** — 5 live KPI cards, alert products table, return rate visual with threshold comparison
- **Products** — CRUD operations, search by name/code/supplier, filter by category, return rate badge
- **Returns** — Audit log of all return records, delete with automatic product count adjustment
- **Analytics** — Returns by reason (bar chart), return rate by product, category breakdown, top returned products
- **Settings** — Configurable alert threshold with preset buttons (5%, 10%, 15%, 20%, 25%)
- **Responsive** — Works on desktop, tablet, and mobile with collapsible sidebar
- **Backend status** — Live green/red dot in sidebar shows API connectivity

---

## NPM Scripts

### Backend (`server/`)

| Script | Command | Description |
|---|---|---|
| `npm run dev` | `node --watch src/server.js` | Start with auto-restart |
| `npm start` | `node src/server.js` | Start production server |
| `npm run seed` | `node src/seed.js` | Load demo data into MongoDB |

### Frontend (`client/`)

| Script | Command | Description |
|---|---|---|
| `npm run dev` | `vite` | Start development server on port 5173 |
| `npm run build` | `vite build` | Build for production into `client/dist/` |
| `npm run preview` | `vite preview` | Preview production build |

---

## Notes for Evaluators

1. **MongoDB only** — No other database is used anywhere in this project
2. **Input validation** — All POST/PUT endpoints validate inputs using `express-validator`
3. **Error handling** — All errors return structured JSON `{ success: false, message: "..." }`
4. **Return rate is never stored** — Calculated fresh on every request using live threshold
5. **Cascade delete** — Deleting a product removes all its associated return records
6. **Duplicate prevention** — Product codes are unique; duplicate creation returns HTTP 409

---

*ReturnIQ Lite — Mahendar M — Project ID: 2102508597*
