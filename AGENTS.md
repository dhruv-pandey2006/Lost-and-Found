# NIET Lost & Found Portal — AI Context & Project Guide

> **This file is automatically read by AI assistants.** It contains the full project context, architecture, decisions, and roadmap so any AI can continue the work seamlessly.

## Problem Statement

Students at NIET (Noida Institute of Engineering and Technology) lose belongings on campus. Currently they rely on:
- WhatsApp groups (chaotic, messages get buried)
- Physical notice boards (outdated)
- Visiting the help desk repeatedly every 2-3 days to check

**This portal solves it** by letting students report lost/found items with photos and characteristics. A smart matching algorithm + AI automatically finds potential matches and notifies the owner — no more repeated trips.

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | React 19 + Vite | Fast dev, modern tooling |
| Styling | Vanilla CSS (no Tailwind) | User is learning CSS fundamentals |
| Routing | React Router v7 | Page navigation |
| State | React Context API | AuthContext, NotificationContext, ToastProvider |
| Storage | localStorage | Demo/prototype — no backend needed yet |
| Icons | Lucide React | Clean, consistent icon set |
| Fonts | Inter (headings) + DM Sans (body) via Google Fonts | Premium typography |

## Design System

NIET-branded color palette defined in `src/styles/variables.css`:
- Primary: `#1a365d` (deep navy)
- Accent: `#d97706` (warm amber)
- Secondary: `#475569` (slate)
- Success: `#059669`, Error: `#e11d48`, Warning: `#f59e0b`

All styles use CSS custom properties: `var(--color-primary)`, `var(--spacing-4)`, etc.

## Architecture & Folder Structure

```
src/
├── main.jsx              # Entry point — imports CSS, seeds demo data
├── App.jsx               # Routes + Context providers wrapper
├── styles/               # Design system (variables, reset, components, layout)
├── components/
│   ├── Common/           # Reusable: Button, Input, Card, Modal, Toast, Badge, ImageUpload, etc.
│   └── Layout/           # Navbar (glassmorphism), Footer, PageLayout
├── pages/                # 15 pages (Landing, Login, Register, Dashboard, etc.)
├── context/              # AuthContext, NotificationContext
├── hooks/                # useForm, useDebounce
├── services/             # storage.js, auth.js, matchingEngine.js, notifications.js
└── utils/                # constants.js, helpers.js, seedData.js
```

## Key Services

### storage.js
- localStorage CRUD abstraction with collections: USERS, LOST_ITEMS, FOUND_ITEMS, MATCHES, CLAIMS, NOTIFICATIONS, SESSION
- Methods: getAll, getById, query, create, update, remove, count
- All collection keys prefixed with `niet_lf_`

### auth.js
- SHA-256 password hashing via Web Crypto API
- Email validation: must be `@niet.co.in`
- Session stored in localStorage as `niet_lf_session`
- Functions: register, login, logout, getCurrentUser, updateProfile, changePassword

### matchingEngine.js
- **Weighted scoring algorithm** comparing lost vs found items:
  - Category: 25% (exact match)
  - Color: 20% (with synonym support: grey=gray, navy=blue, etc.)
  - Text similarity: 25% (Jaccard index on tokenized name+description+brand)
  - Location: 15% (exact campus building match)
  - Date proximity: 15% (decays over 30 days)
- Match threshold: ≥ 55% triggers notification
- Generates human-readable match reasons

### notifications.js
- In-app notification system
- Types: match_found, claim_submitted, claim_approved, claim_rejected, item_resolved

## User Flow

1. **Register** with NIET email → **Login**
2. **Report Lost Item**: title, category, color, brand, description, location, date, photo
3. **Report Found Item**: same fields + "handed to security" toggle
4. **Matching Engine** runs automatically on new reports → creates Match records → sends notifications
5. **Browse/Search** all items with filters
6. **Security receives the item** and sets a verification question about it (something only checkable by actually having the item in hand)
7. **Claim Flow**: claimant answers the verification question Security set → admin reviews → security office handover → resolved

## Roles & Access

| Role | Access |
|------|--------|
| `student` | Report, browse, claim, view own matches/notifications |
| `admin` | All student access + analytics, claim approval/rejection, user management |
| `security` | All student access + approved claims handover, security office inventory |

## Demo Accounts (seeded on first load)

| Role | Email | Password |
|------|-------|----------|
| Student | `student@niet.co.in` | `student123` |
| Student (2nd account, for cross-user testing) | `student2@niet.co.in` | `student123` |
| Admin | `admin@niet.co.in` | `admin123` |
| Security | `security@niet.co.in` | `security123` |

Demo data includes 8-10 sample lost items, 6-8 found items, and pre-computed matches.

## Pages (15 total)

| Page | Route | Purpose |
|------|-------|---------|
| Landing | `/` | Hero, how-it-works, features, stats, CTAs |
| Login | `/login` | Centered auth form |
| Register | `/register` | Registration with email validation |
| Dashboard | `/dashboard` | Stats, quick actions, recent reports, notifications |
| Report Lost | `/report-lost` | Full form with image upload + security questions |
| Report Found | `/report-found` | Found item form with security handover toggle |
| Browse | `/browse` | Gallery of all items with tabs, search, filters |
| Item Detail | `/item/:type/:id` | Full item view with matched items |
| My Reports | `/my-reports` | User's own lost/found items with actions |
| Matches | `/matches` | Side-by-side comparison with match scores |
| Claim | `/claim/:matchId` | Security question verification form |
| Notifications | `/notifications` | Notification center with read/unread |
| Profile | `/profile` | Edit profile, change password |
| Admin Dashboard | `/admin` | Analytics, claim management, user management |
| Security Dashboard | `/security` | Item handover and inventory management |

## What's Been Built ✅

- [x] Complete CSS design system (variables, reset, components, layout)
- [x] All 13 reusable components (Button, Input, Card, Modal, Toast, etc.)
- [x] Layout components (Navbar with glassmorphism, Footer)
- [x] Auth system (register, login, logout, session persistence)
- [x] Storage service (localStorage CRUD)
- [x] Matching engine (weighted scoring algorithm)
- [x] Notification service
- [x] All 15 pages
- [x] Demo data seeding
- [x] React Router setup with protected routes
- [x] Build passes successfully (vite build ✓)

## What's Next / Roadmap 🚧

### Phase 2: AI Integration (Planned)
- **AI Smart Matching**: Send lost+found descriptions to Google Gemini API to get semantic similarity scores (understands "headphones" ≈ "headset")
- Uses free Gemini API tier (15 req/min)
- Fallback to keyword matching if API unavailable
- Need user to get API key from https://aistudio.google.com

### Phase 3: Backend (For Real Deployment)
- Replace localStorage with Node.js + Express + MongoDB
- Architecture is designed for easy swap: just change the service layer files
- Add Cloudinary for image hosting (localStorage has 5-10MB limit)
- Add real email notifications via Nodemailer
- Add WebSocket for real-time notifications

### Phase 4: Polish & Deploy
- Dark mode toggle
- PWA support (offline capability)
- Email verification on registration
- Forgot password flow
- Item expiry (auto-expire after 30 days)
- Advanced search with filters
- Performance optimization (lazy loading pages)

## Coding Conventions

- **CSS**: Vanilla CSS only, use CSS custom properties from `variables.css`
- **Components**: Functional components with hooks, default exports
- **State**: useState for local, Context for global (auth, notifications, toasts)
- **Imports**: Components from `../components/Common/X` or `../components/Layout/X`
- **Icons**: Always from `lucide-react`
- **No inline styles** except truly dynamic values
- **File naming**: PascalCase for components/pages, camelCase for services/utils/hooks
