// ============================================
// HELPER FUNCTIONS - SHARED BETWEEN ALL MODULES
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

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function monthsBetween(date1, date2) {
    var d1 = new Date(date1);
    var d2 = new Date(date2);
    return (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
}

// Make functions global
window.formatCurrency = formatCurrency;
window.showToast = showToast;
window.showSyncStatus = showSyncStatus;
window.openModal = openModal;
window.closeModal = closeModal;
window.getUID = getUID;
window.getUserData = getUserData;
window.generateId = generateId;
window.monthsBetween = monthsBetween;

console.log('Helper functions loaded');
