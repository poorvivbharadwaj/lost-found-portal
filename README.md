# 🎓 Lost & Found Campus Portal

A full-stack web application for managing lost and found items on a college campus, with AI-powered image validation, smart matching, and email notifications.

---

## 🗂 Project Structure

```
lost-found-portal/
├── backend/                  # Node.js + Express API
│   ├── middleware/
│   │   ├── aiMatching.js     # Fuse.js matching + category detection
│   │   ├── auth.js           # JWT middleware
│   │   ├── cloudinary.js     # Image upload (Multer + Cloudinary)
│   │   └── email.js          # Nodemailer notifications
│   ├── models/
│   │   └── index.js          # Mongoose schemas (LostItem, FoundItem, Admin)
│   ├── routes/
│   │   ├── admin.js          # Admin CRUD + approval routes
│   │   ├── auth.js           # Login + JWT verify
│   │   ├── foundItems.js     # Found item CRUD + auto-matching
│   │   ├── lostItems.js      # Lost item CRUD
│   │   └── search.js         # Fuse.js search + filters
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/                 # React.js app
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── common/
    │   │   │   └── SkeletonCard.js      # Loading skeleton
    │   │   ├── forms/
    │   │   │   └── ImageUpload.js       # Drag-and-drop image upload
    │   │   ├── items/
    │   │   │   ├── ItemCard.js          # Card with image/name/date
    │   │   │   └── ItemModal.js         # Full detail popup
    │   │   └── layout/
    │   │       ├── Navbar.js            # Top nav + search + filters
    │   │       └── Sidebar.js           # Category sidebar
    │   ├── context/
    │   │   └── AuthContext.js           # Admin auth state
    │   ├── pages/
    │   │   ├── HomePage.js              # Main split-view page
    │   │   ├── ReportLost.js            # Lost item form
    │   │   ├── ReportFound.js           # Found item form
    │   │   ├── AdminLogin.js            # Admin login
    │   │   └── AdminPanel.js            # Admin dashboard
    │   ├── utils/
    │   │   ├── api.js                   # Axios instance + all endpoints
    │   │   └── helpers.js               # Date, validation, AI helpers
    │   ├── App.js
    │   ├── index.css                    # Global dark theme styles
    │   └── index.js
    ├── package.json
    └── tailwind.config.js
```

---

## ⚙️ Prerequisites

- **Node.js** v18+ 
- **npm** v9+
- **MongoDB Atlas** account (free tier) → [https://cloud.mongodb.com](https://cloud.mongodb.com)
- **Cloudinary** account (free) → [https://cloudinary.com](https://cloudinary.com)
- **Gmail App Password** (for email notifications)

---

## 🚀 Setup Instructions

### Step 1 — Clone the project

```bash
# Navigate into the project
cd lost-found-portal
```

---

### Step 2 — Backend Setup

```bash
cd backend
npm install
```

Create your `.env` file:

```bash
cp .env.example .env
```

Fill in `.env`:

```env
# MongoDB Atlas — get from cloud.mongodb.com
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/lostfound?retryWrites=true&w=majority

# JWT — any long random string
JWT_SECRET=your_super_secret_key_change_this_in_production

# Cloudinary — dashboard.cloudinary.com → Settings → API Keys
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Gmail SMTP — use an App Password (not your real password)
# Gmail → Account → Security → 2FA → App Passwords → Generate
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx

# Admin credentials (change these!)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# Server
PORT=5000
FRONTEND_URL=http://localhost:3000
```

Start the backend:

```bash
npm run dev       # Development (with nodemon)
# or
npm start         # Production
```

Backend runs on: `http://localhost:5000`

---

### Step 3 — Frontend Setup

```bash
cd ../frontend
npm install
```

Create `.env` (optional — proxy is already set in package.json):

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm start
```

Frontend runs on: `http://localhost:3000`

---

## 🌐 API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/lost` | Get approved lost items |
| GET | `/api/lost/:id` | Get single lost item |
| POST | `/api/lost` | Report a lost item (multipart/form-data) |
| GET | `/api/found` | Get approved found items |
| GET | `/api/found/:id` | Get single found item |
| POST | `/api/found` | Report a found item (multipart/form-data) |
| GET | `/api/search?q=&category=&type=` | Search + filter items |
| POST | `/api/auth/login` | Admin login → returns JWT |

### Admin Endpoints (JWT Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Stats overview |
| GET | `/api/admin/lost` | All lost items (pending + approved) |
| GET | `/api/admin/found` | All found items |
| PATCH | `/api/admin/lost/:id/approve` | Approve + email reporter |
| PATCH | `/api/admin/found/:id/approve` | Approve found item |
| PATCH | `/api/admin/lost/:id/reject` | Reject lost item |
| PATCH | `/api/admin/found/:id/reject` | Reject found item |
| DELETE | `/api/admin/lost/:id` | Delete lost item |
| DELETE | `/api/admin/found/:id` | Delete found item |

---

## 🗄️ Database Schemas

### LostItem
```js
{
  reporterName: String (required),
  email:        String (required, validated),
  phone:        String (optional, validated),
  itemName:     String (required),
  description:  String (required, min 20 chars),
  category:     Enum ['id_card','electronics','books','documents','other'],
  lostDate:     Date  (required),
  imageUrl:     String (Cloudinary URL),
  approved:     Boolean (default: false),
  matched:      Boolean (default: false),
  status:       Enum ['pending','approved','rejected','resolved'],
  createdAt:    Date (auto)
}
```

### FoundItem
```js
{
  finderName:    String (required),
  description:   String (required),
  category:      Enum [...same as above],
  foundLocation: String (default: 'Room No 405'),
  contactEmail:  String (default: 'lostfound@college.edu'),
  contactPhone:  String (default: '+91-XXXXXXXXXX'),
  foundDate:     Date (auto),
  imageUrl:      String,
  approved:      Boolean,
  matched:       Boolean,
  status:        Enum [...],
  createdAt:     Date (auto)
}
```

---

## 🤖 AI Features

### 1. Image Validation (Client-Side)
- Rejects files named `selfie`, `face`, `portrait`, etc.
- Rejects files under 5KB (too small to be a real photo)
- Rejects files over 5MB
- Shows preview before upload

### 2. Category Auto-Detection
Keyword matching against item name + description:
- `id_card` → "id", "card", "student", "library", "badge"
- `electronics` → "phone", "laptop", "charger", "earphones", "calculator"
- `books` → "book", "notes", "record", "assignment", "lab", "practical"
- `documents` → "marksheet", "hall ticket", "aadhar", "pan", "certificate"

### 3. Smart Matching (Fuse.js)
When a Found item is submitted:
1. Loads all approved, unmatched Lost items
2. Runs Fuse.js fuzzy search on: item name (50%), description (30%), category (20%)
3. Filters by date proximity (within 14 days)
4. If match score ≥ 40%:
   - Marks both items as `matched: true`
   - Sends email notification to the person who reported the lost item

---

## 🔐 Admin Panel

**URL:** `http://localhost:3000/admin/login`

**Default credentials:**
- Username: `admin`  
- Password: `admin123`

**Change these** in your `.env` file before deploying!

**Admin can:**
- View dashboard stats (total lost/found, pending approvals, matches)
- Approve or reject pending reports
- Delete fake/spam reports
- Filter items by status (pending / approved / rejected)

---

## 📧 Email Notifications

Emails are sent when:
1. **Item Approved** → Email sent to the reporter (lost items)
2. **Match Found** → Email sent to the person who lost the item

**Setup Gmail App Password:**
1. Go to: Google Account → Security → 2-Step Verification → App Passwords
2. Create a new App Password (select "Mail")
3. Paste the generated password into `.env` as `EMAIL_PASS`

---

## 🚢 Deployment

### Option A — Deploy to Render.com (Free)

**Backend:**
1. Push to GitHub
2. New Web Service on Render → Connect repo → Root dir: `backend`
3. Build: `npm install`, Start: `npm start`
4. Add all `.env` variables in Render's Environment panel

**Frontend:**
1. New Static Site → Root dir: `frontend`
2. Build: `npm run build`, Publish: `build`
3. Add env var: `REACT_APP_API_URL=https://your-backend.onrender.com/api`

### Option B — Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli
railway login
railway init
railway up
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6 |
| Styling | Tailwind CSS + custom CSS variables |
| UI Fonts | Syne (headings), Outfit (body), JetBrains Mono (code) |
| HTTP Client | Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (via Mongoose) |
| Auth | JSON Web Tokens (JWT) |
| Image Storage | Cloudinary |
| File Upload | Multer + multer-storage-cloudinary |
| Email | Nodemailer (Gmail SMTP) |
| Smart Search | Fuse.js |
| Notifications | react-hot-toast |
| Date Handling | date-fns |

---

## 🐛 Troubleshooting

| Problem | Fix |
|---------|-----|
| `MongoDB connection error` | Check `MONGODB_URI` in `.env` — include your password |
| `Cannot POST /api/lost` | Backend not running — `cd backend && npm run dev` |
| Images not uploading | Verify Cloudinary credentials in `.env` |
| Email not sending | Use Gmail App Password, not your real password |
| Admin login fails | Default is `admin` / `admin123` or check `ADMIN_USERNAME` env |
| CORS error | Set `FRONTEND_URL=http://localhost:3000` in backend `.env` |

---

## 📱 Features Summary

- ✅ Dark theme UI with glassmorphism cards
- ✅ Split-view home (Lost | Found)
- ✅ Category sidebar (ID Cards, Electronics, Books, Documents)
- ✅ Smart search with Fuse.js fuzzy matching
- ✅ Filter by category + date range
- ✅ Lost item report form with validation
- ✅ Found item form with fixed location + contact
- ✅ Image upload with drag-and-drop + preview
- ✅ Client-side AI image validation
- ✅ Server-side category auto-detection
- ✅ Auto-matching when found item submitted
- ✅ Email notification on approval + match
- ✅ Admin panel with JWT authentication
- ✅ Admin approve/reject/delete
- ✅ Item detail modal popup
- ✅ Skeleton loading states
- ✅ Toast notifications
- ✅ Fully mobile responsive
- ✅ MongoDB Atlas cloud database
- ✅ Cloudinary image hosting

---

*Built for campus use — help reunite students with their lost belongings! 🎓*
