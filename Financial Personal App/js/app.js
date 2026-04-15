// ============================================
// APP.JS - Navigation, Helpers & Page Modules
// ============================================

// ---- Global State ----
let currentPage = 'dashboard';
let currentUser = null;
let userData = null;

// ---- Wait for DOM ----
document.addEventListener('DOMContentLoaded', () => {
    console.log('📱 App.js loaded');
    initNavigation();
});

// ============================================
// NAVIGATION SYSTEM
// ============================================
function initNavigation() {
    console.log('🧭 Initializing navigation...');

    // Get ALL sidebar links
    const navLinks = document.querySelectorAll('.nav-link');
    console.log(`Found ${navLinks.length} nav links`);

    if (navLinks.length === 0) {
        console.error('❌ No .nav-link elements found! Check your HTML sidebar.');
        return;
    }

    navLinks.forEach(link => {
        // Remove any existing listeners by cloning
        const newLink = link.cloneNode(true);
        link.parentNode.replaceChild(newLink, link);

        newLink.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const page = newLink.getAttribute('data-page');
            console.log(`🔗 Nav link clicked: ${page}`);

            if (page) {
                navigateTo(page);
            } else {
                console.error('❌ No data-page attribute on link:', newLink);
            }
        });
    });

    // Also handle mobile sidebar close
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }
}

function navigateTo(page) {
    console.log(`📄 Navigating to: ${page}`);

    // Validate user is logged in
    const uid = getUID();
    if (!uid) {
        console.error('❌ No user logged in, cannot navigate');
        return;
    }

    currentPage = page;

    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === page) {
            link.classList.add('active');
        }
    });

    // Update page title
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        pageTitle.textContent = getPageTitle(page);
    }

    // Get main content area
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) {
        console.error('❌ #mainContent element not found!');
        return;
    }

    // Show loading
    mainContent.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;height:300px;">
            <i class="fas fa-spinner fa-spin" style="font-size:2rem;color:var(--primary);"></i>
            <span style="margin-left:12px;color:var(--text-secondary);">Loading ${getPageTitle(page)}...</span>
        </div>
    `;

    // Close mobile sidebar if open
    closeSidebar();

    // Route to correct page renderer
    try {
        switch (page) {
            case 'dashboard':
                renderDashboard(uid);
                break;
            case 'income':
                renderIncomePage(uid);
                break;
            case 'bank-emis':
                renderBankEMIPage(uid);
                break;
            case 'personal-emis':
                renderPersonalEMIPage(uid);
                break;
            case 'installments':
                renderInstallmentsPage(uid);
                break;
            case 'bills':
                renderBillsPage(uid);
                break;
            case 'rent':
                renderRentPage(uid);
                break;
            case 'expenses':
                renderExpensesPage(uid);
                break;
            case 'ai-advisor':
                renderAIAdvisorPage(uid);
                break;
            case 'loan-planner':
                renderLoanPlannerPage(uid);
                break;
            case 'savings-guide':
                renderSavingsGuidePage(uid);
                break;
            case 'purchase-advisor':
                renderPurchaseAdvisorPage(uid);
                break;
            case 'reports':
                renderReportsPage(uid);
                break;
            case 'admin':
                renderAdminPage(uid);
                break;
            default:
                console.error(`❌ Unknown page: ${page}`);
                mainContent.innerHTML = `
                    <div style="text-align:center;padding:60px 20px;">
                        <i class="fas fa-exclamation-triangle" style="font-size:3rem;color:var(--warning);"></i>
                        <h2 style="margin-top:16px;color:var(--text-primary);">Page Not Found</h2>
                        <p style="color:var(--text-secondary);margin-top:8px;">The page "${page}" doesn't exist.</p>
                        <button onclick="navigateTo('dashboard')" class="btn btn-primary" style="margin-top:20px;">
                            Go to Dashboard
                        </button>
                    </div>
                `;
        }
    } catch (error) {
        console.error(`❌ Error rendering page "${page}":`, error);
        mainContent.innerHTML = `
            <div style="text-align:center;padding:60px 20px;">
                <i class="fas fa-bug" style="font-size:3rem;color:var(--danger);"></i>
                <h2 style="margin-top:16px;color:var(--text-primary);">Error Loading Page</h2>
                <p style="color:var(--text-secondary);margin-top:8px;">${error.message}</p>
                <button onclick="navigateTo('dashboard')" class="btn btn-primary" style="margin-top:20px;">
                    Go to Dashboard
                </button>
            </div>
        `;
    }
}

function getPageTitle(page) {
    const titles = {
        'dashboard': 'Dashboard',
        'income': 'Income',
        'bank-emis': 'Bank EMIs',
        'personal-emis': 'Personal EMIs',
        'installments': 'Installments',
        'bills': 'Bills',
        'rent': 'Rent',
        'expenses': 'Other Expenses',
        'ai-advisor': 'AI Financial Advisor',
        'loan-planner': 'Loan Planner',
        'savings-guide': 'Savings Guide',
        'purchase-advisor': 'Purchase Advisor',
        'reports': 'Reports',
        'admin': 'Admin Panel'
    };
    return titles[page] || 'Dashboard';
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('show');
}

function openSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.add('open');
    if (overlay) overlay.classList.add('show');
}

// ============================================
// HELPER FUNCTIONS (Global)
// ============================================
function getUID() {
    if (firebase.auth().currentUser) {
        return firebase.auth().currentUser.uid;
    }
    return null;
}

function getUserData() {
    return userData;
}

function formatCurrency(amount) {
    if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
    const num = Number(amount);
    return '₹' + num.toLocaleString('en-IN', {
        maximumFractionDigits: 0
    });
}

function showToast(message, type = 'info') {
    // Remove existing toast
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    if (type === 'warning') icon = 'exclamation-triangle';

    toast.innerHTML = `<i class="fas fa-${icon}"></i> ${message}`;
    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Auto remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function openModal(html) {
    let modal = document.getElementById('appModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'appModal';
        modal.className = 'modal-overlay';
        document.body.appendChild(modal);
    }
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" onclick="closeModal()">
                <i class="fas fa-times"></i>
            </button>
            ${html}
        </div>
    `;
    modal.classList.add('show');
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

function closeModal() {
    const modal = document.getElementById('appModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

function showSyncStatus(syncing) {
    let indicator = document.getElementById('syncIndicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'syncIndicator';
        indicator.style.cssText = 'position:fixed;top:10px;right:10px;z-index:10000;padding:6px 14px;border-radius:20px;font-size:12px;display:none;';
        document.body.appendChild(indicator);
    }

    if (syncing) {
        indicator.innerHTML = '<i class="fas fa-sync fa-spin"></i> Syncing...';
        indicator.style.display = 'block';
        indicator.style.background = 'var(--primary)';
        indicator.style.color = '#fff';
    } else {
        indicator.innerHTML = '<i class="fas fa-check"></i> Synced';
        indicator.style.background = 'var(--success)';
        indicator.style.color = '#fff';
        indicator.style.display = 'block';
        setTimeout(() => {
            indicator.style.display = 'none';
        }, 2000);
    }
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// ============================================
// GET ALL FINANCIAL DATA
// ============================================
async function getAllFinancialData(uid) {
    console.log('📊 Fetching all financial data...');
    const db = firebase.firestore();
    const userRef = db.collection('users').doc(uid);

    try {
        const [income, bankEMIs, personalEMIs, installments, bills, rent, expenses] = await Promise.all([
            userRef.collection('income').get().then(snap => snap.docs.map(d => ({ id: d.id, ...d.data() }))).catch(() => []),
            userRef.collection('bankEMIs').get().then(snap => snap.docs.map(d => ({ id: d.id, ...d.data() }))).catch(() => []),
            userRef.collection('personalEMIs').get().then(snap => snap.docs.map(d => ({ id: d.id, ...d.data() }))).catch(() => []),
            userRef.collection('installments').get().then(snap => snap.docs.map(d => ({ id: d.id, ...d.data() }))).catch(() => []),
            userRef.collection('bills').get().then(snap => snap.docs.map(d => ({ id: d.id, ...d.data() }))).catch(() => []),
            userRef.collection('rent').get().then(snap => snap.docs.map(d => ({ id: d.id, ...d.data() }))).catch(() => []),
            userRef.collection('expenses').get().then(snap => snap.docs.map(d => ({ id: d.id, ...d.data() }))).catch(() => [])
        ]);

        const data = { income, bankEMIs, personalEMIs, installments, bills, rent, expenses };
        console.log('✅ Financial data loaded:', {
            income: income.length,
            bankEMIs: bankEMIs.length,
            personalEMIs: personalEMIs.length,
            installments: installments.length,
            bills: bills.length,
            rent: rent.length,
            expenses: expenses.length
        });
        return data;
    } catch (error) {
        console.error('❌ Error fetching financial data:', error);
        return { income: [], bankEMIs: [], personalEMIs: [], installments: [], bills: [], rent: [], expenses: [] };
    }
}

// ============================================
// INCOME PAGE
// ============================================
async function renderIncomePage(uid) {
    console.log('💰 Rendering Income page...');
    const mainContent = document.getElementById('mainContent');
    const db = firebase.firestore();

    let incomeList = [];
    try {
        const snap = await db.collection('users').doc(uid).collection('income').orderBy('date', 'desc').get();
        incomeList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
        // If orderBy fails (no index), try without
        try {
            const snap = await db.collection('users').doc(uid).collection('income').get();
            incomeList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (e2) {
            console.error('Error loading income:', e2);
        }
    }

    const totalIncome = incomeList.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

    mainContent.innerHTML = `
        <div class="page-header">
            <div>
                <h2>Income Sources</h2>
                <p class="text-secondary">Track your salary and other income</p>
            </div>
            <button class="btn btn-primary" onclick="showAddIncomeForm()">
                <i class="fas fa-plus"></i> Add Income
            </button>
        </div>

        <div class="stats-row">
            <div class="stat-card">
                <div class="stat-icon" style="background:rgba(46,204,113,0.15);color:var(--success);">
                    <i class="fas fa-wallet"></i>
                </div>
                <div class="stat-info">
                    <span class="stat-label">Total Monthly Income</span>
                    <span class="stat-value">${formatCurrency(totalIncome)}</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background:rgba(52,152,219,0.15);color:var(--primary);">
                    <i class="fas fa-stream"></i>
                </div>
                <div class="stat-info">
                    <span class="stat-label">Income Sources</span>
                    <span class="stat-value">${incomeList.length}</span>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h3><i class="fas fa-list"></i> All Income Sources</h3>
            </div>
            <div class="card-body">
                ${incomeList.length === 0 ? `
                    <div class="empty-state">
                        <i class="fas fa-coins"></i>
                        <p>No income sources added yet</p>
                        <button class="btn btn-primary btn-sm" onclick="showAddIncomeForm()">Add Your First Income</button>
                    </div>
                ` : `
                    <div class="table-responsive">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Source</th>
                                    <th>Amount</th>
                                    <th>Type</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${incomeList.map(inc => `
                                    <tr>
                                        <td><strong>${inc.source || inc.name || 'N/A'}</strong></td>
                                        <td class="text-success"><strong>${formatCurrency(inc.amount)}</strong></td>
                                        <td><span class="badge">${inc.type || 'Monthly'}</span></td>
                                        <td>${inc.date || '-'}</td>
                                        <td>
                                            <button class="btn btn-sm btn-icon" onclick="editIncome('${inc.id}')" title="Edit">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-sm btn-icon btn-danger" onclick="deleteIncome('${inc.id}')" title="Delete">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        </div>
    `;
}

function showAddIncomeForm() {
    openModal(`
        <h3 style="margin-bottom:20px;"><i class="fas fa-plus-circle"></i> Add Income Source</h3>
        <form id="addIncomeForm" onsubmit="saveIncome(event)">
            <div class="form-group">
                <label>Source Name *</label>
                <input type="text" id="incomeSource" class="form-input" placeholder="e.g., Salary, Freelance" required>
            </div>
            <div class="form-group">
                <label>Amount (₹) *</label>
                <input type="number" id="incomeAmount" class="form-input" placeholder="Enter amount" required min="0">
            </div>
            <div class="form-group">
                <label>Type</label>
                <select id="incomeType" class="form-input">
                    <option value="Monthly">Monthly</option>
                    <option value="Weekly">Weekly</option>
                    <option value="One-time">One-time</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Investment">Investment</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            <div class="form-group">
                <label>Date</label>
                <input type="date" id="incomeDate" class="form-input" value="${new Date().toISOString().split('T')[0]}">
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i> Save Income
                </button>
            </div>
        </form>
    `);
}

async function saveIncome(event) {
    event.preventDefault();
    const uid = getUID();
    if (!uid) return;

    const data = {
        source: document.getElementById('incomeSource').value.trim(),
        amount: Number(document.getElementById('incomeAmount').value),
        type: document.getElementById('incomeType').value,
        date: document.getElementById('incomeDate').value,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        showSyncStatus(true);
        await firebase.firestore().collection('users').doc(uid).collection('income').add(data);
        showSyncStatus(false);
        closeModal();
        showToast('Income added successfully!', 'success');
        renderIncomePage(uid);
    } catch (error) {
        console.error('Error saving income:', error);
        showToast('Error saving income: ' + error.message, 'error');
    }
}

async function deleteIncome(id) {
    if (!confirm('Are you sure you want to delete this income source?')) return;
    const uid = getUID();
    try {
        showSyncStatus(true);
        await firebase.firestore().collection('users').doc(uid).collection('income').doc(id).delete();
        showSyncStatus(false);
        showToast('Income deleted', 'success');
        renderIncomePage(uid);
    } catch (error) {
        showToast('Error deleting: ' + error.message, 'error');
    }
}

async function editIncome(id) {
    const uid = getUID();
    try {
        const doc = await firebase.firestore().collection('users').doc(uid).collection('income').doc(id).get();
        const data = doc.data();

        openModal(`
            <h3 style="margin-bottom:20px;"><i class="fas fa-edit"></i> Edit Income</h3>
            <form onsubmit="updateIncome(event, '${id}')">
                <div class="form-group">
                    <label>Source Name *</label>
                    <input type="text" id="editIncomeSource" class="form-input" value="${data.source || data.name || ''}" required>
                </div>
                <div class="form-group">
                    <label>Amount (₹) *</label>
                    <input type="number" id="editIncomeAmount" class="form-input" value="${data.amount || ''}" required min="0">
                </div>
                <div class="form-group">
                    <label>Type</label>
                    <select id="editIncomeType" class="form-input">
                        <option value="Monthly" ${data.type === 'Monthly' ? 'selected' : ''}>Monthly</option>
                        <option value="Weekly" ${data.type === 'Weekly' ? 'selected' : ''}>Weekly</option>
                        <option value="One-time" ${data.type === 'One-time' ? 'selected' : ''}>One-time</option>
                        <option value="Freelance" ${data.type === 'Freelance' ? 'selected' : ''}>Freelance</option>
                        <option value="Investment" ${data.type === 'Investment' ? 'selected' : ''}>Investment</option>
                        <option value="Other" ${data.type === 'Other' ? 'selected' : ''}>Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Date</label>
                    <input type="date" id="editIncomeDate" class="form-input" value="${data.date || ''}">
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Update</button>
                </div>
            </form>
        `);
    } catch (error) {
        showToast('Error loading income data', 'error');
    }
}

async function updateIncome(event, id) {
    event.preventDefault();
    const uid = getUID();
    try {
        showSyncStatus(true);
        await firebase.firestore().collection('users').doc(uid).collection('income').doc(id).update({
            source: document.getElementById('editIncomeSource').value.trim(),
            amount: Number(document.getElementById('editIncomeAmount').value),
            type: document.getElementById('editIncomeType').value,
            date: document.getElementById('editIncomeDate').value
        });
        showSyncStatus(false);
        closeModal();
        showToast('Income updated!', 'success');
        renderIncomePage(uid);
    } catch (error) {
        showToast('Error updating: ' + error.message, 'error');
    }
}

// ============================================
// BILLS PAGE
// ============================================
async function renderBillsPage(uid) {
    console.log('📝 Rendering Bills page...');
    const mainContent = document.getElementById('mainContent');
    const db = firebase.firestore();

    let billsList = [];
    try {
        const snap = await db.collection('users').doc(uid).collection('bills').get();
        billsList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
        console.error('Error loading bills:', e);
    }

    const totalBills = billsList.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
    const paidBills = billsList.filter(b => b.paid);
    const unpaidBills = billsList.filter(b => !b.paid);

    mainContent.innerHTML = `
        <div class="page-header">
            <div>
                <h2>Monthly Bills</h2>
                <p class="text-secondary">Track electricity, water, internet & more</p>
            </div>
            <button class="btn btn-primary" onclick="showAddBillForm()">
                <i class="fas fa-plus"></i> Add Bill
            </button>
        </div>

        <div class="stats-row">
            <div class="stat-card">
                <div class="stat-icon" style="background:rgba(231,76,60,0.15);color:var(--danger);">
                    <i class="fas fa-file-invoice-dollar"></i>
                </div>
                <div class="stat-info">
                    <span class="stat-label">Total Bills</span>
                    <span class="stat-value">${formatCurrency(totalBills)}</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background:rgba(46,204,113,0.15);color:var(--success);">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="stat-info">
                    <span class="stat-label">Paid</span>
                    <span class="stat-value">${paidBills.length}/${billsList.length}</span>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-body">
                ${billsList.length === 0 ? `
                    <div class="empty-state">
                        <i class="fas fa-file-invoice"></i>
                        <p>No bills added yet</p>
                        <button class="btn btn-primary btn-sm" onclick="showAddBillForm()">Add First Bill</button>
                    </div>
                ` : `
                    <div class="table-responsive">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Bill Name</th>
                                    <th>Amount</th>
                                    <th>Type</th>
                                    <th>Due Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${billsList.map(bill => `
                                    <tr>
                                        <td><strong>${bill.name || 'N/A'}</strong></td>
                                        <td>${formatCurrency(bill.amount)}</td>
                                        <td><span class="badge">${bill.type || 'Other'}</span></td>
                                        <td>${bill.dueDate || '-'}</td>
                                        <td>
                                            <button class="btn btn-sm ${bill.paid ? 'btn-success' : 'btn-warning'}"
                                                onclick="toggleBillPaid('${bill.id}', ${!bill.paid})">
                                                <i class="fas fa-${bill.paid ? 'check-circle' : 'clock'}"></i>
                                                ${bill.paid ? 'Paid' : 'Unpaid'}
                                            </button>
                                        </td>
                                        <td>
                                            <button class="btn btn-sm btn-icon btn-danger" onclick="deleteBill('${bill.id}')">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        </div>
    `;
}

function showAddBillForm() {
    openModal(`
        <h3 style="margin-bottom:20px;"><i class="fas fa-plus-circle"></i> Add Bill</h3>
        <form onsubmit="saveBill(event)">
            <div class="form-group">
                <label>Bill Name *</label>
                <input type="text" id="billName" class="form-input" placeholder="e.g., Electricity" required>
            </div>
            <div class="form-group">
                <label>Amount (₹) *</label>
                <input type="number" id="billAmount" class="form-input" placeholder="Enter amount" required min="0">
            </div>
            <div class="form-group">
                <label>Type</label>
                <select id="billType" class="form-input">
                    <option value="Electricity">Electricity</option>
                    <option value="Water">Water</option>
                    <option value="Internet">Internet</option>
                    <option value="Phone">Phone</option>
                    <option value="Gas">Gas</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Subscription">Subscription</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            <div class="form-group">
                <label>Due Date</label>
                <input type="date" id="billDueDate" class="form-input">
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Bill</button>
            </div>
        </form>
    `);
}

async function saveBill(event) {
    event.preventDefault();
    const uid = getUID();
    if (!uid) return;

    try {
        showSyncStatus(true);
        await firebase.firestore().collection('users').doc(uid).collection('bills').add({
            name: document.getElementById('billName').value.trim(),
            amount: Number(document.getElementById('billAmount').value),
            type: document.getElementById('billType').value,
            dueDate: document.getElementById('billDueDate').value,
            paid: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        showSyncStatus(false);
        closeModal();
        showToast('Bill added!', 'success');
        renderBillsPage(uid);
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

async function toggleBillPaid(id, paid) {
    const uid = getUID();
    try {
        await firebase.firestore().collection('users').doc(uid).collection('bills').doc(id).update({ paid });
        showToast(paid ? 'Marked as paid ✓' : 'Marked as unpaid', 'success');
        renderBillsPage(uid);
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

async function deleteBill(id) {
    if (!confirm('Delete this bill?')) return;
    const uid = getUID();
    try {
        await firebase.firestore().collection('users').doc(uid).collection('bills').doc(id).delete();
        showToast('Bill deleted', 'success');
        renderBillsPage(uid);
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

// ============================================
// RENT PAGE
// ============================================
async function renderRentPage(uid) {
    console.log('🏠 Rendering Rent page...');
    const mainContent = document.getElementById('mainContent');
    const db = firebase.firestore();

    let rentList = [];
    try {
        const snap = await db.collection('users').doc(uid).collection('rent').get();
        rentList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
        console.error('Error loading rent:', e);
    }

    const totalRent = rentList.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

    mainContent.innerHTML = `
        <div class="page-header">
            <div>
                <h2>Rent Tracking</h2>
                <p class="text-secondary">Track room rent and housing expenses</p>
            </div>
            <button class="btn btn-primary" onclick="showAddRentForm()">
                <i class="fas fa-plus"></i> Add Rent
            </button>
        </div>

        <div class="stats-row">
            <div class="stat-card">
                <div class="stat-icon" style="background:rgba(155,89,182,0.15);color:#9b59b6;">
                    <i class="fas fa-home"></i>
                </div>
                <div class="stat-info">
                    <span class="stat-label">Total Rent</span>
                    <span class="stat-value">${formatCurrency(totalRent)}</span>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-body">
                ${rentList.length === 0 ? `
                    <div class="empty-state">
                        <i class="fas fa-home"></i>
                        <p>No rent details added</p>
                        <button class="btn btn-primary btn-sm" onclick="showAddRentForm()">Add Rent Details</button>
                    </div>
                ` : `
                    <div class="grid-cards">
                        ${rentList.map(r => `
                            <div class="card" style="background:var(--bg-secondary);">
                                <div class="card-body">
                                    <h4><i class="fas fa-map-marker-alt"></i> ${r.location || 'N/A'}</h4>
                                    <p style="font-size:1.5rem;font-weight:700;color:var(--primary);margin:10px 0;">${formatCurrency(r.amount)}<span style="font-size:0.8rem;color:var(--text-secondary);">/month</span></p>
                                    ${r.landlord ? `<p><i class="fas fa-user"></i> ${r.landlord}</p>` : ''}
                                    ${r.deposit ? `<p><i class="fas fa-shield-alt"></i> Deposit: ${formatCurrency(r.deposit)}</p>` : ''}
                                    ${r.dueDate ? `<p><i class="fas fa-calendar"></i> Due: ${r.dueDate}</p>` : ''}
                                    <div style="margin-top:12px;">
                                        <button class="btn btn-sm btn-danger" onclick="deleteRent('${r.id}')">
                                            <i class="fas fa-trash"></i> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        </div>
    `;
}

function showAddRentForm() {
    openModal(`
        <h3 style="margin-bottom:20px;"><i class="fas fa-home"></i> Add Rent</h3>
        <form onsubmit="saveRent(event)">
            <div class="form-group">
                <label>Location *</label>
                <input type="text" id="rentLocation" class="form-input" placeholder="e.g., Room in Hyderabad" required>
            </div>
            <div class="form-group">
                <label>Monthly Rent (₹) *</label>
                <input type="number" id="rentAmount" class="form-input" placeholder="Enter rent amount" required min="0">
            </div>
            <div class="form-group">
                <label>Deposit Amount (₹)</label>
                <input type="number" id="rentDeposit" class="form-input" placeholder="Security deposit" min="0">
            </div>
            <div class="form-group">
                <label>Landlord Name</label>
                <input type="text" id="rentLandlord" class="form-input" placeholder="Landlord name">
            </div>
            <div class="form-group">
                <label>Due Date (Day of month)</label>
                <input type="text" id="rentDueDate" class="form-input" placeholder="e.g., 1st, 5th">
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save</button>
            </div>
        </form>
    `);
}

async function saveRent(event) {
    event.preventDefault();
    const uid = getUID();
    if (!uid) return;

    try {
        showSyncStatus(true);
        await firebase.firestore().collection('users').doc(uid).collection('rent').add({
            location: document.getElementById('rentLocation').value.trim(),
            amount: Number(document.getElementById('rentAmount').value),
            deposit: Number(document.getElementById('rentDeposit').value) || 0,
            landlord: document.getElementById('rentLandlord').value.trim(),
            dueDate: document.getElementById('rentDueDate').value.trim(),
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        showSyncStatus(false);
        closeModal();
        showToast('Rent added!', 'success');
        renderRentPage(uid);
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

async function deleteRent(id) {
    if (!confirm('Delete this rent entry?')) return;
    const uid = getUID();
    try {
        await firebase.firestore().collection('users').doc(uid).collection('rent').doc(id).delete();
        showToast('Rent deleted', 'success');
        renderRentPage(uid);
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

// ============================================
// REPORTS PAGE
// ============================================
async function renderReportsPage(uid) {
    console.log('📊 Rendering Reports page...');
    const mainContent = document.getElementById('mainContent');

    const data = await getAllFinancialData(uid);

    const totalIncome = data.income.reduce((s, i) => s + (Number(i.amount) || 0), 0);
    const totalBankEMI = data.bankEMIs.reduce((s, e) => s + (Number(e.emiAmount) || 0), 0);
    const totalPersonalEMI = data.personalEMIs.reduce((s, e) => s + (Number(e.emiAmount) || 0), 0);
    const totalInstallments = data.installments.reduce((s, e) => s + (Number(e.emiAmount) || 0), 0);
    const totalBills = data.bills.reduce((s, b) => s + (Number(b.amount) || 0), 0);
    const totalRent = data.rent.reduce((s, r) => s + (Number(r.amount) || 0), 0);
    const totalExpenses = data.expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
    const totalOutgoing = totalBankEMI + totalPersonalEMI + totalInstallments + totalBills + totalRent + totalExpenses;
    const balance = totalIncome - totalOutgoing;

    mainContent.innerHTML = `
        <div class="page-header">
            <div>
                <h2>Financial Reports</h2>
                <p class="text-secondary">Complete breakdown of your finances</p>
            </div>
        </div>

        <div class="stats-row">
            <div class="stat-card">
                <div class="stat-icon" style="background:rgba(46,204,113,0.15);color:var(--success);">
                    <i class="fas fa-arrow-down"></i>
                </div>
                <div class="stat-info">
                    <span class="stat-label">Total Income</span>
                    <span class="stat-value">${formatCurrency(totalIncome)}</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background:rgba(231,76,60,0.15);color:var(--danger);">
                    <i class="fas fa-arrow-up"></i>
                </div>
                <div class="stat-info">
                    <span class="stat-label">Total Outgoing</span>
                    <span class="stat-value">${formatCurrency(totalOutgoing)}</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background:rgba(52,152,219,0.15);color:var(--primary);">
                    <i class="fas fa-balance-scale"></i>
                </div>
                <div class="stat-info">
                    <span class="stat-label">Balance</span>
                    <span class="stat-value" style="color:${balance >= 0 ? 'var(--success)' : 'var(--danger)'}">${formatCurrency(balance)}</span>
                </div>
            </div>
        </div>

        <div class="grid-2">
            <div class="card">
                <div class="card-header"><h3><i class="fas fa-chart-pie"></i> Expense Distribution</h3></div>
                <div class="card-body">
                    <canvas id="reportPieChart" height="300"></canvas>
                </div>
            </div>
            <div class="card">
                <div class="card-header"><h3><i class="fas fa-chart-bar"></i> Category Breakdown</h3></div>
                <div class="card-body">
                    <canvas id="reportBarChart" height="300"></canvas>
                </div>
            </div>
        </div>

        <div class="card" style="margin-top:20px;">
            <div class="card-header"><h3><i class="fas fa-table"></i> Detailed Breakdown</h3></div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr><th>Category</th><th>Amount</th><th>% of Income</th></tr>
                        </thead>
                        <tbody>
                            <tr><td><i class="fas fa-university"></i> Bank EMIs</td><td>${formatCurrency(totalBankEMI)}</td><td>${totalIncome ? ((totalBankEMI/totalIncome)*100).toFixed(1) : 0}%</td></tr>
                            <tr><td><i class="fas fa-users"></i> Personal EMIs</td><td>${formatCurrency(totalPersonalEMI)}</td><td>${totalIncome ? ((totalPersonalEMI/totalIncome)*100).toFixed(1) : 0}%</td></tr>
                            <tr><td><i class="fas fa-layer-group"></i> Installments</td><td>${formatCurrency(totalInstallments)}</td><td>${totalIncome ? ((totalInstallments/totalIncome)*100).toFixed(1) : 0}%</td></tr>
                            <tr><td><i class="fas fa-file-invoice"></i> Bills</td><td>${formatCurrency(totalBills)}</td><td>${totalIncome ? ((totalBills/totalIncome)*100).toFixed(1) : 0}%</td></tr>
                            <tr><td><i class="fas fa-home"></i> Rent</td><td>${formatCurrency(totalRent)}</td><td>${totalIncome ? ((totalRent/totalIncome)*100).toFixed(1) : 0}%</td></tr>
                            <tr><td><i class="fas fa-shopping-cart"></i> Other Expenses</td><td>${formatCurrency(totalExpenses)}</td><td>${totalIncome ? ((totalExpenses/totalIncome)*100).toFixed(1) : 0}%</td></tr>
                            <tr style="font-weight:700;border-top:2px solid var(--border);"><td>Total Outgoing</td><td>${formatCurrency(totalOutgoing)}</td><td>${totalIncome ? ((totalOutgoing/totalIncome)*100).toFixed(1) : 0}%</td></tr>
                            <tr style="font-weight:700;color:${balance>=0?'var(--success)':'var(--danger)'}"><td>Net Balance</td><td>${formatCurrency(balance)}</td><td>${totalIncome ? ((balance/totalIncome)*100).toFixed(1) : 0}%</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    // Render charts
    try {
        const categories = ['Bank EMIs', 'Personal EMIs', 'Installments', 'Bills', 'Rent', 'Expenses'];
        const values = [totalBankEMI, totalPersonalEMI, totalInstallments, totalBills, totalRent, totalExpenses];
        const colors = ['#3498db', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22'];

        // Pie Chart
        const pieCtx = document.getElementById('reportPieChart');
        if (pieCtx && typeof Chart !== 'undefined') {
            new Chart(pieCtx.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: categories,
                    datasets: [{
                        data: values,
                        backgroundColor: colors,
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: '#ccc', padding: 12 }
                        }
                    }
                }
            });
        }

        // Bar Chart
        const barCtx = document.getElementById('reportBarChart');
        if (barCtx && typeof Chart !== 'undefined') {
            new Chart(barCtx.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: categories,
                    datasets: [{
                        label: 'Amount (₹)',
                        data: values,
                        backgroundColor: colors,
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { color: '#999' },
                            grid: { color: 'rgba(255,255,255,0.05)' }
                        },
                        x: {
                            ticks: { color: '#999' },
                            grid: { display: false }
                        }
                    }
                }
            });
        }
    } catch (chartError) {
        console.error('Chart rendering error:', chartError);
    }
}

// ============================================
// AUTH STATE - Called from auth.js
// ============================================
function onUserLoggedIn(user) {
    console.log('✅ User logged in:', user.email);
    currentUser = user;

    // Show main app, hide auth
    const authScreen = document.getElementById('authScreen');
    const appScreen = document.getElementById('appScreen');

    if (authScreen) authScreen.style.display = 'none';
    if (appScreen) appScreen.style.display = 'flex';

    // Re-initialize navigation (important!)
    setTimeout(() => {
        initNavigation();
        navigateTo('dashboard');
    }, 100);
}

function onUserLoggedOut() {
    console.log('👋 User logged out');
    currentUser = null;

    const authScreen = document.getElementById('authScreen');
    const appScreen = document.getElementById('appScreen');

    if (authScreen) authScreen.style.display = 'flex';
    if (appScreen) appScreen.style.display = 'none';
}

console.log('✅ app.js fully loaded');
