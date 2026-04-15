// ============================================
// OTHER EXPENSES MODULE
// ============================================

function renderExpenses(container) {
    container.innerHTML = `
        <div class="section">
            <div class="section-header">
                <h2 class="section-title"><i class="fas fa-shopping-cart"></i> Other Monthly Expenses</h2>
                <button class="btn btn-primary btn-sm" onclick="openAddExpenseModal()">
                    <i class="fas fa-plus"></i> Add Expense
                </button>
            </div>
            <div class="section-body" id="expenseList">
                <div class="flex-center"><div class="spinner"></div></div>
            </div>
        </div>
    `;
    loadExpenses();
}

async function loadExpenses() {
    const uid = getUID();
    try {
        const snapshot = await db.collection('users').doc(uid)
            .collection('expenses').orderBy('createdAt', 'desc').get();
        
        const expenses = [];
        snapshot.forEach(doc => expenses.push({ id: doc.id, ...doc.data() }));
        
        const el = document.getElementById('expenseList');
        
        if (expenses.length === 0) {
            el.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>No expenses tracked</h3>
                    <p>Add your monthly recurring expenses</p>
                    <button class="btn btn-primary" onclick="openAddExpenseModal()">
                        <i class="fas fa-plus"></i> Add Expense
                    </button>
                </div>`;
            return;
        }
        
        let html = `<div class="table-responsive"><table class="data-table">
            <thead><tr>
                <th>Expense</th><th>Category</th><th>Amount</th><th>Frequency</th><th>Actions</th>
            </tr></thead><tbody>`;
        
        let total = 0;
        expenses.forEach(exp => {
            total += exp.amount || 0;
            const categoryColors = {
                'Food & Dining': 'tag-danger',
                'Transportation': 'tag-info',
                'Shopping': 'tag-primary',
                'Entertainment': 'tag-warning',
                'Healthcare': 'tag-success',
                'Groceries': 'tag-warning',
                'Personal Care': 'tag-primary'
            };
            
            html += `<tr>
                <td><strong>${exp.name}</strong></td>
                <td><span class="tag ${categoryColors[exp.category] || 'tag-info'}">${exp.category || 'Other'}</span></td>
                <td class="text-danger fw-700">${formatCurrency(exp.amount)}</td>
                <td>${exp.frequency || 'Monthly'}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteExpense('${exp.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>`;
        });
        
        html += `</tbody></table></div>
            <div class="flex-between mt-20" style="padding:15px;background:var(--dark);border-radius:var(--radius-sm)">
                <span class="fw-700">Total Monthly Expenses</span>
                <span class="text-danger fw-800 fs-18">${formatCurrency(total)}</span>
            </div>`;
        
        el.innerHTML = html;
    } catch (err) { console.error(err); }
}

function openAddExpenseModal() {
    openModal(`
        <div class="modal-header">
            <h2>Add Expense</h2>
            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
        </div>
        <form onsubmit="saveExpense(event)">
            <div class="form-group">
                <label>Expense Name</label>
                <input type="text" id="expName" placeholder="e.g., Groceries, Gym" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Amount (₹)</label>
                    <input type="number" id="expAmount" placeholder="3000" required>
                </div>
                <div class="form-group">
                    <label>Category</label>
                    <select id="expCategory">
                        <option value="Food & Dining">Food & Dining</option>
                        <option value="Groceries">Groceries</option>
                        <option value="Transportation">Transportation</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Education">Education</option>
                        <option value="Personal Care">Personal Care</option>
                        <option value="Subscriptions">Subscriptions</option>
                        <option value="Miscellaneous">Miscellaneous</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>Frequency</label>
                <select id="expFreq">
                    <option value="Monthly">Monthly</option>
                    <option value="Weekly">Weekly</option>
                    <option value="One-time">One-time</option>
                </select>
            </div>
            <div class="form-group">
                <label>Notes (Optional)</label>
                <textarea id="expNotes" placeholder="Any details..."></textarea>
            </div>
            <button type="submit" class="btn btn-success btn-full mt-15">
                <i class="fas fa-save"></i> Save Expense
            </button>
        </form>
    `);
}

async function saveExpense(e) {
    e.preventDefault();
    showSyncStatus(true);
    try {
        await db.collection('users').doc(getUID()).collection('expenses').add({
            name: document.getElementById('expName').value,
            amount: parseFloat(document.getElementById('expAmount').value),
            category: document.getElementById('expCategory').value,
            frequency: document.getElementById('expFreq').value,
            notes: document.getElementById('expNotes').value,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        closeModal();
        showToast('Expense added!', 'success');
        loadExpenses();
    } catch (err) {
        showToast('Error', 'error');
    }
    showSyncStatus(false);
}

async function deleteExpense(id) {
    if (!confirm('Delete this expense?')) return;
    showSyncStatus(true);
    try {
        await db.collection('users').doc(getUID()).collection('expenses').doc(id).delete();
        showToast('Deleted', 'info');
        loadExpenses();
    } catch (err) { showToast('Error', 'error'); }
    showSyncStatus(false);
}