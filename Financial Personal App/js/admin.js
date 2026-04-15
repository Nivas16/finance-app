// ============================================
// ADMIN PANEL MODULE
// ============================================

async function renderAdmin(container) {
    const userData = getUserData();
    
    container.innerHTML = `
        <div class="admin-grid">
            <!-- Profile Settings -->
            <div class="admin-card">
                <h3><i class="fas fa-user" style="color:var(--primary)"></i> Profile Settings</h3>
                <form onsubmit="updateProfile(event)">
                    <div class="form-group">
                        <label>Full Name</label>
                        <input type="text" id="adminName" value="${userData?.name || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" value="${window.currentUser?.email || ''}" disabled>
                    </div>
                    <div class="form-group">
                        <label>Monthly Income (₹)</label>
                        <input type="number" id="adminIncome" value="${userData?.monthlyIncome || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Currency</label>
                        <select id="adminCurrency">
                            <option value="₹" ${userData?.currency === '₹' ? 'selected' : ''}>₹ INR</option>
                            <option value="$" ${userData?.currency === '$' ? 'selected' : ''}>$ USD</option>
                            <option value="€" ${userData?.currency === '€' ? 'selected' : ''}>€ EUR</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary btn-full mt-10">
                        <i class="fas fa-save"></i> Update Profile
                    </button>
                </form>
            </div>
            
            <!-- Data Management -->
            <div class="admin-card">
                <h3><i class="fas fa-database" style="color:var(--warning)"></i> Data Management</h3>
                <div class="flex-col gap-10">
                    <button class="btn btn-outline btn-full" onclick="exportData()">
                        <i class="fas fa-download"></i> Export All Data (JSON)
                    </button>
                    <button class="btn btn-outline btn-full" onclick="document.getElementById('importFile').click()">
                        <i class="fas fa-upload"></i> Import Data
                    </button>
                    <input type="file" id="importFile" accept=".json" style="display:none" onchange="importData(event)">
                    <button class="btn btn-danger btn-full" onclick="resetAllData()">
                        <i class="fas fa-exclamation-triangle"></i> Reset All Data
                    </button>
                </div>
                <div class="mt-15">
                    <div class="fs-12 text-muted mb-10">Data Statistics:</div>
                    <div id="dataStats">
                        <div class="flex-center"><div class="spinner"></div></div>
                    </div>
                </div>
            </div>
            
            <!-- Notification Settings -->
            <div class="admin-card">
                <h3><i class="fas fa-bell" style="color:var(--info)"></i> Notification Settings</h3>
                <div class="flex-col gap-15">
                    <label class="flex gap-10" style="cursor:pointer">
                        <input type="checkbox" id="notifBudget" ${userData?.settings?.budgetAlerts !== false ? 'checked' : ''}> 
                        <span>Budget alerts when overspending</span>
                    </label>
                    <label class="flex gap-10" style="cursor:pointer">
                        <input type="checkbox" id="notifEMI" ${userData?.settings?.emiReminders !== false ? 'checked' : ''}> 
                        <span>EMI payment reminders</span>
                    </label>
                    <label class="flex gap-10" style="cursor:pointer">
                        <input type="checkbox" id="notifSavings" ${userData?.settings?.savingsTips !== false ? 'checked' : ''}> 
                        <span>Weekly savings tips</span>
                    </label>
                </div>
                <button class="btn btn-primary btn-full mt-15" onclick="saveNotifSettings()">
                    <i class="fas fa-save"></i> Save Settings
                </button>
            </div>
            
            <!-- Quick Actions -->
            <div class="admin-card">
                <h3><i class="fas fa-bolt" style="color:var(--secondary)"></i> Quick Actions</h3>
                <div class="flex-col gap-10">
                    <button class="btn btn-outline btn-full" onclick="resetMonthlyBills()">
                        <i class="fas fa-redo"></i> Reset Monthly Bills (Mark Unpaid)
                    </button>
                    <button class="btn btn-outline btn-full" onclick="navigateTo('ai-advisor')">
                        <i class="fas fa-robot"></i> Get AI Financial Checkup
                    </button>
                    <button class="btn btn-outline btn-full" onclick="generateMonthlyReport()">
                        <i class="fas fa-file-pdf"></i> Generate Monthly Report
                    </button>
                </div>
            </div>
            
            <!-- App Info -->
            <div class="admin-card">
                <h3><i class="fas fa-info-circle" style="color:var(--primary)"></i> App Information</h3>
                <div class="flex-col gap-10">
                    <div class="flex-between">
                        <span class="text-muted">Version</span>
                        <span class="fw-600">2.0.0</span>
                    </div>
                    <div class="flex-between">
                        <span class="text-muted">Database</span>
                        <span class="fw-600 text-success">Firebase Connected</span>
                    </div>
                    <div class="flex-between">
                        <span class="text-muted">Offline Mode</span>
                        <span class="fw-600 text-success">Enabled</span>
                    </div>
                    <div class="flex-between">
                        <span class="text-muted">Last Sync</span>
                        <span class="fw-600">${new Date().toLocaleTimeString()}</span>
                    </div>
                    <div class="flex-between">
                        <span class="text-muted">Built with</span>
                        <span class="fw-600">❤️ Vanilla JS + Firebase</span>
                    </div>
                </div>
            </div>
            
            <!-- Theme -->
            <div class="admin-card">
                <h3><i class="fas fa-palette" style="color:#9B59B6"></i> Appearance</h3>
                <p class="text-muted fs-12 mb-15">Dark mode is default. More themes coming soon!</p>
                <div class="flex-col gap-10">
                    <div style="display:flex;gap:10px">
                        <div style="width:40px;height:40px;border-radius:8px;background:var(--gradient-1);cursor:pointer" 
                             title="Purple (Default)"></div>
                        <div style="width:40px;height:40px;border-radius:8px;background:linear-gradient(135deg,#2ECB71,#27AE60);cursor:pointer" 
                             title="Green"></div>
                        <div style="width:40px;height:40px;border-radius:8px;background:linear-gradient(135deg,#E74C3C,#C0392B);cursor:pointer" 
                             title="Red"></div>
                        <div style="width:40px;height:40px;border-radius:8px;background:linear-gradient(135deg,#3498DB,#2980B9);cursor:pointer" 
                             title="Blue"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Load data stats
    loadDataStats();
}

async function loadDataStats() {
    const uid = getUID();
    const collections = ['income', 'bankEMIs', 'personalEMIs', 'installments', 'bills', 'rent', 'expenses'];
    
    let html = '';
    for (const col of collections) {
        try {
            const snap = await db.collection('users').doc(uid).collection(col).get();
            html += `<div class="flex-between mb-10">
                <span class="text-muted">${col}</span>
                <span class="tag tag-info">${snap.size} records</span>
            </div>`;
        } catch (err) {
            html += `<div class="flex-between mb-10">
                <span class="text-muted">${col}</span>
                <span class="tag tag-danger">Error</span>
            </div>`;
        }
    }
    
    document.getElementById('dataStats').innerHTML = html;
}

async function updateProfile(e) {
    e.preventDefault();
    showSyncStatus(true);
    
    try {
        await db.collection('users').doc(getUID()).update({
            name: document.getElementById('adminName').value,
            monthlyIncome: parseFloat(document.getElementById('adminIncome').value),
            currency: document.getElementById('adminCurrency').value
        });
        
        // Update global
        window.userData.name = document.getElementById('adminName').value;
        window.userData.monthlyIncome = parseFloat(document.getElementById('adminIncome').value);
        
        document.getElementById('userName').textContent = document.getElementById('adminName').value;
        document.getElementById('userAvatar').textContent = document.getElementById('adminName').value[0].toUpperCase();
        
        showToast('Profile updated!', 'success');
    } catch (err) {
        showToast('Error updating profile', 'error');
    }
    showSyncStatus(false);
}

async function saveNotifSettings() {
    showSyncStatus(true);
    try {
        await db.collection('users').doc(getUID()).update({
            'settings.budgetAlerts': document.getElementById('notifBudget').checked,
            'settings.emiReminders': document.getElementById('notifEMI').checked,
            'settings.savingsTips': document.getElementById('notifSavings').checked
        });
        showToast('Settings saved!', 'success');
    } catch (err) {
        showToast('Error saving', 'error');
    }
    showSyncStatus(false);
}

async function exportData() {
    const uid = getUID();
    const exportObj = {};
    const collections = ['income', 'bankEMIs', 'personalEMIs', 'installments', 'bills', 'rent', 'expenses'];
    
    try {
        for (const col of collections) {
            const snap = await db.collection('users').doc(uid).collection(col).get();
            exportObj[col] = [];
            snap.forEach(doc => exportObj[col].push({ id: doc.id, ...doc.data() }));
        }
        
        // Add user profile
        const userDoc = await db.collection('users').doc(uid).get();
        exportObj.profile = userDoc.data();
        
        const dataStr = JSON.stringify(exportObj, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `finance-data-${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        showToast('Data exported successfully!', 'success');
    } catch (err) {
        showToast('Export failed', 'error');
    }
}

async function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        const text = await file.text();
        const data = JSON.parse(text);
        const uid = getUID();
        
        if (!confirm('This will ADD imported data to your existing data. Continue?')) return;
        
        showSyncStatus(true);
        const collections = ['income', 'bankEMIs', 'personalEMIs', 'installments', 'bills', 'rent', 'expenses'];
        
        for (const col of collections) {
            if (data[col] && Array.isArray(data[col])) {
                for (const item of data[col]) {
                    const { id, ...itemData } = item;
                    await db.collection('users').doc(uid).collection(col).add(itemData);
                }
            }
        }
        
        showToast('Data imported successfully!', 'success');
        showSyncStatus(false);
    } catch (err) {
        showToast('Import failed - Invalid file', 'error');
        showSyncStatus(false);
    }
    
    event.target.value = '';
}

async function resetAllData() {
    if (!confirm('⚠️ This will DELETE ALL your financial data. This cannot be undone! Are you sure?')) return;
    if (!confirm('FINAL WARNING: All EMIs, bills, expenses, income data will be permanently deleted. Continue?')) return;
    
    showSyncStatus(true);
    const uid = getUID();
    const collections = ['income', 'bankEMIs', 'personalEMIs', 'installments', 'bills', 'rent', 'expenses'];
    
    try {
        for (const col of collections) {
            const snap = await db.collection('users').doc(uid).collection(col).get();
            const batch = db.batch();
            snap.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
        }
        
        showToast('All data reset!', 'info');
        navigateTo('dashboard');
    } catch (err) {
        showToast('Error resetting data', 'error');
    }
    showSyncStatus(false);
}

async function resetMonthlyBills() {
    if (!confirm('Mark all bills as unpaid for the new month?')) return;
    showSyncStatus(true);
    
    try {
        const uid = getUID();
        const snap = await db.collection('users').doc(uid).collection('bills').get();
        const batch = db.batch();
        snap.forEach(doc => batch.update(doc.ref, { paid: false }));
        await batch.commit();
        showToast('All bills marked as unpaid', 'success');
    } catch (err) {
        showToast('Error', 'error');
    }
    showSyncStatus(false);
}

function generateMonthlyReport() {
    showToast('Generating report...', 'info');
    setTimeout(() => {
        navigateTo('reports');
        showToast('Report loaded!', 'success');
    }, 500);
}