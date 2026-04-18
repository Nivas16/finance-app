// ============================================
// MAIN APPLICATION CONTROLLER
// ============================================

var currentPage = 'dashboard';

// Set current date
document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-IN', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
});

// Navigation
document.querySelectorAll('.nav-item').forEach(function(item) {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        var page = item.dataset.page;
        navigateTo(page);
    });
});

function navigateTo(page) {
    currentPage = page;
    
    // Update active nav
    document.querySelectorAll('.nav-item').forEach(function(n) { n.classList.remove('active'); });
    var navItem = document.querySelector('.nav-item[data-page="' + page + '"]');
    if (navItem) navItem.classList.add('active');
    
    // Update title
    var titles = {
        'dashboard': 'Dashboard',
        'income': 'Income Management',
        'bank-emi': 'Bank EMIs',
        'personal-emi': 'Personal EMIs',
        'installments': 'Society Loans & Installments',
        'bills': 'Bills & Utilities',
        'rent': 'Room Rent',
        'expenses': 'Other Expenses',
        'daily-expenses': 'Daily Expenses',
        'income-edit': 'Edit Salary',
        'sip': 'SIP Investments',
        'stocks': 'Share Market',
        'market-tips': 'Market Tips',
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
    var content = document.getElementById('contentArea');
    
    switch(page) {
        case 'dashboard': renderDashboard(content); break;
        case 'income': renderIncome(content); break;
        case 'bank-emi': renderBankEMI(content); break;
        case 'personal-emi': renderPersonalEMI(content); break;
        case 'installments': renderInstallments(content); break;
        case 'bills': renderBills(content); break;
        case 'rent': renderRent(content); break;
        case 'expenses': renderExpenses(content); break;
        case 'daily-expenses': renderDailyExpenses(content); break;
        case 'income-edit': renderQuickIncomeEdit(content); break;
        case 'sip': renderSIP(content); break;
        case 'stocks': renderStocks(content); break;
        case 'market-tips': renderMarketTips(content); break;
        case 'ai-advisor': renderAIAdvisor(content); break;
        case 'loan-planner': renderLoanPlanner(content); break;
        case 'savings-guide': renderSavingsGuide(content); break;
        case 'purchase-advisor': renderPurchaseAdvisor(content); break;
        case 'reports': renderReports(content); break;
        case 'admin': renderAdmin(content); break;
    }
}

// ============================================
// INCOME PAGE
// ============================================
function renderIncome(container) {
    container.innerHTML = '<div class="section">' +
        '<div class="section-header">' +
        '<h2 class="section-title"><i class="fas fa-wallet"></i> Income Sources</h2>' +
        '<button class="btn btn-primary btn-sm" onclick="openAddIncomeModal()">' +
        '<i class="fas fa-plus"></i> Add Income</button></div>' +
        '<div class="section-body" id="incomeList"><div class="flex-center"><div class="spinner"></div></div></div></div>';
    loadIncomeData();
}

async function loadIncomeData() {
    var uid = getUID();
    if (!uid) return;
    
    try {
        var snapshot = await db.collection('users').doc(uid).collection('income').orderBy('createdAt', 'desc').get();
        
        var incomes = [];
        snapshot.forEach(function(doc) { incomes.push({ id: doc.id, data: doc.data() }); });
        
        var listEl = document.getElementById('incomeList');
        
        if (incomes.length === 0) {
            listEl.innerHTML = '<div class="empty-state"><i class="fas fa-wallet"></i><h3>No income sources added</h3><p>Add your salary and other income sources</p><button class="btn btn-primary" onclick="openAddIncomeModal()"><i class="fas fa-plus"></i> Add Income</button></div>';
            return;
        }
        
        var html = '<div class="table-responsive"><table class="data-table"><thead><tr><th>Source</th><th>Type</th><th>Amount</th><th>Date</th><th>Actions</th></tr></thead><tbody>';
        
        incomes.forEach(function(inc) {
            html += '<tr><td><strong>' + inc.data.source + '</strong></td>' +
                '<td><span class="tag tag-info">' + (inc.data.type || 'Salary') + '</span></td>' +
                '<td class="text-success fw-700">' + formatCurrency(inc.data.amount) + '</td>' +
                '<td>' + (inc.data.date || 'Monthly') + '</td>' +
                '<td><button class="btn btn-danger btn-sm" onclick="deleteIncome(\'' + inc.id + '\')"><i class="fas fa-trash"></i></button></td></tr>';
        });
        
        html += '</tbody></table></div>';
        
        var total = incomes.reduce(function(sum, i) { return sum + (i.data.amount || 0); }, 0);
        html += '<div class="flex-between mt-20" style="padding:15px;background:var(--dark);border-radius:var(--radius-sm)">' +
            '<span class="fw-700">Total Monthly Income</span>' +
            '<span class="text-success fw-800 fs-18">' + formatCurrency(total) + '</span></div>';
        
        listEl.innerHTML = html;
    } catch (err) {
        console.error('Error loading income:', err);
    }
}

function openAddIncomeModal() {
    openModal('<div class="modal-header"><h2>Add Income Source</h2><button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button></div>' +
        '<form onsubmit="saveIncome(event)">' +
        '<div class="form-group"><label>Source Name</label><input type="text" id="incSource" placeholder="e.g., Salary, Freelance" required></div>' +
        '<div class="form-row"><div class="form-group"><label>Amount (Rs.)</label><input type="number" id="incAmount" placeholder="50000" required></div>' +
        '<div class="form-group"><label>Type</label><select id="incType"><option value="Salary">Salary</option><option value="Freelance">Freelance</option><option value="Business">Business</option><option value="Investment">Investment</option><option value="Rental">Rental Income</option><option value="Other">Other</option></select></div></div>' +
        '<div class="form-group"><label>Date / Frequency</label><input type="text" id="incDate" placeholder="e.g., 1st of every month" value="Monthly"></div>' +
        '<button type="submit" class="btn btn-success btn-full mt-15"><i class="fas fa-save"></i> Save Income</button></form>');
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

// ============================================
// BILLS PAGE
// ============================================
function renderBills(container) {
    container.innerHTML = '<div class="section"><div class="section-header"><h2 class="section-title"><i class="fas fa-bolt"></i> Monthly Bills</h2><button class="btn btn-primary btn-sm" onclick="openAddBillModal()"><i class="fas fa-plus"></i> Add Bill</button></div><div class="section-body" id="billsList"><div class="flex-center"><div class="spinner"></div></div></div></div>';
    loadBillsData();
}

async function loadBillsData() {
    var uid = getUID();
    try {
        var snapshot = await db.collection('users').doc(uid).collection('bills').orderBy('createdAt', 'desc').get();
        
        var bills = [];
        snapshot.forEach(function(doc) { bills.push({ id: doc.id, data: doc.data() }); });
        
        var el = document.getElementById('billsList');
        
        if (bills.length === 0) {
            el.innerHTML = '<div class="empty-state"><i class="fas fa-bolt"></i><h3>No bills added</h3><p>Track your electricity, water, internet bills</p><button class="btn btn-primary" onclick="openAddBillModal()"><i class="fas fa-plus"></i> Add Bill</button></div>';
            return;
        }
        
        var html = '<div class="emi-grid">';
        bills.forEach(function(bill) {
            var paidClass = bill.data.paid ? 'tag-success' : 'tag-danger';
            var paidText = bill.data.paid ? 'Paid' : 'Pending';
            var btnClass = bill.data.paid ? 'btn-outline' : 'btn-success';
            var btnIcon = bill.data.paid ? 'undo' : 'check';
            var btnText = bill.data.paid ? 'Mark Unpaid' : 'Mark Paid';
            
            html += '<div class="emi-card"><div class="emi-card-top"><div><div class="emi-name">' + bill.data.name + '</div><div class="emi-type">' + (bill.data.type || 'Utility') + '</div></div><div class="emi-amount">' + formatCurrency(bill.data.amount) + '</div></div><div class="emi-details"><div class="emi-detail"><span class="emi-detail-label">Due Date</span><span class="emi-detail-value">' + (bill.data.dueDate || 'Monthly') + '</span></div><div class="emi-detail"><span class="emi-detail-label">Status</span><span class="emi-detail-value"><span class="tag ' + paidClass + '">' + paidText + '</span></span></div></div><div class="emi-actions"><button class="btn btn-sm ' + btnClass + '" onclick="toggleBillPaid(\'' + bill.id + '\', ' + (!bill.data.paid) + ')"><i class="fas fa-' + btnIcon + '"></i> ' + btnText + '</button><button class="btn btn-sm btn-danger" onclick="deleteBill(\'' + bill.id + '\')"><i class="fas fa-trash"></i></button></div></div>';
        });
        html += '</div>';
        
        var total = bills.reduce(function(s, b) { return s + (b.data.amount || 0); }, 0);
        var paid = bills.filter(function(b) { return b.data.paid; }).reduce(function(s, b) { return s + (b.data.amount || 0); }, 0);
        
        html += '<div class="flex-between mt-20" style="padding:15px;background:var(--dark);border-radius:var(--radius-sm)"><div><div class="fs-12 text-muted">Total Bills</div><div class="fw-800 text-danger">' + formatCurrency(total) + '</div></div><div class="text-right"><div class="fs-12 text-muted">Paid</div><div class="fw-800 text-success">' + formatCurrency(paid) + '</div></div></div>';
        
        el.innerHTML = html;
    } catch (err) {
        console.error(err);
    }
}

function openAddBillModal() {
    openModal('<div class="modal-header"><h2>Add Bill</h2><button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button></div>' +
        '<form onsubmit="saveBill(event)">' +
        '<div class="form-group"><label>Bill Name</label><input type="text" id="billName" placeholder="e.g., Electricity Bill" required></div>' +
        '<div class="form-row"><div class="form-group"><label>Amount (Rs.)</label><input type="number" id="billAmount" placeholder="1500" required></div><div class="form-group"><label>Type</label><select id="billType"><option value="Electricity">Electricity</option><option value="Water">Water</option><option value="Internet">Internet/WiFi</option><option value="Gas">Gas</option><option value="Mobile">Mobile Recharge</option><option value="DTH">DTH/Cable</option><option value="Insurance">Insurance</option><option value="Other">Other</option></select></div></div>' +
        '<div class="form-group"><label>Due Date</label><input type="text" id="billDue" placeholder="e.g., 15th of month" value="Monthly"></div>' +
        '<button type="submit" class="btn btn-success btn-full mt-15"><i class="fas fa-save"></i> Save Bill</button></form>');
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
        await db.collection('users').doc(getUID()).collection('bills').doc(id).update({ paid: paid });
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

// ============================================
// RENT PAGE
// ============================================
function renderRent(container) {
    container.innerHTML = '<div class="section"><div class="section-header"><h2 class="section-title"><i class="fas fa-home"></i> Room Rent</h2><button class="btn btn-primary btn-sm" onclick="openAddRentModal()"><i class="fas fa-plus"></i> Update Rent</button></div><div class="section-body" id="rentData"><div class="flex-center"><div class="spinner"></div></div></div></div>';
    loadRentData();
}

async function loadRentData() {
    var uid = getUID();
    try {
        var snapshot = await db.collection('users').doc(uid).collection('rent').orderBy('createdAt', 'desc').get();
        
        var rents = [];
        snapshot.forEach(function(doc) { rents.push({ id: doc.id, data: doc.data() }); });
        
        var el = document.getElementById('rentData');
        
        if (rents.length === 0) {
            el.innerHTML = '<div class="empty-state"><i class="fas fa-home"></i><h3>No rent details</h3><p>Add your monthly rent information</p><button class="btn btn-primary" onclick="openAddRentModal()"><i class="fas fa-plus"></i> Add Rent</button></div>';
            return;
        }
        
        var html = '<div class="emi-grid">';
        rents.forEach(function(rent) {
            html += '<div class="emi-card"><div class="emi-card-top"><div><div class="emi-name">' + (rent.data.location || 'Room Rent') + '</div><div class="emi-type">' + (rent.data.landlord || '') + '</div></div><div class="emi-amount">' + formatCurrency(rent.data.amount) + '/mo</div></div><div class="emi-details"><div class="emi-detail"><span class="emi-detail-label">Deposit</span><span class="emi-detail-value">' + formatCurrency(rent.data.deposit || 0) + '</span></div><div class="emi-detail"><span class="emi-detail-label">Due Date</span><span class="emi-detail-value">' + (rent.data.dueDate || '1st') + '</span></div></div><div class="emi-actions"><button class="btn btn-sm btn-danger" onclick="deleteRent(\'' + rent.id + '\')"><i class="fas fa-trash"></i> Remove</button></div></div>';
        });
        html += '</div>';
        el.innerHTML = html;
    } catch (err) {
        console.error(err);
    }
}

function openAddRentModal() {
    openModal('<div class="modal-header"><h2>Add Rent Details</h2><button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button></div>' +
        '<form onsubmit="saveRent(event)">' +
        '<div class="form-group"><label>Location / Address</label><input type="text" id="rentLocation" placeholder="e.g., 2BHK Andheri West" required></div>' +
        '<div class="form-row"><div class="form-group"><label>Monthly Rent (Rs.)</label><input type="number" id="rentAmount" placeholder="10000" required></div><div class="form-group"><label>Deposit (Rs.)</label><input type="number" id="rentDeposit" placeholder="20000" value="0"></div></div>' +
        '<div class="form-row"><div class="form-group"><label>Landlord Name</label><input type="text" id="rentLandlord" placeholder="Optional"></div><div class="form-group"><label>Due Date</label><input type="text" id="rentDue" value="1st of month"></div></div>' +
        '<button type="submit" class="btn btn-success btn-full mt-15"><i class="fas fa-save"></i> Save Rent</button></form>');
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

// ============================================
// REPORTS PAGE
// ============================================
function renderReports(container) {
    container.innerHTML = '<div class="stats-grid mb-20">' +
        '<div class="stat-card income"><div class="stat-card-header"><span class="stat-card-title">This Month Income</span><div class="stat-card-icon"><i class="fas fa-arrow-down"></i></div></div><div class="stat-card-value" id="repIncome">Rs.0</div></div>' +
        '<div class="stat-card expense"><div class="stat-card-header"><span class="stat-card-title">This Month Expenses</span><div class="stat-card-icon"><i class="fas fa-arrow-up"></i></div></div><div class="stat-card-value" id="repExpenses">Rs.0</div></div>' +
        '<div class="stat-card balance"><div class="stat-card-header"><span class="stat-card-title">Savings Rate</span><div class="stat-card-icon"><i class="fas fa-percentage"></i></div></div><div class="stat-card-value" id="repSavingsRate">0%</div></div>' +
        '</div>' +
        '<div class="charts-grid"><div class="chart-container"><div class="chart-title"><i class="fas fa-chart-pie"></i> Expense Breakdown</div><div class="chart-wrapper"><canvas id="reportPieChart"></canvas></div></div>' +
        '<div class="chart-container"><div class="chart-title"><i class="fas fa-chart-bar"></i> Monthly Trend</div><div class="chart-wrapper"><canvas id="reportBarChart"></canvas></div></div></div>';
    loadReportData();
}

async function loadReportData() {
    var uid = getUID();
    var data = await getAllFinancialData(uid);
    
    document.getElementById('repIncome').textContent = formatCurrency(data.totalIncome);
    document.getElementById('repExpenses').textContent = formatCurrency(data.totalExpenses);
    
    var savingsRate = data.totalIncome > 0 ? Math.round(((data.totalIncome - data.totalExpenses) / data.totalIncome) * 100) : 0;
    document.getElementById('repSavingsRate').textContent = savingsRate + '%';
}

// ============================================
// DAILY EXPENSES
// ============================================
function renderDailyExpenses(container) {
    var today = new Date().toISOString().split('T')[0];
    container.innerHTML = '<div class="section">' +
        '<div class="section-header"><h2 class="section-title"><i class="fas fa-calendar-day"></i> Daily Expenses</h2><button class="btn btn-primary btn-sm" onclick="openAddDailyExpenseModal()"><i class="fas fa-plus"></i> Add Expense</button></div>' +
        '<div style="margin: 15px 0; display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">' +
        '<input type="date" id="dailyExpenseDate" value="' + today + '">' +
        '<select id="dailyExpenseCategory" style="padding: 8px; border-radius: 6px; background: var(--dark); color: var(--text); border: 1px solid var(--border);">' +
        '<option value="">All Categories</option>' +
        '<option value="Food">Food</option><option value="Transport">Transport</option><option value="Shopping">Shopping</option>' +
        '<option value="Entertainment">Entertainment</option><option value="Healthcare">Healthcare</option>' +
        '<option value="Groceries">Groceries</option><option value="Coffee">Coffee/Snacks</option><option value="Other">Other</option>' +
        '</select>' +
        '<button class="btn btn-sm btn-outline" onclick="loadDailyExpenses()"><i class="fas fa-filter"></i> Filter</button>' +
        '<button class="btn btn-sm btn-outline" onclick="showExpenseAnalytics()"><i class="fas fa-chart-pie"></i> Analytics</button>' +
        '</div>' +
        '<div class="section-body" id="dailyExpenseList"><div class="flex-center"><div class="spinner"></div></div></div></div>';
    loadDailyExpenses();
}

async function loadDailyExpenses() {
    var uid = getUID();
    var dateFilter = document.getElementById('dailyExpenseDate').value;
    var categoryFilterEl = document.getElementById('dailyExpenseCategory');
    var categoryFilter = categoryFilterEl ? categoryFilterEl.value : '';
    
    try {
        var snapshot = await db.collection('users').doc(uid).collection('dailyExpenses').orderBy('date', 'desc').get();
        
        var expenses = [];
        snapshot.forEach(function(doc) { expenses.push({ id: doc.id, data: doc.data() }); });
        
        if (dateFilter) {
            expenses = expenses.filter(function(e) { return e.data.date === dateFilter; });
        }
        
        if (categoryFilter) {
            expenses = expenses.filter(function(e) { return e.data.category === categoryFilter; });
        }
        
        var el = document.getElementById('dailyExpenseList');
        
        if (expenses.length === 0) {
            el.innerHTML = '<div class="empty-state"><i class="fas fa-calendar-day"></i><h3>No expenses recorded</h3><p>Start tracking your daily spending</p><button class="btn btn-primary" onclick="openAddDailyExpenseModal()"><i class="fas fa-plus"></i> Add Expense</button></div>';
            return;
        }
        
        var grouped = {};
        var totalDay = 0;
        
        expenses.forEach(function(exp) {
            var date = exp.data.date || 'Unknown';
            if (!grouped[date]) grouped[date] = [];
            grouped[date].push(exp);
            totalDay += exp.data.amount || 0;
        });
        
        var html = '';
        
        for (var date in grouped) {
            var dayTotal = grouped[date].reduce(function(sum, i) { return sum + (i.data.amount || 0); }, 0);
            
            html += '<div class="daily-group"><div class="daily-group-header"><span>' + new Date(date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) + '</span><span class="text-danger fw-700">' + formatCurrency(dayTotal) + '</span></div><div class="daily-items">';
            
            grouped[date].forEach(function(exp) {
                var iconMap = {
                    'Food': 'fa-utensils', 'Transport': 'fa-bus', 'Shopping': 'fa-shopping-bag',
                    'Entertainment': 'fa-gamepad', 'Healthcare': 'fa-user-md', 'Groceries': 'fa-shopping-basket',
                    'Coffee': 'fa-coffee', 'Other': 'fa-ellipsis-h'
                };
                
                html += '<div class="daily-item"><div class="daily-item-icon"><i class="fas ' + (iconMap[exp.data.category] || 'fa-wallet') + '"></i></div>' +
                    '<div class="daily-item-info"><div class="fw-600">' + exp.data.description + '</div><div class="fs-11 text-muted">' + (exp.data.category || 'Other') + (exp.data.time ? ' - ' + exp.data.time : '') + '</div></div>' +
                    '<div class="daily-item-amount"><span class="text-danger">-' + formatCurrency(exp.data.amount) + '</span><button class="btn btn-sm btn-danger btn-icon" onclick="deleteDailyExpense(\'' + exp.id + '\')"><i class="fas fa-trash"></i></button></div></div>';
            });
            
            html += '</div></div>';
        }
        
        html += '<div class="flex-between mt-20" style="padding:15px;background:linear-gradient(135deg, #1a1a2e, #16213e);border-radius:var(--radius-md)">' +
            '<div><div class="fs-12 text-muted">Total Expenses</div><div class="fw-800 fs-18 text-danger">' + formatCurrency(totalDay) + '</div></div>' +
            '<div class="text-right"><div class="fs-12 text-muted">Transactions</div><div class="fw-800 fs-18">' + expenses.length + '</div></div></div>';
        
        el.innerHTML = html;
    } catch (err) {
        console.error(err);
    }
}

async function showExpenseAnalytics() {
    var uid = getUID();
    
    try {
        var snapshot = await db.collection('users').doc(uid).collection('dailyExpenses').get();
        
        var expenses = [];
        snapshot.forEach(function(doc) { expenses.push(doc.data()); });
        
        if (expenses.length === 0) {
            showToast('No expenses to analyze', 'info');
            return;
        }
        
        var categoryTotals = {};
        var totalSpent = 0;
        
        expenses.forEach(function(exp) {
            var cat = exp.category || 'Other';
            categoryTotals[cat] = (categoryTotals[cat] || 0) + (exp.amount || 0);
            totalSpent += exp.amount || 0;
        });
        
        var html = '<div class="modal-header"><h2><i class="fas fa-chart-pie"></i> Expense Analytics</h2><button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button></div><div class="modal-body">';
        
        html += '<div class="mb-20"><h4>By Category</h4>';
        
        for (var cat in categoryTotals) {
            var amount = categoryTotals[cat];
            var percent = totalSpent > 0 ? (amount / totalSpent * 100).toFixed(1) : 0;
            
            var colors = { 'Food': '#E74C3C', 'Transport': '#3498DB', 'Shopping': '#9B59B6', 'Entertainment': '#F39C12', 'Healthcare': '#2ECB71', 'Groceries': '#E67E22', 'Coffee': '#FF6B6B', 'Other': '#95A5A6' };
            
            html += '<div style="margin-bottom: 12px;"><div class="flex-between mb-5"><span>' + cat + '</span><span class="fw-700">' + formatCurrency(amount) + ' (' + percent + '%)</span></div>' +
                '<div style="background: var(--dark); height: 8px; border-radius: 4px; overflow: hidden;"><div style="width: ' + percent + '%; background: ' + (colors[cat] || '#6C63FF') + '; height: 100%;"></div></div></div>';
        }
        
        html += '</div><div style="padding: 15px; background: var(--dark); border-radius: 8px;"><div class="flex-between"><span class="text-muted">Total Spent</span><span class="fw-800 text-danger" style="font-size: 18px;">' + formatCurrency(totalSpent) + '</span></div></div></div>';
        
        openModal(html);
        
    } catch (err) {
        showToast('Error loading analytics', 'error');
    }
}

function openAddDailyExpenseModal() {
    var today = new Date().toISOString().split('T')[0];
    var time = new Date().toTimeString().slice(0,5);
    
    openModal('<div class="modal-header"><h2>Add Daily Expense</h2><button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button></div>' +
        '<form onsubmit="saveDailyExpense(event)">' +
        '<div class="form-group"><label>Description</label><input type="text" id="dailyDesc" placeholder="e.g., Lunch, Auto fare" required></div>' +
        '<div class="form-row"><div class="form-group"><label>Amount (Rs.)</label><input type="number" id="dailyAmount" placeholder="50" required></div><div class="form-group"><label>Category</label><select id="dailyCategory"><option value="Food">Food</option><option value="Transport">Transport</option><option value="Shopping">Shopping</option><option value="Entertainment">Entertainment</option><option value="Healthcare">Healthcare</option><option value="Groceries">Groceries</option><option value="Coffee">Coffee/Snacks</option><option value="Other">Other</option></select></div></div>' +
        '<div class="form-row"><div class="form-group"><label>Date</label><input type="date" id="dailyDate" value="' + today + '"></div><div class="form-group"><label>Time</label><input type="time" id="dailyTime" value="' + time + '"></div></div>' +
        '<button type="submit" class="btn btn-success btn-full mt-15"><i class="fas fa-save"></i> Save Expense</button></form>');
}

async function saveDailyExpense(e) {
    e.preventDefault();
    showSyncStatus(true);
    
    try {
        await db.collection('users').doc(getUID()).collection('dailyExpenses').add({
            description: document.getElementById('dailyDesc').value,
            amount: parseFloat(document.getElementById('dailyAmount').value),
            category: document.getElementById('dailyCategory').value,
            date: document.getElementById('dailyDate').value,
            time: document.getElementById('dailyTime').value,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        closeModal();
        showToast('Expense added!', 'success');
        loadDailyExpenses();
    } catch (err) {
        showToast('Error saving', 'error');
    }
    showSyncStatus(false);
}

async function deleteDailyExpense(id) {
    if (!confirm('Delete this expense?')) return;
    showSyncStatus(true);
    try {
        await db.collection('users').doc(getUID()).collection('dailyExpenses').doc(id).delete();
        showToast('Deleted', 'info');
        loadDailyExpenses();
    } catch (err) {
        showToast('Error', 'error');
    }
    showSyncStatus(false);
}

// ============================================
// QUICK INCOME EDIT
// ============================================
function renderQuickIncomeEdit(container) {
    var salary = window.userData ? window.userData.monthlyIncome : 0;
    container.innerHTML = '<div class="section">' +
        '<div class="section-header"><h2 class="section-title"><i class="fas fa-money-bill-wave"></i> Income Management</h2><button class="btn btn-primary btn-sm" onclick="openQuickIncomeModal()"><i class="fas fa-plus"></i> Add Income</button></div>' +
        '<div class="section-body">' +
        '<div class="salary-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 12px; margin-bottom: 20px;">' +
        '<div class="flex-between" style="color: white; align-items: center;">' +
        '<div><div style="opacity: 0.8; font-size: 12px;">Monthly Salary</div><div style="font-size: 28px; font-weight: 800;" id="displaySalary">' + formatCurrency(salary) + '</div></div>' +
        '<button class="btn btn-sm" style="background: rgba(255,255,255,0.2); color: white;" onclick="openEditSalaryModal()"><i class="fas fa-edit"></i> Edit</button></div></div>' +
        '<h4 class="mb-15"><i class="fas fa-plus-circle"></i> Extra Income</h4>' +
        '<div id="extraIncomeList"><div class="flex-center"><div class="spinner"></div></div></div></div></div>';
    loadExtraIncome();
}

function openEditSalaryModal() {
    var salary = window.userData ? window.userData.monthlyIncome : 0;
    openModal('<div class="modal-header"><h2>Edit Monthly Salary</h2><button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button></div>' +
        '<form onsubmit="updateSalary(event)">' +
        '<div class="form-group"><label>Monthly Salary (Rs.)</label><input type="number" id="editSalary" value="' + salary + '" required></div>' +
        '<div class="form-group"><label>Pay Day</label><select id="editPayDay"><option value="1">1</option><option value="5">5</option><option value="10">10</option><option value="15">15</option><option value="20">20</option><option value="25">25</option></select></div>' +
        '<button type="submit" class="btn btn-success btn-full mt-15"><i class="fas fa-save"></i> Update Salary</button></form>');
}

async function updateSalary(e) {
    e.preventDefault();
    showSyncStatus(true);
    
    var newSalary = parseFloat(document.getElementById('editSalary').value);
    var payDay = parseInt(document.getElementById('editPayDay').value);
    
    try {
        await db.collection('users').doc(getUID()).update({
            monthlyIncome: newSalary,
            payDay: payDay
        });
        
        window.userData.monthlyIncome = newSalary;
        window.userData.payDay = payDay;
        
        document.getElementById('displaySalary').textContent = formatCurrency(newSalary);
        
        closeModal();
        showToast('Salary updated!', 'success');
    } catch (err) {
        showToast('Error updating', 'error');
    }
    showSyncStatus(false);
}

function openQuickIncomeModal() {
    openModal('<div class="modal-header"><h2>Add Extra Income</h2><button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button></div>' +
        '<form onsubmit="saveExtraIncome(event)">' +
        '<div class="form-group"><label>Source Name</label><input type="text" id="extraSource" placeholder="e.g., Freelance, Rental, Interest" required></div>' +
        '<div class="form-row"><div class="form-group"><label>Amount (Rs.)</label><input type="number" id="extraAmount" placeholder="5000" required></div><div class="form-group"><label>Type</label><select id="extraType"><option value="Freelance">Freelance</option><option value="Rental">Rental Income</option><option value="Interest">Interest</option><option value="Dividend">Dividend</option><option value="Bonus">Bonus</option><option value="Gift">Gift</option><option value="Other">Other</option></select></div></div>' +
        '<div class="form-group"><label>Frequency</label><select id="extraFreq"><option value="Monthly">Monthly</option><option value="One-time">One-time</option><option value="Weekly">Weekly</option></select></div>' +
        '<button type="submit" class="btn btn-success btn-full mt-15"><i class="fas fa-save"></i> Add Income</button></form>');
}

async function saveExtraIncome(e) {
    e.preventDefault();
    showSyncStatus(true);
    
    try {
        await db.collection('users').doc(getUID()).collection('income').add({
            source: document.getElementById('extraSource').value,
            amount: parseFloat(document.getElementById('extraAmount').value),
            type: document.getElementById('extraType').value,
            frequency: document.getElementById('extraFreq').value,
            date: new Date().toLocaleDateString('en-IN'),
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        closeModal();
        showToast('Extra income added!', 'success');
        loadExtraIncome();
    } catch (err) {
        showToast('Error saving', 'error');
    }
    showSyncStatus(false);
}

async function loadExtraIncome() {
    var uid = getUID();
    try {
        var snapshot = await db.collection('users').doc(uid).collection('income').get();
        
        var incomes = [];
        snapshot.forEach(function(doc) { incomes.push({ id: doc.id, data: doc.data() }); });
        
        var el = document.getElementById('extraIncomeList');
        
        if (incomes.length === 0) {
            el.innerHTML = '<p class="text-muted">No extra income sources. Add one!</p>';
            return;
        }
        
        var html = '';
        var total = 0;
        
        incomes.forEach(function(inc) {
            total += inc.data.amount || 0;
            html += '<div class="income-card" style="background: var(--dark); padding: 15px; border-radius: 8px; border-left: 3px solid var(--success); margin-bottom: 10px;">' +
                '<div class="flex-between"><div><div class="fw-700">' + inc.data.source + '</div><div class="fs-11 text-muted">' + inc.data.type + ' - ' + (inc.data.frequency || 'Monthly') + '</div></div><div class="text-right"><div class="text-success fw-700">+' + formatCurrency(inc.data.amount) + '</div><button class="btn btn-sm btn-danger" onclick="deleteIncome(\'' + inc.id + '\')"><i class="fas fa-trash"></i></button></div></div></div>';
        });
        
        html += '<div class="flex-between mt-15" style="padding: 15px; background: rgba(46, 203, 113, 0.1); border-radius: 8px;"><span class="fw-700">Total Extra Income</span><span class="text-success fw-800 fs-18">' + formatCurrency(total) + '</span></div>';
        
        el.innerHTML = html;
    } catch (err) {
        console.error(err);
    }
}

console.log('App.js loaded successfully');
