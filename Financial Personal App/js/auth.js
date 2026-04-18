// ============================================
// AUTHENTICATION MODULE - FIXED
// ============================================

// Login tab switching
function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    
    if (tab === 'login') {
        document.querySelector('.auth-tab:first-child').classList.add('active');
    } else {
        document.querySelector('.auth-tab:last-child').classList.add('active');
    }
    
    document.getElementById('loginForm').classList.toggle('hidden', tab !== 'login');
    document.getElementById('registerForm').classList.toggle('hidden', tab !== 'register');
    document.getElementById('authError').classList.add('hidden');
}

// Make functions globally available
window.switchAuthTab = switchAuthTab;

// Login Form Submit
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
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
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('regName').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;
            
            if (!name || !email || !password) {
                showAuthError('Please fill all fields');
                return;
            }
            
            try {
                showSyncStatus(true);
                const cred = await auth.createUserWithPassword(email, password);
                
                // Create user profile in Firestore
                await db.collection('users').doc(cred.user.uid).set({
                    name: name,
                    email: email,
                    monthlyIncome: 0,
                    currency: '₹',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    settings: {
                        notifications: true,
                        darkMode: true,
                        budgetAlerts: true
                    }
                });
                
                // Create default categories
                const defaultCategories = [
                    { name: 'Food & Dining', icon: '🍔', color: '#E74C3C' },
                    { name: 'Transportation', icon: '🚌', color: '#3498DB' },
                    { name: 'Shopping', icon: '🛍️', color: '#9B59B6' },
                    { name: 'Entertainment', icon: '🎬', color: '#F39C12' },
                    { name: 'Healthcare', icon: '🏥', color: '#2ECB71' },
                    { name: 'Education', icon: '📚', color: '#1ABC9C' },
                    { name: 'Groceries', icon: '🛒', color: '#E67E22' },
                    { name: 'Personal Care', icon: '💄', color: '#FF6B6B' },
                    { name: 'Miscellaneous', icon: '📦', color: '#95A5A6' }
                ];
                
                const batch = db.batch();
                defaultCategories.forEach(cat => {
                    const ref = db.collection('users').doc(cred.user.uid).collection('categories').doc();
                    batch.set(ref, cat);
                });
                await batch.commit();
                
                showToast('Account created! Please login.', 'success');
                switchAuthTab('login');
            } catch (error) {
                showAuthError(error.message);
                console.error('Register error:', error);
            }
            showSyncStatus(false);
        });
    }
});

function showAuthError(message) {
    const el = document.getElementById('authError');
    if (el) {
        el.textContent = message;
        el.classList.remove('hidden');
    }
}

function logout() {
    auth.signOut().then(() => {
        showToast('Logged out', 'info');
    }).catch(err => {
        console.error('Logout error:', err);
    });
}

// Auth State Listener
auth.onAuthStateChanged(async (user) => {
    if (user) {
        document.getElementById('authScreen').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        
        try {
            const userDoc = await db.collection('users').doc(user.uid).get();
            const userData = userDoc.data();
            
            if (userData) {
                document.getElementById('userName').textContent = userData.name || 'User';
                document.getElementById('userEmail').textContent = user.email;
                document.getElementById('userAvatar').textContent = (userData.name || 'U')[0].toUpperCase();
                
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
        document.getElementById('authScreen').classList.remove('hidden');
        document.getElementById('mainApp').classList.add('hidden');
        window.currentUser = null;
        window.userData = null;
    }
});

// Salary setup modal
function showSalarySetupModal(uid) {
    openModal(`
        <div class="modal-header">
            <h2><i class="fas fa-wallet"></i> Welcome! Set Up Your Income</h2>
        </div>
        <div class="modal-body">
            <p style="color: var(--text-secondary); margin-bottom: 20px;">
                To help you track your finances, please enter your monthly income. You can edit this anytime from Admin Panel.
            </p>
            <form id="salarySetupForm">
                <div class="form-group">
                    <label><i class="fas fa-rupee-sign"></i> Monthly Income (₹)</label>
                    <input type="number" id="setupIncome" placeholder="50000" required min="0">
                </div>
                <div class="form-group">
                    <label><i class="fas fa-calendar"></i> Pay Day (Day of Month)</label>
                    <select id="setupPayDay">
                        ${Array.from({length: 28}, (_, i) => 
                            `<option value="${i + 1}">${i + 1}</option>`
                        ).join('')}
                    </select>
                </div>
                <button type="submit" class="btn btn-success btn-full mt-15">
                    <i class="fas fa-check"></i> Set Up Income
                </button>
            </form>
        </div>
    `);
    
    document.getElementById('salarySetupForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const income = parseFloat(document.getElementById('setupIncome').value);
        const payDay = parseInt(document.getElementById('setupPayDay').value);
        
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

// Make functions global
window.logout = logout;
window.showSalarySetupModal = showSalarySetupModal;
