// ============================================
// AUTHENTICATION MODULE
// ============================================

function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.auth-tab:${tab === 'login' ? 'first-child' : 'last-child'}`).classList.add('active');
    document.getElementById('loginForm').classList.toggle('hidden', tab !== 'login');
    document.getElementById('registerForm').classList.toggle('hidden', tab !== 'register');
    document.getElementById('authError').classList.add('hidden');
}

// Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        await auth.signInWithEmailAndPassword(email, password);
        showToast('Welcome back!', 'success');
    } catch (error) {
        showAuthError(error.message);
    }
});

// Register
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const income = parseFloat(document.getElementById('regIncome').value);
    
    try {
        const cred = await auth.createUserWithEmailAndPassword(email, password);
        
        // Create user profile in Firestore
        await db.collection('users').doc(cred.user.uid).set({
            name: name,
            email: email,
            monthlyIncome: income,
            currency: '?',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            settings: {
                notifications: true,
                darkMode: true,
                budgetAlerts: true
            }
        });

        // Create initial categories
        const defaultCategories = [
            { name: 'Food & Dining', icon: '??', color: '#E74C3C' },
            { name: 'Transportation', icon: '??', color: '#3498DB' },
            { name: 'Shopping', icon: '???', color: '#9B59B6' },
            { name: 'Entertainment', icon: '??', color: '#F39C12' },
            { name: 'Healthcare', icon: '??', color: '#2ECB71' },
            { name: 'Education', icon: '??', color: '#1ABC9C' },
            { name: 'Groceries', icon: '??', color: '#E67E22' },
            { name: 'Personal Care', icon: '??', color: '#FF6B6B' },
            { name: 'Miscellaneous', icon: '??', color: '#95A5A6' }
        ];

        const batch = db.batch();
        defaultCategories.forEach(cat => {
            const ref = db.collection('users').doc(cred.user.uid)
                         .collection('categories').doc();
            batch.set(ref, cat);
        });
        await batch.commit();

        showToast('Account created successfully!', 'success');
    } catch (error) {
        showAuthError(error.message);
    }
});

function showAuthError(message) {
    const el = document.getElementById('authError');
    el.textContent = message;
    el.classList.remove('hidden');
}

function logout() {
    auth.signOut();
    showToast('Logged out', 'info');
}

// Auth State Listener
auth.onAuthStateChanged(async (user) => {
    if (user) {
        document.getElementById('authScreen').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        
        // Load user profile
        const userDoc = await db.collection('users').doc(user.uid).get();
        const userData = userDoc.data();
        
        if (userData) {
            document.getElementById('userName').textContent = userData.name || 'User';
            document.getElementById('userEmail').textContent = user.email;
            document.getElementById('userAvatar').textContent = (userData.name || 'U')[0].toUpperCase();
        }
        
        // Store globally
        window.currentUser = user;
        window.userData = userData;
        
        // Load dashboard
        navigateTo('dashboard');
    } else {
        document.getElementById('authScreen').classList.remove('hidden');
        document.getElementById('mainApp').classList.add('hidden');
        window.currentUser = null;
        window.userData = null;
    }
});
