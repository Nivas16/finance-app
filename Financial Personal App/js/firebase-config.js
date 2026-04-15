// ============================================
// FIREBASE CONFIGURATION
// Replace with YOUR Firebase project config
// ============================================

const firebaseConfig = {
    apiKey: "AIzaSyBleH5uAsLsC6MPQ47-4LnfIUQUslY36yc",
    authDomain: "personal-finance-app-b8f8d.firebaseapp.com",
    projectId: "personal-finance-app-b8f8d",
    storageBucket: "personal-finance-app-b8f8d.firebasestorage.app",
    messagingSenderId: "969722301750",
    appId: "1:969722301750:web:00695bdc5d30cface6f797"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Enable offline persistence
db.enablePersistence().catch(err => {
    console.log('Persistence error:', err.code);
});

console.log('🔥 Firebase initialized');