// ============================================
// ADMIN PANEL MODULE - ENHANCED v3.0
// ============================================

// ---- DEFAULT FORMULA REGISTRY ----
const DEFAULT_FORMULAS = {
    bankLoanOutstanding: {
        label: 'Bank Loan Outstanding Balance',
        description: 'Calculates remaining balance using reducing balance method',
        formula: 'P * (pow(1+r,n) - pow(1+r,p)) / (pow(1+r,n) - 1)',
        variables: 'P=loanAmount, r=monthlyRate(annualRate/12/100), n=totalEMIs, p=paidEMIs',
        category: 'Loan'
    },
    bankLoanEMI: {
        label: 'Bank EMI Calculation',
        description: 'Standard EMI formula for reducing balance loans',
        formula: 'P * r * pow(1+r, n) / (pow(1+r, n) - 1)',
        variables: 'P=principal, r=monthlyRate, n=tenureMonths',
        category: 'Loan'
    },
    friendLoanRemaining: {
        label: 'Friend Loan Remaining',
        description: 'Simple subtraction - no interest on friend loans',
        formula: '(totalEMIs - paidEMIs) * emiAmount',
        variables: 'totalEMIs=total installments, paidEMIs=paid so far, emiAmount=monthly amount',
        category: 'Loan'
    },
    sipMaturity: {
        label: 'SIP Maturity Value',
        description: 'Calculates SIP maturity amount with compounding',
        formula: 'P * (pow(1 + r, n) - 1) / r * (1 + r)',
        variables: 'P=monthly SIP amount, r=monthlyReturn(annualReturn/12/100), n=months',
        category: 'Investment'
    },
    sipTotalInvested: {
        label: 'SIP Total Invested',
        description: 'Total amount invested in SIP',
        formula: 'monthlyAmount * totalMonths',
        variables: 'monthlyAmount=SIP per month, totalMonths=tenure in months',
        category: 'Investment'
    },
    creditCardInterest: {
        label: 'Credit Card Monthly Interest',
        description: 'Monthly interest on outstanding credit card balance',
        formula: 'outstandingBalance * (annualRate / 12 / 100)',
        variables: 'outstandingBalance=unpaid amount, annualRate=card interest rate (e.g. 36)',
        category: 'Credit Card'
    },
    budgetSurplus: {
        label: 'Monthly Budget Surplus',
        description: 'Net savings = Income - All Expenses',
        formula: 'totalIncome - (totalEMIs + totalBills + rentAmount + totalExpenses)',
        variables: 'All monthly outgoing amounts summed and subtracted from income',
        category: 'Budget'
    }
};

function getFormulas() {
    try {
        const saved = localStorage.getItem('adminFormulas');
        return saved ? Object.assign({}, DEFAULT_FORMULAS, JSON.parse(saved)) : Object.assign({}, DEFAULT_FORMULAS);
    } catch (e) { return Object.assign({}, DEFAULT_FORMULAS); }
}

function saveFormulas(formulas) {
    const overrides = {};
    for (const key in formulas) {
        if (JSON.stringify(formulas[key]) !== JSON.stringify(DEFAULT_FORMULAS[key])) {
            overrides[key] = formulas[key];
        }
    }
    localStorage.setItem('adminFormulas', JSON.stringify(overrides));
}

// ---- MAIN RENDER ----
async function renderAdmin(container) {
    const userData = getUserData();
    container.innerHTML = `
    <div class="admin-tabs" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px">
        <button class="btn btn-primary btn-sm admin-tab-btn" onclick="showAdminTab('profile',this)"><i class="fas fa-user"></i> Profile</button>
        <button class="btn btn-outline btn-sm admin-tab-btn" onclick="showAdminTab('formulas',this)"><i class="fas fa-calculator"></i> Formulas</button>
        <button class="btn btn-outline btn-sm admin-tab-btn" onclick="showAdminTab('modules',this)"><i class="fas fa-cubes"></i> Modules</button>
        <button class="btn btn-outline btn-sm admin-tab-btn" onclick="showAdminTab('sharemarket',this)"><i class="fas fa-chart-line"></i> Share Market</button>
        <button class="btn btn-outline btn-sm admin-tab-btn" onclick="showAdminTab('data',this)"><i class="fas fa-database"></i> Data</button>
        <button class="btn btn-outline btn-sm admin-tab-btn" onclick="showAdminTab('settings',this)"><i class="fas fa-cog"></i> Settings</button>
    </div>

    <div id="adminTab-profile" class="admin-tab-content">
        <div class="admin-grid">
            <div class="admin-card">
                <h3><i class="fas fa-user" style="color:var(--primary)"></i> Profile Settings</h3>
                <form onsubmit="updateProfile(event)">
                    <div class="form-group"><label>Full Name</label><input type="text" id="adminName" value="${userData && userData.name ? userData.name : ''}" required></div>
                    <div class="form-group"><label>Email</label><input type="email" value="${window.currentUser && window.currentUser.email ? window.currentUser.email : ''}" disabled></div>
                    <div class="form-group"><label>Monthly Income (Rs.)</label><input type="number" id="adminIncome" value="${userData && userData.monthlyIncome ? userData.monthlyIncome : ''}" required></div>
                    <div class="form-group"><label>Currency</label>
                        <select id="adminCurrency">
                            <option value="Rs." ${userData && userData.currency === 'Rs.' ? 'selected' : ''}>Rs. INR</option>
                            <option value="$" ${userData && userData.currency === '$' ? 'selected' : ''}>$ USD</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary btn-full mt-10"><i class="fas fa-save"></i> Update Profile</button>
                </form>
            </div>
            <div class="admin-card">
                <h3><i class="fas fa-info-circle" style="color:var(--primary)"></i> App Info</h3>
                <div class="flex-col gap-10">
                    <div class="flex-between"><span class="text-muted">Version</span><span class="fw-600">3.0.0</span></div>
                    <div class="flex-between"><span class="text-muted">Database</span><span class="fw-600 text-success">Firebase Connected</span></div>
                    <div class="flex-between"><span class="text-muted">Offline Mode</span><span class="fw-600 text-success">Enabled</span></div>
                    <div class="flex-between"><span class="text-muted">Last Sync</span><span class="fw-600">${new Date().toLocaleTimeString()}</span></div>
                </div>
                <div class="mt-15 flex-col gap-10">
                    <button class="btn btn-outline btn-full" onclick="resetMonthlyBills()"><i class="fas fa-redo"></i> Reset Monthly Bills</button>
                    <button class="btn btn-outline btn-full" onclick="generateMonthlyReport()"><i class="fas fa-file-pdf"></i> Monthly Report</button>
                    <button class="btn btn-outline btn-full" onclick="navigateTo('ai-advisor')"><i class="fas fa-robot"></i> AI Financial Checkup</button>
                </div>
            </div>
        </div>
    </div>

    <div id="adminTab-formulas" class="admin-tab-content" style="display:none">
        <div class="admin-card" style="margin-bottom:15px">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
                <h3 style="margin:0"><i class="fas fa-calculator" style="color:var(--warning)"></i> Formula Manager</h3>
                <div style="display:flex;gap:8px;flex-wrap:wrap">
                    <button class="btn btn-sm btn-outline" onclick="resetAllFormulas()"><i class="fas fa-undo"></i> Reset All</button>
                    <button class="btn btn-sm btn-primary" onclick="openAddFormulaModal()"><i class="fas fa-plus"></i> Add Formula</button>
                </div>
            </div>
            <p class="text-muted fs-12 mt-10">Edit calculation formulas used across all modules. Use JS math shortcuts: pow(base,exp), sqrt(x), abs(x), round(x). Yellow badge = you modified it.</p>
        </div>
        <div id="formulaList"></div>
    </div>

    <div id="adminTab-modules" class="admin-tab-content" style="display:none">
        <div id="modulesConfigArea"></div>
    </div>

    <div id="adminTab-sharemarket" class="admin-tab-content" style="display:none">
        <div id="shareMarketArea"></div>
    </div>

    <div id="adminTab-data" class="admin-tab-content" style="display:none">
        <div class="admin-grid">
            <div class="admin-card">
                <h3><i class="fas fa-database" style="color:var(--warning)"></i> Data Management</h3>
                <div class="flex-col gap-10">
                    <button class="btn btn-outline btn-full" onclick="exportData()"><i class="fas fa-download"></i> Export All Data (JSON)</button>
                    <button class="btn btn-outline btn-full" onclick="document.getElementById('importFile').click()"><i class="fas fa-upload"></i> Import Data</button>
                    <input type="file" id="importFile" accept=".json" style="display:none" onchange="importData(event)">
                    <button class="btn btn-danger btn-full" onclick="resetAllData()"><i class="fas fa-exclamation-triangle"></i> Reset All Data</button>
                </div>
            </div>
            <div class="admin-card">
                <h3><i class="fas fa-chart-pie" style="color:var(--info)"></i> Data Statistics</h3>
                <div id="dataStats"><div class="flex-center"><div class="spinner"></div></div></div>
            </div>
        </div>
    </div>

    <div id="adminTab-settings" class="admin-tab-content" style="display:none">
        <div class="admin-grid">
            <div class="admin-card">
                <h3><i class="fas fa-bell" style="color:var(--info)"></i> Notification Settings</h3>
                <div class="flex-col gap-15">
                    <label class="flex gap-10" style="cursor:pointer"><input type="checkbox" id="notifBudget" ${userData && userData.settings && userData.settings.budgetAlerts !== false ? 'checked' : ''}> <span>Budget alerts when overspending</span></label>
                    <label class="flex gap-10" style="cursor:pointer"><input type="checkbox" id="notifEMI" ${userData && userData.settings && userData.settings.emiReminders !== false ? 'checked' : ''}> <span>EMI payment reminders</span></label>
                    <label class="flex gap-10" style="cursor:pointer"><input type="checkbox" id="notifSavings" ${userData && userData.settings && userData.settings.savingsTips !== false ? 'checked' : ''}> <span>Weekly savings tips</span></label>
                </div>
                <button class="btn btn-primary btn-full mt-15" onclick="saveNotifSettings()"><i class="fas fa-save"></i> Save Settings</button>
            </div>
        </div>
    </div>`;

    loadDataStats();
    renderFormulaList();
    renderModulesConfig();
    renderShareMarket();
}

function showAdminTab(tab, btn) {
    document.querySelectorAll('.admin-tab-content').forEach(function(el) { el.style.display = 'none'; });
    document.querySelectorAll('.admin-tab-btn').forEach(function(b) {
        b.className = b.className.replace('btn-primary', 'btn-outline');
    });
    document.getElementById('adminTab-' + tab).style.display = '';
    btn.className = btn.className.replace('btn-outline', 'btn-primary');
}

// ---- FORMULA MANAGER ----
function renderFormulaList() {
    const formulas = getFormulas();
    const el = document.getElementById('formulaList');
    if (!el) return;
    const categories = [];
    Object.values(formulas).forEach(function(f) { if (categories.indexOf(f.category) === -1) categories.push(f.category); });

    let html = '';
    categories.forEach(function(cat) {
        html += '<div class="admin-card mb-15"><h4 style="color:var(--primary);margin-bottom:15px"><i class="fas fa-tag"></i> ' + cat + '</h4>';
        Object.entries(formulas).filter(function(e) { return e[1].category === cat; }).forEach(function(entry) {
            const key = entry[0];
            const f = entry[1];
            const savedOverrides = JSON.parse(localStorage.getItem('adminFormulas') || '{}');
            const isModified = !!savedOverrides[key];
            const isCustom = !DEFAULT_FORMULAS[key];
            html += '<div class="formula-card" style="background:var(--dark);border-radius:8px;padding:15px;margin-bottom:10px;border-left:3px solid ' + (isModified || isCustom ? 'var(--warning)' : 'var(--primary)') + '">' +
                '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap">' +
                '<div><div class="fw-700">' + f.label + (isModified ? ' <span class="tag tag-warning" style="font-size:10px">Modified</span>' : '') + (isCustom ? ' <span class="tag tag-info" style="font-size:10px">Custom</span>' : '') + '</div>' +
                '<div class="text-muted fs-12 mt-5">' + f.description + '</div></div>' +
                '<div style="display:flex;gap:6px;flex-shrink:0">' +
                '<button class="btn btn-sm btn-primary" onclick="openEditFormulaModal(\'' + key + '\')"><i class="fas fa-edit"></i> Edit</button>' +
                (isModified ? '<button class="btn btn-sm btn-outline" onclick="resetFormula(\'' + key + '\')"><i class="fas fa-undo"></i></button>' : '') +
                (isCustom ? '<button class="btn btn-sm btn-danger" onclick="deleteCustomFormula(\'' + key + '\')"><i class="fas fa-trash"></i></button>' : '') +
                '</div></div>' +
                '<div style="margin-top:12px;background:#0d0d1a;padding:10px;border-radius:6px;font-family:monospace;font-size:13px;color:#a8edea;overflow-x:auto">f(x) = ' + f.formula + '</div>' +
                '<div class="text-muted fs-11 mt-8"><i class="fas fa-info-circle"></i> Variables: ' + f.variables + '</div>' +
                '</div>';
        });
        html += '</div>';
    });
    el.innerHTML = html;
}

function openEditFormulaModal(key) {
    const formulas = getFormulas();
    const f = formulas[key];
    if (!f) return;
    openModal('<div class="modal-header"><h2><i class="fas fa-calculator"></i> Edit Formula: ' + f.label + '</h2><button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button></div>' +
        '<div class="form-group"><label>Formula Expression</label><textarea id="editFormulaExpr" style="font-family:monospace;font-size:14px;min-height:80px">' + f.formula + '</textarea><div class="text-muted fs-11 mt-5">Use: pow(base,exp), sqrt(x), abs(x), round(x)</div></div>' +
        '<div class="form-group"><label>Variables Description</label><input type="text" id="editFormulaVars" value="' + f.variables + '"></div>' +
        '<div class="form-group"><label>Test Formula</label><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><input type="text" id="editFormulaTestInput" placeholder=\'{"P":100000,"r":0.01,"n":24,"p":6}\' style="flex:1;min-width:200px"><button class="btn btn-sm btn-outline" onclick="testFormula()"><i class="fas fa-play"></i> Test</button></div><div id="formulaTestResult" class="mt-10 fs-14" style="min-height:24px"></div></div>' +
        '<div style="display:flex;gap:10px;margin-top:15px"><button class="btn btn-success btn-full" onclick="saveFormulaEdit(\'' + key + '\')"><i class="fas fa-save"></i> Save</button><button class="btn btn-outline" onclick="closeModal()">Cancel</button></div>');
}

function testFormula() {
    const expr = document.getElementById('editFormulaExpr') ? document.getElementById('editFormulaExpr').value : '';
    const inputStr = document.getElementById('editFormulaTestInput') ? document.getElementById('editFormulaTestInput').value : '';
    const resultEl = document.getElementById('formulaTestResult');
    if (!expr || !resultEl) return;
    try {
        const vars = inputStr ? JSON.parse(inputStr) : {};
        const safeExpr = expr.replace(/\bpow\b/g, 'Math.pow').replace(/\bsqrt\b/g, 'Math.sqrt').replace(/\babs\b/g, 'Math.abs').replace(/\bround\b/g, 'Math.round').replace(/\bfloor\b/g, 'Math.floor').replace(/\bceil\b/g, 'Math.ceil');
        const keys = Object.keys(vars);
        const vals = Object.values(vars);
        const fn = new Function(keys, 'return ' + safeExpr);
        const result = fn.apply(null, vals);
        resultEl.innerHTML = '<span style="color:#2ecc71">Result: <strong>' + (isNaN(result) ? 'NaN' : Number(result).toFixed(4)) + '</strong></span>';
    } catch (err) {
        resultEl.innerHTML = '<span style="color:#e74c3c">Error: ' + err.message + '</span>';
    }
}

function saveFormulaEdit(key) {
    const expr = document.getElementById('editFormulaExpr') ? document.getElementById('editFormulaExpr').value.trim() : '';
    const vars = document.getElementById('editFormulaVars') ? document.getElementById('editFormulaVars').value.trim() : '';
    if (!expr) { showToast('Formula cannot be empty', 'error'); return; }
    const formulas = getFormulas();
    formulas[key] = Object.assign({}, formulas[key], { formula: expr, variables: vars });
    saveFormulas(formulas);
    closeModal();
    showToast('Formula saved!', 'success');
    renderFormulaList();
}

function openAddFormulaModal() {
    openModal('<div class="modal-header"><h2><i class="fas fa-plus"></i> Add Custom Formula</h2><button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button></div>' +
        '<div class="form-group"><label>Formula Key (camelCase, no spaces)</label><input type="text" id="newFormulaKey" placeholder="e.g. myCustomCalc"></div>' +
        '<div class="form-group"><label>Label</label><input type="text" id="newFormulaLabel" placeholder="My Custom Calculation"></div>' +
        '<div class="form-group"><label>Description</label><input type="text" id="newFormulaDesc" placeholder="What does this calculate?"></div>' +
        '<div class="form-group"><label>Category</label><select id="newFormulaCat"><option>Loan</option><option>Investment</option><option>Credit Card</option><option>Budget</option><option>Custom</option></select></div>' +
        '<div class="form-group"><label>Formula</label><textarea id="newFormulaExpr" style="font-family:monospace" placeholder="P * r * pow(1+r, n) / (pow(1+r, n) - 1)"></textarea></div>' +
        '<div class="form-group"><label>Variables</label><input type="text" id="newFormulaVars" placeholder="P=principal, r=rate, n=months"></div>' +
        '<button class="btn btn-success btn-full mt-15" onclick="saveNewFormula()"><i class="fas fa-save"></i> Add Formula</button>');
}

function saveNewFormula() {
    const key = (document.getElementById('newFormulaKey').value || '').trim().replace(/\s+/g, '_');
    const label = (document.getElementById('newFormulaLabel').value || '').trim();
    const desc = (document.getElementById('newFormulaDesc').value || '').trim();
    const cat = document.getElementById('newFormulaCat').value;
    const expr = (document.getElementById('newFormulaExpr').value || '').trim();
    const vars = (document.getElementById('newFormulaVars').value || '').trim();
    if (!key || !label || !expr) { showToast('Key, label and formula required', 'error'); return; }
    const formulas = getFormulas();
    if (formulas[key]) { showToast('Key already exists', 'error'); return; }
    formulas[key] = { label: label, description: desc, formula: expr, variables: vars, category: cat };
    saveFormulas(formulas);
    closeModal();
    showToast('Formula added!', 'success');
    renderFormulaList();
}

function resetFormula(key) {
    if (!confirm('Reset "' + key + '" to default?')) return;
    const saved = JSON.parse(localStorage.getItem('adminFormulas') || '{}');
    delete saved[key];
    localStorage.setItem('adminFormulas', JSON.stringify(saved));
    showToast('Reset to default', 'info');
    renderFormulaList();
}

function deleteCustomFormula(key) {
    if (!confirm('Delete custom formula "' + key + '"?')) return;
    const formulas = getFormulas();
    delete formulas[key];
    saveFormulas(formulas);
    showToast('Deleted', 'info');
    renderFormulaList();
}

function resetAllFormulas() {
    if (!confirm('Reset ALL formulas to defaults?')) return;
    localStorage.removeItem('adminFormulas');
    showToast('All formulas reset', 'info');
    renderFormulaList();
}

// ---- MODULES CONFIG ----
function getModuleFields(moduleKey) {
    try {
        const saved = localStorage.getItem('moduleFields_' + moduleKey);
        return saved ? JSON.parse(saved) : getDefaultModuleFields(moduleKey);
    } catch (e) { return getDefaultModuleFields(moduleKey); }
}

function saveModuleFields(moduleKey, fields) {
    localStorage.setItem('moduleFields_' + moduleKey, JSON.stringify(fields));
}

function getDefaultModuleFields(moduleKey) {
    const defaults = {
        indusind_loan: [
            { id: 'loanAmount', label: 'Loan Amount (Rs.)', type: 'number', required: true },
            { id: 'tenure', label: 'Tenure (Months)', type: 'number', required: true },
            { id: 'interestRate', label: 'Interest Rate (% p.a.)', type: 'number', required: true },
            { id: 'emiAmount', label: 'EMI Amount (Rs.)', type: 'number', required: true },
            { id: 'totalPaid', label: 'Total Paid So Far (Rs.)', type: 'number', required: false },
            { id: 'startDate', label: 'Start Date', type: 'date', required: false }
        ],
        cred_loan: [
            { id: 'loanAmount', label: 'Loan Amount (Rs.)', type: 'number', required: true },
            { id: 'tenure', label: 'Tenure (Months)', type: 'number', required: true },
            { id: 'interestRate', label: 'Interest Rate (% p.a.)', type: 'number', required: true },
            { id: 'emiAmount', label: 'EMI Amount (Rs.)', type: 'number', required: true },
            { id: 'totalPaid', label: 'Total Paid So Far (Rs.)', type: 'number', required: false },
            { id: 'remainingBalance', label: 'Remaining Balance (Rs.)', type: 'number', required: false }
        ],
        friend_loan: [
            { id: 'personName', label: 'Person Name', type: 'text', required: true },
            { id: 'loanAmount', label: 'Loan Amount (Rs.)', type: 'number', required: true },
            { id: 'emiAmount', label: 'Monthly Repayment (Rs.)', type: 'number', required: true },
            { id: 'paidAmount', label: 'Already Paid (Rs.)', type: 'number', required: false },
            { id: 'phone', label: 'Phone Number', type: 'text', required: false },
            { id: 'loanDate', label: 'Loan Date', type: 'date', required: false }
        ],
        sip: [
            { id: 'sipName', label: 'SIP Name / Fund', type: 'text', required: true },
            { id: 'platform', label: 'Platform (Groww/Zerodha etc)', type: 'text', required: false },
            { id: 'monthlyAmount', label: 'Monthly SIP Amount (Rs.)', type: 'number', required: true },
            { id: 'expectedReturn', label: 'Expected Annual Return (%)', type: 'number', required: true },
            { id: 'tenure', label: 'Tenure (Years)', type: 'number', required: true },
            { id: 'startDate', label: 'Start Date', type: 'date', required: false }
        ],
        credit_card: [
            { id: 'cardName', label: 'Card Name / Bank', type: 'text', required: true },
            { id: 'cardLimit', label: 'Credit Limit (Rs.)', type: 'number', required: true },
            { id: 'outstanding', label: 'Current Outstanding (Rs.)', type: 'number', required: true },
            { id: 'minDue', label: 'Minimum Due (Rs.)', type: 'number', required: false },
            { id: 'dueDate', label: 'Due Date (Day of Month)', type: 'number', required: false },
            { id: 'interestRate', label: 'Interest Rate (% p.a.)', type: 'number', required: false }
        ],
        expenses_fixed: [
            { id: 'roomRent', label: 'Room Rent (Rs.)', type: 'number', required: true },
            { id: 'lightBill', label: 'Electricity/Light Bill (Rs.)', type: 'number', required: true },
            { id: 'trainPass', label: 'Train Pass (Rs.)', type: 'number', required: true },
            { id: 'busAuto', label: 'Bus / Auto Daily Avg (Rs.)', type: 'number', required: false }
        ],
        expenses_variable: [
            { id: 'grocery', label: 'Grocery (Rs.)', type: 'number', required: false },
            { id: 'babyExpenses', label: 'Baby Expenses (Rs.)', type: 'number', required: false },
            { id: 'food', label: 'Food / Eating Out (Rs.)', type: 'number', required: false },
            { id: 'shopping', label: 'Shopping (Rs.)', type: 'number', required: false },
            { id: 'miscSmallItems', label: 'Misc / Small Home Items (Rs.)', type: 'number', required: false }
        ]
    };
    return defaults[moduleKey] || [];
}

function renderModulesConfig() {
    const el = document.getElementById('modulesConfigArea');
    if (!el) return;
    const modules = [
        { key: 'indusind_loan', label: 'IndusInd Bank Loan (Personal)', icon: 'university', color: 'var(--primary)' },
        { key: 'cred_loan', label: 'CRED Loan', icon: 'credit-card', color: '#9B59B6' },
        { key: 'friend_loan', label: 'Friend Loans (Friend 1 - 50k & Friend 2 - 50k)', icon: 'user-friends', color: 'var(--warning)' },
        { key: 'sip', label: 'SIP Investments (SIP 3, SIP 4 & Groww SIP)', icon: 'chart-line', color: 'var(--success)' },
        { key: 'credit_card', label: 'Credit Cards (3 Cards)', icon: 'credit-card', color: 'var(--info)' },
        { key: 'expenses_fixed', label: 'Fixed Monthly Expenses (Rent, Light, Train Pass)', icon: 'home', color: '#E67E22' },
        { key: 'expenses_variable', label: 'Variable Expenses (Grocery, Baby, Food, Shopping)', icon: 'shopping-cart', color: 'var(--danger)' }
    ];

    let html = '<div style="margin-bottom:15px;padding:12px;background:var(--dark);border-radius:8px"><div class="text-muted fs-12"><i class="fas fa-info-circle"></i> Add or remove fields for each module. These control what fields appear in data entry forms across the app.</div></div>';
    modules.forEach(function(mod) {
        const fields = getModuleFields(mod.key);
        html += '<div class="admin-card mb-15"><div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:15px">' +
            '<h4 style="margin:0;color:' + mod.color + '"><i class="fas fa-' + mod.icon + '"></i> ' + mod.label + '</h4>' +
            '<button class="btn btn-sm btn-primary" onclick="openAddFieldModal(\'' + mod.key + '\')"><i class="fas fa-plus"></i> Add Field</button></div>' +
            '<div id="fieldList-' + mod.key + '">' + renderFieldListHtml(mod.key, fields) + '</div></div>';
    });
    el.innerHTML = html;
}

function renderFieldListHtml(moduleKey, fields) {
    if (!fields || fields.length === 0) return '<p class="text-muted fs-12">No fields configured.</p>';
    let html = '<div class="table-responsive"><table class="data-table" style="font-size:13px"><thead><tr><th>Field ID</th><th>Label</th><th>Type</th><th>Required</th><th>Actions</th></tr></thead><tbody>';
    fields.forEach(function(f, i) {
        html += '<tr><td><code>' + f.id + '</code></td><td>' + f.label + '</td><td><span class="tag tag-info">' + f.type + '</span></td>' +
            '<td>' + (f.required ? '<span class="tag tag-danger">Yes</span>' : '<span class="tag tag-success">No</span>') + '</td>' +
            '<td style="display:flex;gap:5px"><button class="btn btn-sm btn-outline" onclick="openEditFieldModal(\'' + moduleKey + '\',' + i + ')"><i class="fas fa-edit"></i></button>' +
            '<button class="btn btn-sm btn-danger" onclick="deleteModuleField(\'' + moduleKey + '\',' + i + ')"><i class="fas fa-trash"></i></button></td></tr>';
    });
    html += '</tbody></table></div>';
    return html;
}

function openAddFieldModal(moduleKey) {
    openModal('<div class="modal-header"><h2>Add Field — ' + moduleKey.replace(/_/g,' ') + '</h2><button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button></div>' +
        '<div class="form-group"><label>Field ID (camelCase)</label><input type="text" id="fieldId" placeholder="processingFee"></div>' +
        '<div class="form-group"><label>Label (shown in form)</label><input type="text" id="fieldLabel" placeholder="Processing Fee (Rs.)"></div>' +
        '<div class="form-group"><label>Type</label><select id="fieldType"><option value="number">Number</option><option value="text">Text</option><option value="date">Date</option><option value="select">Select</option></select></div>' +
        '<div class="form-group"><label class="flex gap-10" style="cursor:pointer"><input type="checkbox" id="fieldRequired"> Required field</label></div>' +
        '<button class="btn btn-success btn-full mt-15" onclick="saveNewField(\'' + moduleKey + '\')"><i class="fas fa-save"></i> Add Field</button>');
}

function saveNewField(moduleKey) {
    const id = (document.getElementById('fieldId').value || '').trim();
    const label = (document.getElementById('fieldLabel').value || '').trim();
    const type = document.getElementById('fieldType').value;
    const required = document.getElementById('fieldRequired').checked;
    if (!id || !label) { showToast('ID and Label required', 'error'); return; }
    const fields = getModuleFields(moduleKey);
    if (fields.find(function(f) { return f.id === id; })) { showToast('Field ID already exists', 'error'); return; }
    fields.push({ id: id, label: label, type: type, required: required });
    saveModuleFields(moduleKey, fields);
    closeModal();
    showToast('Field added!', 'success');
    const el = document.getElementById('fieldList-' + moduleKey);
    if (el) el.innerHTML = renderFieldListHtml(moduleKey, getModuleFields(moduleKey));
}

function openEditFieldModal(moduleKey, index) {
    const fields = getModuleFields(moduleKey);
    const f = fields[index];
    if (!f) return;
    openModal('<div class="modal-header"><h2>Edit Field</h2><button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button></div>' +
        '<div class="form-group"><label>Field ID (read-only)</label><input type="text" value="' + f.id + '" disabled style="opacity:0.6"></div>' +
        '<div class="form-group"><label>Label</label><input type="text" id="editFieldLabel" value="' + f.label + '"></div>' +
        '<div class="form-group"><label>Type</label><select id="editFieldType"><option value="number" ' + (f.type==='number'?'selected':'') + '>Number</option><option value="text" ' + (f.type==='text'?'selected':'') + '>Text</option><option value="date" ' + (f.type==='date'?'selected':'') + '>Date</option><option value="select" ' + (f.type==='select'?'selected':'') + '>Select</option></select></div>' +
        '<div class="form-group"><label class="flex gap-10" style="cursor:pointer"><input type="checkbox" id="editFieldRequired" ' + (f.required?'checked':'') + '> Required</label></div>' +
        '<button class="btn btn-success btn-full mt-15" onclick="updateModuleField(\'' + moduleKey + '\',' + index + ')"><i class="fas fa-save"></i> Update</button>');
}

function updateModuleField(moduleKey, index) {
    const fields = getModuleFields(moduleKey);
    fields[index].label = (document.getElementById('editFieldLabel').value || '').trim() || fields[index].label;
    fields[index].type = document.getElementById('editFieldType').value;
    fields[index].required = document.getElementById('editFieldRequired').checked;
    saveModuleFields(moduleKey, fields);
    closeModal();
    showToast('Field updated!', 'success');
    const el = document.getElementById('fieldList-' + moduleKey);
    if (el) el.innerHTML = renderFieldListHtml(moduleKey, getModuleFields(moduleKey));
}

function deleteModuleField(moduleKey, index) {
    if (!confirm('Delete this field?')) return;
    const fields = getModuleFields(moduleKey);
    fields.splice(index, 1);
    saveModuleFields(moduleKey, fields);
    showToast('Field deleted', 'info');
    const el = document.getElementById('fieldList-' + moduleKey);
    if (el) el.innerHTML = renderFieldListHtml(moduleKey, getModuleFields(moduleKey));
}

// ---- SHARE MARKET ----
function renderShareMarket() {
    const el = document.getElementById('shareMarketArea');
    if (!el) return;
    const savedPrefs = JSON.parse(localStorage.getItem('shareMarketPrefs') || '{}');

    el.innerHTML = '<div class="admin-card mb-15">' +
        '<h3 style="margin-bottom:15px"><i class="fas fa-chart-line" style="color:var(--success)"></i> Share Market Investment Tracker</h3>' +
        '<div class="admin-grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin-bottom:15px">' +
        '<div style="background:var(--dark);padding:15px;border-radius:8px">' +
        '<div class="fs-12 text-muted">Monthly Budget for Stocks</div>' +
        '<input type="number" id="smMonthlyBudget" value="' + (savedPrefs.monthlyBudget||'') + '" placeholder="5000" style="margin-top:8px;width:100%;background:transparent;border:1px solid var(--border);border-radius:6px;padding:6px;color:var(--text)">' +
        '</div>' +
        '<div style="background:var(--dark);padding:15px;border-radius:8px">' +
        '<div class="fs-12 text-muted">Risk Appetite</div>' +
        '<select id="smRisk" style="margin-top:8px;width:100%;background:var(--dark);border:1px solid var(--border);border-radius:6px;padding:6px;color:var(--text)">' +
        '<option value="low" ' + (savedPrefs.risk==='low'?'selected':'') + '>Low (Large Cap)</option>' +
        '<option value="medium" ' + (savedPrefs.risk==='medium'?'selected':'') + '>Medium (Mid Cap)</option>' +
        '<option value="high" ' + (savedPrefs.risk==='high'?'selected':'') + '>High (Small/Speculative)</option>' +
        '</select></div>' +
        '<div style="background:var(--dark);padding:15px;border-radius:8px">' +
        '<div class="fs-12 text-muted">Investment Horizon</div>' +
        '<select id="smHorizon" style="margin-top:8px;width:100%;background:var(--dark);border:1px solid var(--border);border-radius:6px;padding:6px;color:var(--text)">' +
        '<option value="short" ' + (savedPrefs.horizon==='short'?'selected':'') + '>Short (&lt; 1 yr)</option>' +
        '<option value="medium" ' + (savedPrefs.horizon==='medium'?'selected':'') + '>Medium (1-3 yrs)</option>' +
        '<option value="long" ' + (savedPrefs.horizon==='long'?'selected':'') + '>Long (3+ yrs)</option>' +
        '</select></div></div>' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap">' +
        '<button class="btn btn-success" onclick="saveShareMarketPrefs()"><i class="fas fa-save"></i> Save Preferences</button>' +
        '<button class="btn btn-primary" onclick="getShareRecommendation(event)"><i class="fas fa-robot"></i> Get AI Stock Recommendation</button>' +
        '</div></div>' +
        '<div class="admin-card mb-15"><div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:15px">' +
        '<h4 style="margin:0"><i class="fas fa-briefcase" style="color:var(--warning)"></i> My Portfolio</h4>' +
        '<button class="btn btn-sm btn-primary" onclick="openAddHoldingModal()"><i class="fas fa-plus"></i> Add Holding</button></div>' +
        '<div id="portfolioList">' + renderPortfolioListHtml() + '</div></div>' +
        '<div class="admin-card" id="smRecommendationCard" style="' + (savedPrefs.lastRec ? '' : 'display:none') + '">' +
        '<h4 style="margin-bottom:15px"><i class="fas fa-lightbulb" style="color:var(--warning)"></i> Latest AI Recommendation</h4>' +
        '<div id="smRecommendationContent">' + (savedPrefs.lastRec || '') + '</div>' +
        '<div class="text-muted fs-11 mt-10">Generated: ' + (savedPrefs.recDate || '') + '</div></div>';
}

function saveShareMarketPrefs() {
    const prefs = JSON.parse(localStorage.getItem('shareMarketPrefs') || '{}');
    prefs.monthlyBudget = document.getElementById('smMonthlyBudget') ? document.getElementById('smMonthlyBudget').value : prefs.monthlyBudget;
    prefs.risk = document.getElementById('smRisk') ? document.getElementById('smRisk').value : prefs.risk;
    prefs.horizon = document.getElementById('smHorizon') ? document.getElementById('smHorizon').value : prefs.horizon;
    localStorage.setItem('shareMarketPrefs', JSON.stringify(prefs));
    showToast('Preferences saved!', 'success');
}

function renderPortfolioListHtml() {
    const holdings = JSON.parse(localStorage.getItem('stockHoldings') || '[]');
    if (holdings.length === 0) return '<p class="text-muted fs-12">No holdings added yet. Click Add Holding to track your stocks.</p>';
    let totalInvested = 0;
    let html = '<div class="table-responsive"><table class="data-table" style="font-size:13px"><thead><tr><th>Stock</th><th>Qty</th><th>Buy Price</th><th>Invested</th><th>Notes</th><th>Action</th></tr></thead><tbody>';
    holdings.forEach(function(h, i) {
        const invested = (h.qty || 0) * (h.buyPrice || 0);
        totalInvested += invested;
        html += '<tr><td><strong>' + h.symbol + '</strong><br><span class="text-muted fs-11">' + (h.name||'') + '</span></td>' +
            '<td>' + h.qty + '</td><td>Rs.' + Number(h.buyPrice).toLocaleString('en-IN') + '</td>' +
            '<td>Rs.' + Number(invested).toLocaleString('en-IN') + '</td>' +
            '<td class="fs-12 text-muted">' + (h.notes||'-') + '</td>' +
            '<td><button class="btn btn-sm btn-danger" onclick="deleteHolding(' + i + ')"><i class="fas fa-trash"></i></button></td></tr>';
    });
    html += '</tbody></table></div><div style="text-align:right;margin-top:10px;font-weight:700">Total Invested: <span style="color:var(--success)">Rs.' + Number(totalInvested).toLocaleString('en-IN') + '</span></div>';
    return html;
}

function openAddHoldingModal() {
    openModal('<div class="modal-header"><h2>Add Stock Holding</h2><button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button></div>' +
        '<div class="form-row">' +
        '<div class="form-group"><label>NSE Symbol</label><input type="text" id="holdSymbol" placeholder="RELIANCE" style="text-transform:uppercase"></div>' +
        '<div class="form-group"><label>Company Name</label><input type="text" id="holdName" placeholder="Reliance Industries"></div></div>' +
        '<div class="form-row">' +
        '<div class="form-group"><label>Quantity</label><input type="number" id="holdQty" placeholder="10"></div>' +
        '<div class="form-group"><label>Buy Price (Rs.)</label><input type="number" id="holdPrice" placeholder="2500"></div></div>' +
        '<div class="form-group"><label>Notes (Optional)</label><input type="text" id="holdNotes" placeholder="Why I bought this..."></div>' +
        '<button class="btn btn-success btn-full mt-15" onclick="saveHolding()"><i class="fas fa-save"></i> Add Holding</button>');
}

function saveHolding() {
    const symbol = (document.getElementById('holdSymbol').value || '').trim().toUpperCase();
    const name = (document.getElementById('holdName').value || '').trim();
    const qty = parseFloat(document.getElementById('holdQty').value);
    const buyPrice = parseFloat(document.getElementById('holdPrice').value);
    const notes = (document.getElementById('holdNotes').value || '').trim();
    if (!symbol || !qty || !buyPrice) { showToast('Symbol, Qty and Price required', 'error'); return; }
    const holdings = JSON.parse(localStorage.getItem('stockHoldings') || '[]');
    holdings.push({ symbol: symbol, name: name, qty: qty, buyPrice: buyPrice, notes: notes, addedAt: new Date().toISOString() });
    localStorage.setItem('stockHoldings', JSON.stringify(holdings));
    closeModal();
    showToast('Holding added!', 'success');
    const el = document.getElementById('portfolioList');
    if (el) el.innerHTML = renderPortfolioListHtml();
}

function deleteHolding(index) {
    if (!confirm('Remove this holding?')) return;
    const holdings = JSON.parse(localStorage.getItem('stockHoldings') || '[]');
    holdings.splice(index, 1);
    localStorage.setItem('stockHoldings', JSON.stringify(holdings));
    showToast('Removed', 'info');
    const el = document.getElementById('portfolioList');
    if (el) el.innerHTML = renderPortfolioListHtml();
}

async function getShareRecommendation(event) {
    const btn = event ? event.target : document.querySelector('[onclick*="getShareRecommendation"]');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analysing...'; }

    const prefs = JSON.parse(localStorage.getItem('shareMarketPrefs') || '{}');
    const holdings = JSON.parse(localStorage.getItem('stockHoldings') || '[]');
    const userData = getUserData();
    const budget = prefs.monthlyBudget || 5000;
    const risk = prefs.risk || 'medium';
    const horizon = prefs.horizon || 'medium';
    const holdingStr = holdings.length > 0 ? holdings.map(function(h) { return h.symbol + '(' + h.qty + '@Rs.' + h.buyPrice + ')'; }).join(', ') : 'None yet';

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1000,
                tools: [{ type: 'web_search_20250305', name: 'web_search' }],
                messages: [{
                    role: 'user',
                    content: 'You are an Indian stock market advisor. User profile: Monthly investment budget: Rs.' + budget + ', Risk appetite: ' + risk + ', Investment horizon: ' + horizon + ', Current holdings: ' + holdingStr + ', Monthly income: Rs.' + (userData && userData.monthlyIncome ? userData.monthlyIncome : 'not set') + '. Please search for latest NSE/BSE news and top stocks. Suggest: 1) ONE specific stock to buy this month with NSE symbol, buy price range, target price, stop loss and reason. 2) Two key market news items. 3) Current market sentiment. 4) Any important updates on their existing holdings. Keep it India-focused, factual and concise. Use plain text, no markdown.'
                }]
            })
        });
        const data = await response.json();
        const recText = data.content.filter(function(b) { return b.type === 'text'; }).map(function(b) { return b.text; }).join('\n') || 'Could not get recommendation. Try again.';
        const recHtml = '<pre style="white-space:pre-wrap;font-family:inherit;font-size:14px;color:var(--text)">' + recText + '</pre>';

        const card = document.getElementById('smRecommendationCard');
        const content = document.getElementById('smRecommendationContent');
        if (card) card.style.display = '';
        if (content) content.innerHTML = recHtml;

        const savedPrefs = JSON.parse(localStorage.getItem('shareMarketPrefs') || '{}');
        savedPrefs.lastRec = recHtml;
        savedPrefs.recDate = new Date().toLocaleString('en-IN');
        localStorage.setItem('shareMarketPrefs', JSON.stringify(savedPrefs));

        const dateEl = card ? card.querySelector('.text-muted.fs-11') : null;
        if (dateEl) dateEl.textContent = 'Generated: ' + savedPrefs.recDate;

        showToast('Recommendation ready!', 'success');
    } catch (err) {
        showToast('Could not fetch recommendation. Check internet.', 'error');
        console.error(err);
    }

    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-robot"></i> Get AI Stock Recommendation'; }
}

// ---- DATA MANAGEMENT ----
async function loadDataStats() {
    const uid = getUID();
    const collections = ['income', 'bankEMIs', 'personalEMIs', 'installments', 'bills', 'rent', 'expenses'];
    const labels = { income: 'Income Sources', bankEMIs: 'Bank EMIs', personalEMIs: 'Personal/Friend Loans', installments: 'Society Installments', bills: 'Bills & Utilities', rent: 'Rent Records', expenses: 'Other Expenses' };
    let html = '';
    for (let i = 0; i < collections.length; i++) {
        const col = collections[i];
        try {
            const snap = await db.collection('users').doc(uid).collection(col).get();
            html += '<div class="flex-between mb-10"><span class="text-muted">' + (labels[col]||col) + '</span><span class="tag tag-info">' + snap.size + ' records</span></div>';
        } catch (err) {
            html += '<div class="flex-between mb-10"><span class="text-muted">' + (labels[col]||col) + '</span><span class="tag tag-danger">Error</span></div>';
        }
    }
    const el = document.getElementById('dataStats');
    if (el) el.innerHTML = html;
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
        window.userData.name = document.getElementById('adminName').value;
        window.userData.monthlyIncome = parseFloat(document.getElementById('adminIncome').value);
        document.getElementById('userName').textContent = document.getElementById('adminName').value;
        document.getElementById('userAvatar').textContent = document.getElementById('adminName').value[0].toUpperCase();
        showToast('Profile updated!', 'success');
    } catch (err) { showToast('Error updating profile', 'error'); }
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
    } catch (err) { showToast('Error saving', 'error'); }
    showSyncStatus(false);
}

async function exportData() {
    const uid = getUID();
    const exportObj = {};
    const collections = ['income', 'bankEMIs', 'personalEMIs', 'installments', 'bills', 'rent', 'expenses'];
    try {
        for (let i = 0; i < collections.length; i++) {
            const col = collections[i];
            const snap = await db.collection('users').doc(uid).collection(col).get();
            exportObj[col] = [];
            snap.forEach(function(doc) { exportObj[col].push(Object.assign({ id: doc.id }, doc.data())); });
        }
        const userDoc = await db.collection('users').doc(uid).get();
        exportObj.profile = userDoc.data();
        exportObj.localSettings = {
            formulas: JSON.parse(localStorage.getItem('adminFormulas') || '{}'),
            shareMarket: JSON.parse(localStorage.getItem('shareMarketPrefs') || '{}'),
            holdings: JSON.parse(localStorage.getItem('stockHoldings') || '[]')
        };
        const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'finance-data-' + new Date().toISOString().slice(0,10) + '.json';
        a.click();
        URL.revokeObjectURL(url);
        showToast('Data exported!', 'success');
    } catch (err) { showToast('Export failed', 'error'); }
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
        for (let i = 0; i < collections.length; i++) {
            const col = collections[i];
            if (data[col] && Array.isArray(data[col])) {
                for (let j = 0; j < data[col].length; j++) {
                    const item = data[col][j];
                    const id = item.id;
                    const itemData = Object.assign({}, item);
                    delete itemData.id;
                    await db.collection('users').doc(uid).collection(col).add(itemData);
                }
            }
        }
        if (data.localSettings) {
            if (data.localSettings.formulas) localStorage.setItem('adminFormulas', JSON.stringify(data.localSettings.formulas));
            if (data.localSettings.shareMarket) localStorage.setItem('shareMarketPrefs', JSON.stringify(data.localSettings.shareMarket));
            if (data.localSettings.holdings) localStorage.setItem('stockHoldings', JSON.stringify(data.localSettings.holdings));
        }
        showToast('Data imported!', 'success');
        showSyncStatus(false);
    } catch (err) { showToast('Import failed - Invalid file', 'error'); showSyncStatus(false); }
    event.target.value = '';
}

async function resetAllData() {
    if (!confirm('WARNING: This will DELETE ALL your financial data. Cannot be undone!')) return;
    if (!confirm('FINAL: All EMIs, bills, expenses, income will be permanently deleted. Continue?')) return;
    showSyncStatus(true);
    const uid = getUID();
    const collections = ['income', 'bankEMIs', 'personalEMIs', 'installments', 'bills', 'rent', 'expenses'];
    try {
        for (let i = 0; i < collections.length; i++) {
            const snap = await db.collection('users').doc(uid).collection(collections[i]).get();
            const batch = db.batch();
            snap.forEach(function(doc) { batch.delete(doc.ref); });
            await batch.commit();
        }
        showToast('All data reset!', 'info');
        navigateTo('dashboard');
    } catch (err) { showToast('Error resetting data', 'error'); }
    showSyncStatus(false);
}

async function resetMonthlyBills() {
    if (!confirm('Mark all bills as unpaid for the new month?')) return;
    showSyncStatus(true);
    try {
        const uid = getUID();
        const snap = await db.collection('users').doc(uid).collection('bills').get();
        const batch = db.batch();
        snap.forEach(function(doc) { batch.update(doc.ref, { paid: false }); });
        await batch.commit();
        showToast('All bills marked as unpaid', 'success');
    } catch (err) { showToast('Error', 'error'); }
    showSyncStatus(false);
}

function generateMonthlyReport() {
    showToast('Generating report...', 'info');
    setTimeout(function() { navigateTo('reports'); showToast('Report loaded!', 'success'); }, 500);
}
