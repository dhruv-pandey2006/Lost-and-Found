# 🔍 NIET Lost & Found Portal

A smart campus Lost & Found portal for **NIET (Noida Institute of Engineering and Technology)** that uses an intelligent matching algorithm to automatically reunite students with their lost belongings.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Open **http://localhost:5173** in your browser.

## 🔑 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Student | `student@niet.co.in` | `student123` |
| Admin | `admin@niet.co.in` | `admin123` |
| Security | `security@niet.co.in` | `security123` |

## ✨ Features

- **Report Lost/Found Items** with photos, categories, and detailed descriptions
- **AI-Ready Smart Matching** — weighted algorithm scores items on category, color, description, location & date
- **Ownership Verification** — security questions to prove item ownership before claiming
- **Real-time Notifications** — get alerted when your item gets matched
- **Admin Dashboard** — analytics, claim management, user roles
- **Security Desk** — physical handover tracking and inventory
- **Responsive Design** — works on mobile, tablet, and desktop

## 🛠️ Tech Stack

- **React 19** + **Vite** — modern build tooling
- **Vanilla CSS** — custom design system with CSS variables
- **React Router v7** — client-side navigation
- **localStorage** — demo data persistence (backend-ready architecture)
- **Lucide React** — icons

## 📁 Project Structure

```
src/
├── components/Common/    # Reusable UI components
├── components/Layout/    # Navbar, Footer, PageLayout
├── pages/                # 15 application pages
├── context/              # Auth & Notification state
├── services/             # Storage, Auth, Matching Engine
├── hooks/                # useForm, useDebounce
├── utils/                # Constants, helpers, seed data
└── styles/               # CSS design system
```

## 👨‍💻 Built By

NIET Students — Solving campus problems with code.
