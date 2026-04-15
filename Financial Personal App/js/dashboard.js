// ============================================
// DASHBOARD MODULE
// ============================================

async function getAllFinancialData(uid) {
    const data = {
        totalIncome: 0,
        bankEMI: 0,
        personalEMI: 0,
        installments: 0,
        bills: 0,
        rent: 0,
        otherExpenses: 0,
        totalExpenses: 0,
        balance: 0,
        bankEMIs: [],
        personalEMIs: [],
        installmentList: [],
        billList: [],
        rentList: [],
        expenseList: [],
        incomeList: []
    };
    
    try {
        // Income
        const incSnap = await db.collection('users').doc(uid).collection('income').get();
        incSnap.forEach(doc => {
            const d = doc.data();
            data.totalIncome += d.amount || 0;
            data.incomeList.push({ id: doc.id, ...d });
        });

        // Bank EMIs
        const bankSnap = await db.collection('users').doc(uid).collection('bankEMIs').get();
        bankSnap.forEach(doc => {
            const d = doc.data();
            data.bankEMI += d.emiAmount || 0;
            data.bankEMIs.push({ id: doc.id, ...d });
        });

        // Personal EMIs
        const persSnap = await db.collection('users').doc(uid).collection('personalEMIs').get();
        persSnap.forEach(doc => {
            const d = doc.data();
            data.personalEMI += d.emiAmount || 0;
            data.personalEMIs.push({ id: doc.id, ...d });
        });

        // Installments
        const instSnap = await db.collection('users').doc(uid).collection('installments').get();
        instSnap.forEach(doc => {
            const d = doc.data();
            data.installments += d.emiAmount || 0;
            data.installmentList.push({ id: doc.id, ...d });
        });

        // Bills
        const billSnap = await db.collection('users').doc(uid).collection('bills').get();
        billSnap.forEach(doc => {
            const d = doc.data();
            data.bills += d.amount || 0;
            data.billList.push({ id: doc.id, ...d });
        });

        // Rent
        const rentSnap = await db.collection('users').doc(uid).collection('rent').get();
        rentSnap.forEach(doc => {
            const d = doc.data();
            data.rent += d.amount || 0;
            data.rentList.push({ id: doc.id, ...d });
        });

        // Other Expenses
        const expSnap = await db.collection('users').doc(uid).collection('expenses').get();
        expSnap.forEach(doc => {
            const d = doc.data();
            data.otherExpenses += d.amount || 0;
            data.expenseList.push({ id: doc.id, ...d });
        });

        data.totalExpenses = data.bankEMI + data.personalEMI + data.installments + data.bills + data.rent + data.otherExpenses;
        data.balance = data.totalIncome - data.totalExpenses;
        
    } catch (err) {
        console.error('Error fetching data:', err);
    }
    
    return data;
}

async function renderDashboard(container) {
    container.innerHTML = `
        <div class="stats-grid" id="dashStats">
            <div class="stat-card income skeleton-load">
                <div class="stat-card-header">
                    <span class="stat-card-title">Total Income</span>
                    <div class="stat-card-icon"><i class="fas fa-arrow-down"></i></div>
                </div>
                <div class="stat-card-value" id="dashIncome">Loading...</div>
                <div class="stat-card-change positive"><i class="fas fa-arrow-up"></i> Monthly</div>
            </div>
            <div class="stat-card emi">
                <div class="stat-card-header">
                    <span class="stat-card-title">Total EMIs</span>
                    <div class="stat-card-icon"><i class="fas fa-university"></i></div>
                </div>
                <div class="stat-card-value" id="dashEMI">Loading...</div>
                <div class="stat-card-change negative"><i class="fas fa-arrow-down"></i> Obligations</div>
            </div>
            <div class="stat-card expense">
                <div class="stat-card-header">
                    <span class="stat-card-title">Total Expenses</span>
                    <div class="stat-card-icon"><i class="fas fa-shopping-cart"></i></div>
                </div>
                <div class="stat-card-value" id="dashExpenses">Loading...</div>
                <div class="stat-card-change negative"><i class="fas fa-arrow-down"></i> All outflow</div>
            </div>
            <div class="stat-card balance">
                <div class="stat-card-header">
                    <span class="stat-card-title">Balance Left</span>
                    <div class="stat-card-icon"><i class="fas fa-piggy-bank"></i></div>
                </div>
                <div class="stat-card-value" id="dashBalance">Loading...</div>
                <div class="stat-card-change" id="dashBalanceChange">After all deductions</div>
            </div>
        </div>
        
        <div class="charts-grid">
            <div class="chart-container">
                <div class="chart-title"><i class="fas fa-chart-pie"></i> Expense Distribution</div>
                <div class="chart-wrapper"><canvas id="dashPieChart"></canvas></div>
            </div>
            <div class="chart-container">
                <div class="chart-title"><i class="fas fa-chart-bar"></i> Income vs Expenses</div>
                <div class="chart-wrapper"><canvas id="dashBarChart"></canvas></div>
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <h2 class="section-title"><i class="fas fa-list"></i> Financial Summary</h2>
            </div>
            <div class="section-body" id="dashSummary">
                <div class="flex-center"><div class="spinner"></div></div>
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <h2 class="section-title"><i class="fas fa-lightbulb"></i> Quick AI Insights</h2>
            </div>
            <div class="section-body" id="dashInsights">
                <div class="flex-center"><div class="spinner"></div></div>
            </div>
        </div>
    `;
    
    // Load data
    const uid = getUID();
    if (!uid) return;
    
    const data = await getAllFinancialData(uid);
    
    // Update stats
    document.getElementById('dashIncome').textContent = formatCurrency(data.totalIncome);
    document.getElementById('dashEMI').textContent = formatCurrency(data.bankEMI + data.personalEMI + data.installments);
    document.getElementById('dashExpenses').textContent = formatCurrency(data.totalExpenses);
    document.getElementById('dashBalance').textContent = formatCurrency(data.balance);
    
    const balChange = document.getElementById('dashBalanceChange');
    if (data.balance >= 0) {
        balChange.className = 'stat-card-change positive';
        balChange.innerHTML = `<i class="fas fa-arrow-up"></i> ${Math.round((data.balance / data.totalIncome) * 100) || 0}% saved`;
    } else {
        balChange.className = 'stat-card-change negative';
        balChange.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Over budget!`;
    }
    
    // Pie Chart
    const pieCtx = document.getElementById('dashPieChart')?.getContext('2d');
    if (pieCtx) {
        new Chart(pieCtx, {
            type: 'doughnut',
            data: {
                labels: ['Bank EMIs', 'Personal Loans', 'Society/Installments', 'Bills & Utilities', 'Room Rent', 'Other Expenses', 'Savings'],
                datasets: [{
                    data: [
                        data.bankEMI, data.personalEMI, data.installments,
                        data.bills, data.rent, data.otherExpenses,
                        Math.max(0, data.balance)
                    ],
                    backgroundColor: [
                        '#6C63FF', '#3498DB', '#F39C12', '#E74C3C',
                        '#2ECB71', '#9B59B6', '#1ABC9C'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#A0A0CC', padding: 12, font: { size: 11 }, usePointStyle: true }
                    }
                }
            }
        });
    }
    
    // Bar Chart
    const barCtx = document.getElementById('dashBarChart')?.getContext('2d');
    if (barCtx) {
        new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: ['Income', 'Expenses', 'Savings'],
                datasets: [{
                    data: [data.totalIncome, data.totalExpenses, Math.max(0, data.balance)],
                    backgroundColor: ['#2ECB71', '#E74C3C', '#6C63FF'],
                    borderWidth: 0,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { ticks: { color: '#6C6C99', callback: v => '₹' + (v/1000) + 'k' }, grid: { color: '#2A2A5A' } },
                    x: { ticks: { color: '#A0A0CC' }, grid: { display: false } }
                }
            }
        });
    }
    
    // Summary Table
    const summaryEl = document.getElementById('dashSummary');
    summaryEl.innerHTML = `
        <div class="table-responsive">
            <table class="data-table">
                <thead><tr><th>Category</th><th>Amount</th><th>% of Income</th><th>Status</th></tr></thead>
                <tbody>
                    <tr>
                        <td><i class="fas fa-university" style="color:#6C63FF"></i> Bank EMIs</td>
                        <td class="fw-700">${formatCurrency(data.bankEMI)}</td>
                        <td>${data.totalIncome ? Math.round((data.bankEMI/data.totalIncome)*100) : 0}%</td>
                        <td><span class="tag tag-warning">${data.bankEMIs.length} active</span></td>
                    </tr>
                    <tr>
                        <td><i class="fas fa-handshake" style="color:#3498DB"></i> Personal EMIs</td>
                        <td class="fw-700">${formatCurrency(data.personalEMI)}</td>
                        <td>${data.totalIncome ? Math.round((data.personalEMI/data.totalIncome)*100) : 0}%</td>
                        <td><span class="tag tag-info">${data.personalEMIs.length} active</span></td>
                    </tr>
                    <tr>
                        <td><i class="fas fa-building" style="color:#F39C12"></i> Society/Installments</td>
                        <td class="fw-700">${formatCurrency(data.installments)}</td>
                        <td>${data.totalIncome ? Math.round((data.installments/data.totalIncome)*100) : 0}%</td>
                        <td><span class="tag tag-warning">${data.installmentList.length} active</span></td>
                    </tr>
                    <tr>
                        <td><i class="fas fa-bolt" style="color:#E74C3C"></i> Bills & Utilities</td>
                        <td class="fw-700">${formatCurrency(data.bills)}</td>
                        <td>${data.totalIncome ? Math.round((data.bills/data.totalIncome)*100) : 0}%</td>
                        <td><span class="tag tag-danger">${data.billList.length} bills</span></td>
                    </tr>
                    <tr>
                        <td><i class="fas fa-home" style="color:#2ECB71"></i> Room Rent</td>
                        <td class="fw-700">${formatCurrency(data.rent)}</td>
                        <td>${data.totalIncome ? Math.round((data.rent/data.totalIncome)*100) : 0}%</td>
                        <td><span class="tag tag-success">Monthly</span></td>
                    </tr>
                    <tr>
                        <td><i class="fas fa-shopping-cart" style="color:#9B59B6"></i> Other Expenses</td>
                        <td class="fw-700">${formatCurrency(data.otherExpenses)}</td>
                        <td>${data.totalIncome ? Math.round((data.otherExpenses/data.totalIncome)*100) : 0}%</td>
                        <td><span class="tag tag-primary">${data.expenseList.length} items</span></td>
                    </tr>
                    <tr style="background:rgba(108,99,255,0.1)">
                        <td class="fw-700"><i class="fas fa-piggy-bank" style="color:#6C63FF"></i> Remaining Balance</td>
                        <td class="fw-800 ${data.balance >= 0 ? 'text-success' : 'text-danger'}" style="font-size:16px">
                            ${formatCurrency(data.balance)}
                        </td>
                        <td class="fw-700">${data.totalIncome ? Math.round((Math.max(0,data.balance)/data.totalIncome)*100) : 0}%</td>
                        <td><span class="tag ${data.balance >= 0 ? 'tag-success' : 'tag-danger'}">
                            ${data.balance >= 0 ? 'Healthy' : 'Over Budget!'}
                        </span></td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
    
    // AI Insights
    const insightsEl = document.getElementById('dashInsights');
    const insights = generateQuickInsights(data);
    insightsEl.innerHTML = insights.map(ins => `
        <div class="factor-item" style="margin-bottom:8px">
            <i class="fas fa-${ins.icon} ${ins.type}"></i>
            <span>${ins.text}</span>
        </div>
    `).join('');
}

function generateQuickInsights(data) {
    const insights = [];
    const savingsRate = data.totalIncome > 0 ? (data.balance / data.totalIncome) * 100 : 0;
    const emiRatio = data.totalIncome > 0 ? ((data.bankEMI + data.personalEMI + data.installments) / data.totalIncome) * 100 : 0;
    
    if (savingsRate >= 30) {
        insights.push({ icon: 'star', type: 'positive', text: `Great! You're saving ${Math.round(savingsRate)}% of income. Consider investing in mutual funds or FDs.` });
    } else if (savingsRate >= 15) {
        insights.push({ icon: 'check-circle', type: 'positive', text: `Good savings rate of ${Math.round(savingsRate)}%. Try to push it to 30% for financial freedom.` });
    } else if (savingsRate >= 0) {
        insights.push({ icon: 'exclamation-triangle', type: 'neutral', text: `Low savings rate of ${Math.round(savingsRate)}%. Review your expenses and cut non-essentials.` });
    } else {
        insights.push({ icon: 'times-circle', type: 'negative', text: `Warning: You're spending more than you earn! Immediate action needed to cut expenses.` });
    }
    
    if (emiRatio > 50) {
        insights.push({ icon: 'exclamation-circle', type: 'negative', text: `EMIs take ${Math.round(emiRatio)}% of income. This is risky! Focus on closing high-interest loans first.` });
    } else if (emiRatio > 30) {
        insights.push({ icon: 'info-circle', type: 'neutral', text: `EMIs are ${Math.round(emiRatio)}% of income. Try to keep it under 30% for healthy finances.` });
    }
    
    if (data.bankEMIs.length > 3) {
        insights.push({ icon: 'lightbulb', type: 'neutral', text: `You have ${data.bankEMIs.length} bank loans. Consider consolidating them for a lower interest rate.` });
    }
    
    if (data.rent > 0 && data.totalIncome > 0 && (data.rent / data.totalIncome) > 0.3) {
        insights.push({ icon: 'home', type: 'negative', text: `Rent is ${Math.round((data.rent/data.totalIncome)*100)}% of income. Ideally keep it under 30%. Consider sharing or relocating.` });
    }
    
    if (data.balance > 10000) {
        insights.push({ icon: 'piggy-bank', type: 'positive', text: `You have ${formatCurrency(data.balance)} surplus. Put at least 50% into SIP or high-yield savings account.` });
    }
    
    if (insights.length === 0) {
        insights.push({ icon: 'info-circle', type: 'neutral', text: 'Add your income and expenses to get personalized AI insights!' });
    }
    
    return insights;
}