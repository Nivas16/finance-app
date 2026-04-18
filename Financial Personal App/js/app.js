// ============ ENHANCED DAILY EXPENSES WITH CATEGORY ANALYSIS ============
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
    var categoryFilter = document.getElementById('dailyExpenseCategory') ? document.getElementById('dailyExpenseCategory').value : '';
    
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
        
        // Group by date
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
        
        // Summary
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
        
        // Group by category
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

console.log('Enhanced Daily Expenses loaded');
