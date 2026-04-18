// ============================================
// FIREBASE CONFIGURATION & HELPER FUNCTIONS
// ============================================

// Firebase Config
var firebaseConfig = {
    apiKey: "AIzaSyBleH5uAsLsC6MPQ47-4LnfIUQUslY36yc",
    authDomain: "personal-finance-app-b8f8d.firebaseapp.com",
    projectId: "personal-finance-app-b8f8d",
    storageBucket: "personal-finance-app-b8f8d.firebasestorage.app",
    messagingSenderId: "969722301750",
    appId: "1:969722301750:web:00695bdc5d30cface6f797"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var auth = firebase.auth();
var db = firebase.firestore();

// Fix persistence warning
db.settings({
    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
}).catch(function(err) {
    console.log('Cache settings error:', err.code);
});

console.log('Firebase initialized');

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatCurrency(amount) {
    return 'Rs.' + Number(amount || 0).toLocaleString('en-IN');
}

function showToast(message, type) {
    type = type || 'success';
    var toast = document.getElementById('toast');
    var toastMsg = document.getElementById('toastMessage');
    if (!toast || !toastMsg) return;
    
    toast.className = 'toast ' + type;
    toastMsg.textContent = message;
    
    var iconMap = { success: 'check-circle', error: 'exclamation-circle', info: 'info-circle' };
    toast.querySelector('.toast-icon').className = 'toast-icon fas fa-' + (iconMap[type] || 'check-circle');
    
    toast.classList.remove('hidden');
    setTimeout(function() { toast.classList.add('hidden'); }, 3000);
}

function showSyncStatus(syncing) {
    syncing = syncing || false;
    var el = document.getElementById('syncStatus');
    if (!el) return;
    
    if (syncing) {
        el.innerHTML = '<i class="fas fa-sync fa-spin"></i> Syncing...';
        el.className = 'sync-status syncing';
    } else {
        el.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Synced';
        el.className = 'sync-status';
    }
}

function openModal(html) {
    document.getElementById('modalContent').innerHTML = html;
    document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

function getUID() {
    return window.currentUser.uid;
}

function getUserData() {
    return window.userData || {};
}

// Make functions global
window.formatCurrency = formatCurrency;
window.showToast = showToast;
window.showSyncStatus = showSyncStatus;
window.openModal = openModal;
window.closeModal = closeModal;
window.getUID = getUID;
window.getUserData = getUserData;
