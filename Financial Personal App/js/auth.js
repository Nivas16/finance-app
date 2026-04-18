// ============================================
// AUTHENTICATION MODULE
// ============================================

// Helper functions (inline to avoid loading issues)
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

// Switch between login and register tabs
function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(function(t) { t.classList.remove('active'); });
    
    if (tab === 'login') {
        document.querySelector('.auth-tab:first-child').classList.add('active');
    } else {
        document.querySelector('.auth-tab:last-child').classList.add('active');
    }
    
    document.getElementById('loginForm').classList.toggle('hidden', tab !== 'login');
    document.getElementById('registerForm').classList.toggle('hidden', tab !== 'register');
    document.getElementById('authError').classList.add('hidden');
}

window.switchAuthTab = switchAuthTab;

// Login Form Handler
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    var email = document.getElementById('loginEmail').value;
    var password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showAuthError('Please enter email and password');
        return;
    }
    
    try {
        showSyncStatus(true);
        await auth.signInWithEmailAndPassword(email, password);
        showToast('Welcome back!', 'success');
    } catch (error) {
        showAuthError(error.message);
        console.error('Login error:', error);
    }
    showSyncStatus(false);
});

// Register Form Handler
document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    var name = document.getElementById('regName').value;
    var email = document.getElementById('regEmail').value;
    var password = document.getElementById('regPassword').value;
    
    if (!name || !email || !password) {
        showAuthError('Please fill all fields');
        return;
    }
    
    try {
        showSyncStatus(true);
        var cred = await auth.createUserWithEmailAndPassword(email, password);
        
        // Create user profile in Firestore
        await db.collection('users').doc(cred.user.uid).set({
            name: name,
            email: email,
            monthlyIncome: 0,
            currency: 'Rs.',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            settings: {
                notifications: true,
                darkMode: true,
                budgetAlerts: true
            }
        });
        
        showToast('Account created! Please login.', 'success');
        switchAuthTab('login');
    } catch (error) {
        showAuthError(error.message);
        console.error('Register error:', error);
    }
    showSyncStatus(false);
});

// Show auth error message
function showAuthError(message) {
    var el = document.getElementById('authError');
    if (el) {
        el.textContent = message;
        el.classList.remove('hidden');
    }
}

// Logout function
function logout() {
    auth.signOut().then(function() {
        showToast('Logged out', 'info');
    }).catch(function(err) {
        console.error('Logout error:', err);
    });
}

window.logout = logout;

// Auth State Listener
auth.onAuthStateChanged(async function(user) {
    if (user) {
        // User is logged in
        document.getElementById('authScreen').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        
        try {
            // Load user profile from Firestore
            var userDoc = await db.collection('users').doc(user.uid).get();
            var userData = userDoc.data();
            
            if (userData) {
                // Update UI with user info
                document.getElementById('userName').textContent = userData.name || 'User';
                document.getElementById('userEmail').textContent = user.email;
                document.getElementById('userAvatar').textContent = (userData.name || 'U')[0].toUpperCase();
                
                // Store globally
                window.currentUser = user;
                window.userData = userData;
                
                // Check if first time user needs salary setup
                if (userData && !userData.hasCompletedSetup && userData.monthlyIncome === 0) {
                    showSalarySetupModal(user.uid);
                }
                
                // Load dashboard
                navigateTo('dashboard');
            }
        } catch (err) {
            console.error('Error loading user data:', err);
        }
    } else {
        // User is logged out
        document.getElementById('authScreen').classList.remove('hidden');
        document.getElementById('mainApp').classList.add('hidden');
        window.currentUser = null;
        window.userData = null;
    }
});

// Salary setup modal for new users
function showSalarySetupModal(uid) {
    var options = '';
    for (var i = 1; i <= 28; i++) {
        options += '<option value="' + i + '">' + i + '</option>';
    }
    
    openModal('<div class="modal-header"><h2><i class="fas fa-wallet"></i> Welcome! Set Up Your Income</h2></div>' +
        '<div class="modal-body">' +
        '<p style="color: var(--text-secondary); margin-bottom: 20px;">To help you track your finances, please enter your monthly income. You can edit this anytime from Admin Panel.</p>' +
        '<form id="salarySetupForm">' +
        '<div class="form-group"><label><i class="fas fa-rupee-sign"></i> Monthly Income (Rs.)</label><input type="number" id="setupIncome" placeholder="50000" required min="0"></div>' +
        '<div class="form-group"><label><i class="fas fa-calendar"></i> Pay Day (Day of Month)</label><select id="setupPayDay">' + options + '</select></div>' +
        '<button type="submit" class="btn btn-success btn-full mt-15"><i class="fas fa-check"></i> Set Up Income</button></form></div>');
    
    document.getElementById('salarySetupForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        var income = parseFloat(document.getElementById('setupIncome').value);
        var payDay = parseInt(document.getElementById('setupPayDay').value);
        
        showSyncStatus(true);
        try {
            await db.collection('users').doc(uid).update({
                monthlyIncome: income,
                payDay: payDay,
                hasCompletedSetup: true,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            await db.collection('users').doc(uid).collection('income').add({
                source: 'Salary',
                amount: income,
                type: 'Salary',
                date: 'Monthly',
                payDay: payDay,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            closeModal();
            showToast('Income set up successfully!', 'success');
            
            window.userData.monthlyIncome = income;
        } catch (error) {
            showToast('Error saving: ' + error.message, 'error');
        }
        showSyncStatus(false);
    });
}

window.showSalarySetupModal = showSalarySetupModal;

console.log('Auth module loaded');
