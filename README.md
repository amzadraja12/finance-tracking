# Finance Tracker App

A React + Vite application for tracking recurring deposits and investments with Firebase backend. This app helps you manage and monitor financial investments for multiple users with daily or monthly payment plans.

## 🚀 Live Demo

**Visit the live application:** [https://rajshree-tracker.web.app](https://rajshree-tracker.web.app)

## Features

- **Dashboard View** - View all users and their financial status at a glance
- **User Management** - Add new users with investment plans (daily/monthly)
- **Payment Tracking** - Track payment status and due amounts for each user
- **User Details** - Detailed view with payment history for each user
- **Payment Recording** - Add payments for each user
- **Search & Filter** - Search users and filter by payment status (All/Due/Paid)
- **Delete Users** - Remove users from the system
- **Data Persistence** - Firebase Firestore for cloud data storage
- **Authentication** - Secure login with Google authentication
- **Admin Access** - Restricted access for authorized administrators only
- **Progressive Web App (PWA)** - Installable app with offline capabilities
- **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

- **Frontend:** React 19, Vite
- **Backend:** Firebase Firestore, Firebase Authentication
- **Routing:** React Router DOM v7
- **Icons:** Lucide React
- **Date Handling:** date-fns
- **Styling:** Custom CSS
- **PWA:** Vite PWA Plugin, Service Worker
- **Deployment:** Firebase Hosting

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase project (free tier)

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Authentication

The app uses Google authentication with admin-only access. Only authorized email addresses can access the application:

- amzadraja12@gmail.com
- amzadraja123@gmail.com

## Progressive Web App (PWA)

The app is fully PWA-enabled and can be installed on supported devices:

- **Install on Desktop:** Click the install button in the browser address bar
- **Install on Mobile:** Use the "Add to Home Screen" option
- **Offline Support:** Basic offline functionality with service worker caching

## Project Structure

```
src/
├── main.jsx                 # React app entry point with PWA service worker
├── App.jsx                 # Main app component with routing and modal logic
├── firebase.js             # Firebase configuration
├── index.css              # Global styles
├── main.jsx               # App bootstrap
├── pages/
│   ├── Dashboard.jsx      # Main dashboard with user cards and summary
│   └── UserDetails.jsx   # User details page with payment history
├── components/
│   └── AddUserForm.jsx   # Modal form for adding new users
├── context/
│   └── AuthContext.jsx   # Authentication context provider
├── styles/
│   ├── Dashboard.css    # Dashboard page styling
│   ├── AddUserForm.css  # Add user form styling
│   └── UserDetails.css # User details page styling
└── utils/
    ├── financeLogic.js  # Financial calculations (expected, paid, due amounts)
    └── storage.js       # Firebase Firestore CRUD operations
public/
├── manifest.webmanifest   # PWA manifest file
├── sw.js                 # Service worker for PWA
├── icon-192.svg          # PWA icon (192x192)
├── icon-512.svg          # PWA icon (512x512)
└── favicon.svg           # Favicon
```

## Usage

### Adding a User

1. Click the "Add User" button on the dashboard
2. Fill in the user details:
   - **Full Name** - User's full name
   - **Start Date** - Investment start date
   - **Plan Type** - Daily or Monthly
   - **Amount per Cycle** - Amount to be paid per cycle (in ₹)
3. Click "Save" to add the user

### Recording a Payment

1. Click on a user's card to open their details page
2. Click "Add Payment" button
3. Enter the payment amount and date
4. Click "Save" to record the payment

### Viewing Status

The dashboard shows:
- **Total Expected** - Total amount expected from all users
- **Total Paid** - Total amount received
- **Total Due** - Total outstanding amount

Each user card shows:
- User name
- Plan type (Daily/Monthly)
- Amount per cycle
- Expected/Paid/Due amounts
- Status indicator (Paid/Due)

## Deployment

The app is deployed using Firebase Hosting:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy to hosting
firebase deploy --only hosting
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## License

MIT
