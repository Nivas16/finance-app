# 💰 Personal Finance Manager

A comprehensive personal finance web app with AI-powered advice, built with vanilla JavaScript and Firebase.

## Features

### 📊 Financial Tracking
- **Multiple Bank EMIs** - Track home loans, car loans, personal loans
- **Personal EMIs** - Money borrowed from friends/family
- **Society Loans & Installments** - Chit funds, society loans
- **Bills & Utilities** - Electricity, water, internet, mobile
- **Room Rent** - Track rent payments
- **Other Expenses** - Categorized expense tracking

### 🤖 AI-Powered Features
- **AI Financial Advisor** - Chat with AI about your finances
- **Purchase Decision Advisor** - Should you buy now or wait?
- **Loan Closure Planner** - When will you be debt-free?
- **Smart Insights** - Automated financial health analysis

### 💡 Money Saving Guide
- 50/30/20 budgeting rule
- Debt avalanche strategy
- Investment ladder for beginners
- Daily saving tips

### 🛠️ Admin Panel
- Profile management
- Data export/import (JSON)
- Notification settings
- Data reset option

## Setup Instructions

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Name it (e.g., "personal-finance-app")
4. Enable Google Analytics (optional)

### 2. Enable Authentication

1. In Firebase Console → Authentication → Sign-in method
2. Enable **Email/Password**

### 3. Create Firestore Database

1. Firebase Console → Firestore Database → Create database
2. Start in **test mode** (or set rules below)
3. Choose your region

### 4. Get Firebase Config

1. Project Settings → General → Your apps → Web
2. Click "Add app" (web icon `</>`)
3. Copy the config object

### 5. Update Config

Open `js/firebase-config.js` and replace with your config:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};