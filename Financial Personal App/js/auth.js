// Auth State Listener
auth.onAuthStateChanged(async (user) => {

    if (user) {
        console.log("✅ User logged in");

        // Show main app
        document.getElementById('authScreen').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');

        // Load user profile
        const userDoc = await db.collection('users').doc(user.uid).get();
        const userData = userDoc.data();

        if (userData) {
            document.getElementById('userName').textContent = userData.name || 'User';
            document.getElementById('userEmail').textContent = user.email;
            document.getElementById('userAvatar').textContent =
                (userData.name || 'U')[0].toUpperCase();
        }

        // Store globally
        window.currentUser = user;
        window.userData = userData;

        // 🔥 INIT NAVIGATION HERE (IMPORTANT)
        initNavigation();
        navigateTo('dashboard');

    } else {
        console.log("❌ No user");

        document.getElementById('authScreen').classList.remove('hidden');
        document.getElementById('mainApp').classList.add('hidden');

        window.currentUser = null;
        window.userData = null;
    }
});
