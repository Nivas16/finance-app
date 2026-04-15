// ============================================
// MAIN APPLICATION CONTROLLER
// ============================================

let currentPage = 'dashboard';

// Set current date
document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-IN', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
});

// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.dataset.page;
        navigateTo(page);
    });
});

function navigateTo(page) {
    currentPage = page;
    
    // Update active nav
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector(`.nav-item[data-page="${page}"]`)?.classList.add('active');
    
    // Update title
    const titles = {
        'dashboard': 'Dashboard',
        'income': 'Income Management',
        'bank-emi': 'Bank EMIs',
        'personal-emi': 'Personal EMIs',
        'installments': 'Society Loans & Installments',
        'bills': 'Bills & Utilities',
        'rent': 'Room Rent',
        'expenses': 'Other Expenses',
        'ai-advisor': 'AI Financial Advisor',
        'loan-planner': 'Loan Closure Planner',
        'savings-guide': 'Money Saving Guide',
        'purchase-advisor': 'Purchase Decision Advisor',
        'reports': 'Financial Reports',
        'admin': 'Admin Panel'
    };
    document.getElementById('pageTitle').textContent = titles[page] || 'Dashboard';
    
    // Close sidebar on mobile
    document.getElementById('sidebar').classList.remove('open');
    
    // Render page
    renderPage(page);
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

function renderPage(page) {
    const content = document.getElementById('contentArea');
    
    switch(page) {
        case 'dashboard': renderDashboard(content); break;
        case 'income': renderIncome(content); break;
        case 'bank-emi': renderBankEMI(content); break;
        case 'personal-emi': renderPersonalEMI(content); break;
        case 'installments': renderInstallments(content); break;
        case 'bills': renderBills(content); break;
        case 'rent': renderRent(content); break;
        case 'expenses': renderExpenses(content); break;
        case 'ai-advisor': renderAIAdvisor(content); break;
        case 'loan-planner': renderLoanPlanner(content); break;
        case 'savings-guide': renderSavingsGuide(content); break;
        case 'purchase-advisor': renderPurchaseAdvisor(content); break;
        case 'reports': renderReports(content); break;
        case 'admin': renderAdmin(content); break;
    }
}

// ============ HELPER FUNCTIONS ============

function formatCurrency(amount) {
    return '?' + Number(amount || 0).toLocaleString('en-IN');
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMessage');
    toast.className = `toast ${type}`;
    toastMsg.textContent = message;
    
    const iconMap = { success: 'check-circle', error: 'exclamation-circle', info: 'info-circle' };
    toast.querySelector('.toast-icon').className = `toast-icon fas fa-${iconMap[type] || 'check-circle'}`;
    
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}

function openModal(html) {
    document.getElementById('modalContent').innerHTML = html;
    document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

function showSyncStatus(syncing = false) {
    const el = document.getElementById('syncStatus');
    if (syncing) {
        el.innerHTML = '<i class="fas fa-sync fa-spin"></i> Syncing...';
        el.className = 'sync-status syncing';
    } else {
        el.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Synced';
        el.className = 'sync-status';
    }
}

function getUID() {
    return window.currentUser?.uid;
}

function getUserData() {
    return window.userData || {};
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Calculate months between dates
function monthsBetween(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
}

// ============ INCOME PAGE ============
function renderIncome(container) {
    container.innerHTML = `
        <div class="section">
            <div class="section-header">
                <h2 class="section-title"><i class="fas fa-wallet"></i> Income Sources</h2>
                <button class="btn btn-primary btn-sm" onclick="openAddIncomeModal()">
                    <i class="fas fa-plus"></i> Add Income
                </button>
            </div>
            <div class="section-body" id="incomeList">
                <div class="flex-center"><div class="spinner"></div></div>
            </div>
        </div>
        <div class="section">
            <div class="section-header">
                <h2 class="section-title"><i class="fas fa-chart-line"></i> Income History</h2>
            </div>
            <div class="section-body">
                <div class="chart-wrapper">
                    <canvas id="incomeChart"></canvas>
                </div>
            </div>
        </div>
    `;
    loadIncomeData();
}

async function loadIncomeData() {
    const uid = getUID();
    if (!uid) return;
    
    try {
        const snapshot = await db.collection('users').doc(uid)
            .collection('income').orderBy('createdAt', 'desc').get();
        
        const incomes = [];
        snapshot.forEach(doc => incomes.push({ id: doc.id, ...doc.data() }));
        
        const listEl = document.getElementById('incomeList');
        
        if (incomes.length === 0) {
            listEl.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-wallet"></i>
                    <h3>No income sources added</h3>
                    <p>Add your salary and other income sources</p>
                    <button class="btn btn-primary" onclick="openAddIncomeModal()">
                        <i class="fas fa-plus"></i> Add Income
                    </button>
                </div>
            `;
            return;
        }
        
        let html = `<div class="table-responsive"><table class="data-table">
            <thead><tr>
                <th>Source</th><th>Type</th><th>Amount</th><th>Date</th><th>Actions</th>
            </tr></thead><tbody>`;
        
        incomes.forEach(inc => {
            html += `<tr>
                <td><strong>${inc.source}</strong></td>
                <td><span class="tag tag-info">${inc.type || 'Salary'}</span></td>
                <td class="text-success fw-700">${formatCurrency(inc.amount)}</td>
                <td>${inc.date || 'Monthly'}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteIncome('${inc.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>`;
        });
        
        html += '</tbody></table></div>';
        
        const total = incomes.reduce((sum, i) => sum + (i.amount || 0), 0);
        html += `<div class="flex-between mt-20" style="padding:15px;background:var(--dark);border-radius:var(--radius-sm)">
            <span class="fw-700">Total Monthly Income</span>
            <span class="text-success fw-800 fs-18">${formatCurrency(total)}</span>
        </div>`;
        
        listEl.innerHTML = html;
    } catch (err) {
        console.error('Error loading income:', err);
    }
}

function openAddIncomeModal() {
    openModal(`
        <div class="modal-header">
            <h2>Add Income Source</h2>
            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
        </div>
        <form onsubmit="saveIncome(event)">
            <div class="form-group">
                <label>Source Name</label>
                <input type="text" id="incSource" placeholder="e.g., Salary, Freelance" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Amount (?)</label>
                    <input type="number" id="incAmount" placeholder="50000" required>
                </div>
                <div class="form-group">
                    <label>Type</label>
                    <select id="incType">
                        <option value="Salary">Salary</option>
                        <option value="Freelance">Freelance</option>
                        <option value="Business">Business</option>
                        <option value="Investment">Investment</option>
                        <option value="Rental">Rental Income</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>Date / Frequency</label>
                <input type="text" id="incDate" placeholder="e.g., 1st of every month" value="Monthly">
            </div>
            <button type="submit" class="btn btn-success btn-full mt-15">
                <i class="fas fa-save"></i> Save Income
            </button>
        </form>
    `);
}

async function saveIncome(e) {
    e.preventDefault();
    showSyncStatus(true);
    
    try {
        await db.collection('users').doc(getUID()).collection('income').add({
            source: document.getElementById('incSource').value,
            amount: parseFloat(document.getElementById('incAmount').value),
            type: document.getElementById('incType').value,
            date: document.getElementById('incDate').value,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        closeModal();
        showToast('Income added!', 'success');
        loadIncomeData();
    } catch (err) {
        showToast('Error saving income', 'error');
    }
    showSyncStatus(false);
}

async function deleteIncome(id) {
    if (!confirm('Delete this income source?')) return;
    showSyncStatus(true);
    try {
        await db.collection('users').doc(getUID()).collection('income').doc(id).delete();
        showToast('Income deleted', 'info');
        loadIncomeData();
    } catch (err) {
        showToast('Error deleting', 'error');
    }
    showSyncStatus(false);
}

// ============ BILLS PAGE ============
function renderBills(container) {
    container.innerHTML = `
        <div class="section">
            <div class="section-header">
                <h2 class="section-title"><i class="fas fa-bolt"></i> Monthly Bills</h2>
                <button class="btn btn-primary btn-sm" onclick="openAddBillModal()">
                    <i class="fas fa-plus"></i> Add Bill
                </button>
            </div>
            <div class="section-body" id="billsList">
                <div class="flex-center"><div class="spinner"></div></div>
            </div>
        </div>
    `;
    loadBillsData();
}

async function loadBillsData() {
    const uid = getUID();
    try {
        const snapshot = await db.collection('users').doc(uid)
            .collection('bills').orderBy('createdAt', 'desc').get();
        
        const bills = [];
        snapshot.forEach(doc => bills.push({ id: doc.id, ...doc.data() }));
        
        const el = document.getElementById('billsList');
        
        if (bills.length === 0) {
            el.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bolt"></i>
                    <h3>No bills added</h3>
                    <p>Track your electricity, water, internet bills</p>
                    <button class="btn btn-primary" onclick="openAddBillModal()">
                        <i class="fas fa-plus"></i> Add Bill
                    </button>
                </div>`;
            return;
        }
        
        let html = '<div class="emi-grid">';
        bills.forEach(bill => {
            html += `
                <div class="emi-card">
                    <div class="emi-card-top">
                        <div>
                            <div class="emi-name">${bill.name}</div>
                            <div class="emi-type">${bill.type || 'Utility'}</div>
                        </div>
                        <div class="emi-amount">${formatCurrency(bill.amount)}</div>
                    </div>
                    <div class="emi-details">
                        <div class="emi-detail">
                            <span class="emi-detail-label">Due Date</span>
                            <span class="emi-detail-value">${bill.dueDate || 'Monthly'}</span>
                        </div>
                        <div class="emi-detail">
                            <span class="emi-detail-label">Status</span>
                            <span class="emi-detail-value">
                                <span class="tag ${bill.paid ? 'tag-success' : 'tag-danger'}">
                                    ${bill.paid ? 'Paid' : 'Pending'}
                                </span>
                            </span>
                        </div>
                    </div>
                    <div class="emi-actions">
                        <button class="btn btn-sm ${bill.paid ? 'btn-outline' : 'btn-success'}" 
                                onclick="toggleBillPaid('${bill.id}', ${!bill.paid})">
                            <i class="fas fa-${bill.paid ? 'undo' : 'check'}"></i>
                            ${bill.paid ? 'Mark Unpaid' : 'Mark Paid'}
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteBill('${bill.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>`;
        });
        html += '</div>';
        
        const total = bills.reduce((s, b) => s + (b.amount || 0), 0);
        const paid = bills.filter(b => b.paid).reduce((s, b) => s + (b.amount || 0), 0);
        
        html += `<div class="flex-between mt-20" style="padding:15px;background:var(--dark);border-radius:var(--radius-sm)">
            <div>
                <div class="fs-12 text-muted">Total Bills</div>
                <div class="fw-800 text-danger">${formatCurrency(total)}</div>
            </div>
            <div class="text-right">
                <div class="fs-12 text-muted">Paid</div>
                <div class="fw-800 text-success">${formatCurrency(paid)}</div>
            </div>
        </div>`;
        
        el.innerHTML = html;
    } catch (err) {
        console.error(err);
    }
}

function openAddBillModal() {
    openModal(`
        <div class="modal-header">
            <h2>Add Bill</h2>
            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
        </div>
        <form onsubmit="saveBill(event)">
            <div class="form-group">
                <label>Bill Name</label>
                <input type="text" id="billName" placeholder="e.g., Electricity Bill" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Amount (?)</label>
                    <input type="number" id="billAmount" placeholder="1500" required>
                </div>
                <div class="form-group">
                    <label>Type</label>
                    <select id="billType">
                        <option value="Electricity">Electricity</option>
                        <option value="Water">Water</option>
                        <option value="Internet">Internet/WiFi</option>
                        <option value="Gas">Gas</option>
                        <option value="Mobile">Mobile Recharge</option>
                        <option value="DTH">DTH/Cable</option>
                        <option value="Insurance">Insurance</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>Due Date</label>
                <input type="text" id="billDue" placeholder="e.g., 15th of month" value="Monthly">
            </div>
            <button type="submit" class="btn btn-success btn-full mt-15">
                <i class="fas fa-save"></i> Save Bill
            </button>
        </form>
    `);
}

async function saveBill(e) {
    e.preventDefault();
    showSyncStatus(true);
    try {
        await db.collection('users').doc(getUID()).collection('bills').add({
            name: document.getElementById('billName').value,
            amount: parseFloat(document.getElementById('billAmount').value),
            type: document.getElementById('billType').value,
            dueDate: document.getElementById('billDue').value,
            paid: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        closeModal();
        showToast('Bill added!', 'success');
        loadBillsData();
    } catch (err) {
        showToast('Error saving', 'error');
    }
    showSyncStatus(false);
}

async function toggleBillPaid(id, paid) {
    showSyncStatus(true);
    try {
        await db.collection('users').doc(getUID()).collection('bills').doc(id).update({ paid });
        showToast(paid ? 'Marked as paid' : 'Marked as unpaid', 'success');
        loadBillsData();
    } catch (err) {
        showToast('Error updating', 'error');
    }
    showSyncStatus(false);
}

async function deleteBill(id) {
    if (!confirm('Delete this bill?')) return;
    showSyncStatus(true);
    try {
        await db.collection('users').doc(getUID()).collection('bills').doc(id).delete();
        showToast('Bill deleted', 'info');
        loadBillsData();
    } catch (err) {
        showToast('Error', 'error');
    }
    showSyncStatus(false);
}

// ============ RENT PAGE ============
function renderRent(container) {
    container.innerHTML = `
        <div class="section">
            <div class="section-header">
                <h2 class="section-title"><i class="fas fa-home"></i> Room Rent</h2>
                <button class="btn btn-primary btn-sm" onclick="openAddRentModal()">
                    <i class="fas fa-plus"></i> Update Rent
                </button>
            </div>
            <div class="section-body" id="rentData">
                <div class="flex-center"><div class="spinner"></div></div>
            </div>
        </div>
    `;
    loadRentData();
}

async function loadRentData() {
    const uid = getUID();
    try {
        const snapshot = await db.collection('users').doc(uid)
            .collection('rent').orderBy('createdAt', 'desc').get();
        
        const rents = [];
        snapshot.forEach(doc => rents.push({ id: doc.id, ...doc.data() }));
        
        const el = document.getElementById('rentData');
        
        if (rents.length === 0) {
            el.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-home"></i>
                    <h3>No rent details</h3>
                    <p>Add your monthly rent information</p>
                    <button class="btn btn-primary" onclick="openAddRentModal()">
                        <i class="fas fa-plus"></i> Add Rent
                    </button>
                </div>`;
            return;
        }
        
        let html = '<div class="emi-grid">';
        rents.forEach(rent => {
            html += `
                <div class="emi-card">
                    <div class="emi-card-top">
                        <div>
                            <div class="emi-name">${rent.location || 'Room Rent'}</div>
                            <div class="emi-type">${rent.landlord || ''}</div>
                        </div>
                        <div class="emi-amount">${formatCurrency(rent.amount)}/mo</div>
                    </div>
                    <div class="emi-details">
                        <div class="emi-detail">
                            <span class="emi-detail-label">Deposit</span>
                            <span class="emi-detail-value">${formatCurrency(rent.deposit || 0)}</span>
                        </div>
                        <div class="emi-detail">
                            <span class="emi-detail-label">Due Date</span>
                            <span class="emi-detail-value">${rent.dueDate || '1st'}</span>
                        </div>
                    </div>
                    <div class="emi-actions">
                        <button class="btn btn-sm btn-danger" onclick="deleteRent('${rent.id}')">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    </div>
                </div>`;
        });
        html += '</div>';
        el.innerHTML = html;
    } catch (err) {
        console.error(err);
    }
}

function openAddRentModal() {
    openModal(`
        <div class="modal-header">
            <h2>Add Rent Details</h2>
            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
        </div>
        <form onsubmit="saveRent(event)">
            <div class="form-group">
                <label>Location / Address</label>
                <input type="text" id="rentLocation" placeholder="e.g., 2BHK Andheri West" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Monthly Rent (?)</label>
                    <input type="number" id="rentAmount" placeholder="10000" required>
                </div>
                <div class="form-group">
                    <label>Deposit (?)</label>
                    <input type="number" id="rentDeposit" placeholder="20000" value="0">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Landlord Name</label>
                    <input type="text" id="rentLandlord" placeholder="Optional">
                </div>
                <div class="form-group">
                    <label>Due Date</label>
                    <input type="text" id="rentDue" value="1st of month">
                </div>
            </div>
            <button type="submit" class="btn btn-success btn-full mt-15">
                <i class="fas fa-save"></i> Save Rent
            </button>
        </form>
    `);
}

async function saveRent(e) {
    e.preventDefault();
    showSyncStatus(true);
    try {
        await db.collection('users').doc(getUID()).collection('rent').add({
            location: document.getElementById('rentLocation').value,
            amount: parseFloat(document.getElementById('rentAmount').value),
            deposit: parseFloat(document.getElementById('rentDeposit').value) || 0,
            landlord: document.getElementById('rentLandlord').value,
            dueDate: document.getElementById('rentDue').value,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        closeModal();
        showToast('Rent added!', 'success');
        loadRentData();
    } catch (err) {
        showToast('Error', 'error');
    }
    showSyncStatus(false);
}

async function deleteRent(id) {
    if (!confirm('Delete rent entry?')) return;
    try {
        await db.collection('users').doc(getUID()).collection('rent').doc(id).delete();
        showToast('Deleted', 'info');
        loadRentData();
    } catch (err) { showToast('Error', 'error'); }
}

// ============ REPORTS PAGE ============
function renderReports(container) {
    container.innerHTML = `
        <div class="stats-grid mb-20">
            <div class="stat-card income">
                <div class="stat-card-header">
                    <span class="stat-card-title">This Month Income</span>
                    <div class="stat-card-icon"><i class="fas fa-arrow-down"></i></div>
                </div>
                <div class="stat-card-value" id="repIncome">?0</div>
            </div>
            <div class="stat-card expense">
                <div class="stat-card-header">
                    <span class="stat-card-title">This Month Expenses</span>
                    <div class="stat-card-icon"><i class="fas fa-arrow-up"></i></div>
                </div>
                <div class="stat-card-value" id="repExpenses">?0</div>
            </div>
            <div class="stat-card balance">
                <div class="stat-card-header">
                    <span class="stat-card-title">Savings Rate</span>
                    <div class="stat-card-icon"><i class="fas fa-percentage"></i></div>
                </div>
                <div class="stat-card-value" id="repSavingsRate">0%</div>
            </div>
        </div>
        <div class="charts-grid">
            <div class="chart-container">
                <div class="chart-title"><i class="fas fa-chart-pie"></i> Expense Breakdown</div>
                <div class="chart-wrapper"><canvas id="reportPieChart"></canvas></div>
            </div>
            <div class="chart-container">
                <div class="chart-title"><i class="fas fa-chart-bar"></i> Monthly Trend</div>
                <div class="chart-wrapper"><canvas id="reportBarChart"></canvas></div>
            </div>
        </div>
    `;
    loadReportData();
}

async function loadReportData() {
    const uid = getUID();
    const data = await getAllFinancialData(uid);
    
    document.getElementById('repIncome').textContent = formatCurrency(data.totalIncome);
    document.getElementById('repExpenses').textContent = formatCurrency(data.totalExpenses);
    
    const savingsRate = data.totalIncome > 0 
        ? Math.round(((data.totalIncome - data.totalExpenses) / data.totalIncome) * 100) 
        : 0;
    document.getElementById('repSavingsRate').textContent = savingsRate + '%';
    
    // Pie Chart
    const pieCtx = document.getElementById('reportPieChart')?.getContext('2d');
    if (pieCtx) {
        new Chart(pieCtx, {
            type: 'doughnut',
            data: {
                labels: ['Bank EMIs', 'Personal EMIs', 'Installments', 'Bills', 'Rent', 'Other Expenses'],
                datasets: [{
                    data: [data.bankEMI, data.personalEMI, data.installments, data.bills, data.rent, data.otherExpenses],
                    backgroundColor: ['#6C63FF', '#3498DB', '#F39C12', '#E74C3C', '#2ECB71', '#9B59B6'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { color: '#A0A0CC', padding: 15, font: { size: 11 } } }
                }
            }
        });
    }
    
    // Bar Chart
    const barCtx = document.getElementById('reportBarChart')?.getContext('2d');
    if (barCtx) {
        new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: ['Income', 'EMIs', 'Bills', 'Rent', 'Expenses', 'Savings'],
                datasets: [{
                    label: 'Amount (?)',
                    data: [
                        data.totalIncome, 
                        data.bankEMI + data.personalEMI + data.installments, 
                        data.bills, 
                        data.rent, 
                        data.otherExpenses, 
                        data.totalIncome - data.totalExpenses
                    ],
                    backgroundColor: ['#2ECB71', '#F39C12', '#E74C3C', '#3498DB', '#9B59B6', '#6C63FF'],
                    borderWidth: 0,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { ticks: { color: '#6C6C99' }, grid: { color: '#2A2A5A' } },
                    x: { ticks: { color: '#A0A0CC' }, grid: { display: false } }
                }
            }
        });
    }
}
