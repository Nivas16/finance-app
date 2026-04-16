// ============================================
// LOAN CLOSURE PLANNER MODULE
// ============================================

async function renderLoanPlanner(container) {
    container.innerHTML = `
        <div class="section">
            <div class="section-header">
                <h2 class="section-title"><i class="fas fa-calculator"></i> Loan Closure Planner</h2>
            </div>
            <div class="section-body" id="loanPlannerContent">
                <div class="flex-center"><div class="spinner"></div></div>
            </div>
        </div>
    `;
    
    const data = await getAllFinancialData(getUID());
    const el = document.getElementById('loanPlannerContent');
    
    const allLoans = [
        ...data.bankEMIs.map(e => ({ ...e, type: 'ðŸ¦ Bank Loan', name: e.bankName })),
        ...data.personalEMIs.map(e => ({ ...e, type: 'ðŸ¤ Personal', name: e.personName, interestRate: 0 })),
        ...data.installmentList.map(e => ({ ...e, type: 'ðŸ¢ Installment' }))
    ];
    
    if (allLoans.length === 0) {
        el.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-trophy"></i>
                <h3>ðŸŽ‰ You're Debt Free!</h3>
                <p>No loans to plan for. Focus on investing and growing wealth!</p>
            </div>`;
        return;
    }
    
    // Sort by recommended closure order (highest interest first)
    allLoans.sort((a, b) => (b.interestRate || 0) - (a.interestRate || 0));
    
    const totalOutstanding = allLoans.reduce((s, l) => {
        const remaining = (l.totalEMIs || 0) - (l.paidEMIs || 0);
        return s + remaining * (l.emiAmount || 0);
    }, 0);
    
    const totalMonthlyEMI = allLoans.reduce((s, l) => s + (l.emiAmount || 0), 0);
    
    let html = `
        <div class="stats-grid mb-20">
            <div class="stat-card emi">
                <div class="stat-card-header">
                    <span class="stat-card-title">Total Loans</span>
                    <div class="stat-card-icon"><i class="fas fa-file-invoice-dollar"></i></div>
                </div>
                <div class="stat-card-value">${allLoans.length}</div>
            </div>
            <div class="stat-card expense">
                <div class="stat-card-header">
                    <span class="stat-card-title">Total Outstanding</span>
                    <div class="stat-card-icon"><i class="fas fa-money-bill-wave"></i></div>
                </div>
                <div class="stat-card-value">${formatCurrency(totalOutstanding)}</div>
            </div>
            <div class="stat-card balance">
                <div class="stat-card-header">
                    <span class="stat-card-title">Monthly EMI Load</span>
                    <div class="stat-card-icon"><i class="fas fa-calendar-check"></i></div>
                </div>
                <div class="stat-card-value">${formatCurrency(totalMonthlyEMI)}</div>
            </div>
        </div>
        
        <h3 class="mb-15"><i class="fas fa-fire" style="color:var(--danger)"></i> Recommended Closure Order (Highest Interest First)</h3>
        
        <div class="loan-timeline">`;
    
    let cumulativeDate = new Date();
    
    allLoans.forEach((loan, idx) => {
        const remaining = (loan.totalEMIs || 0) - (loan.paidEMIs || 0);
        const outstanding = remaining * (loan.emiAmount || 0);
        const closureDate = new Date(cumulativeDate);
        closureDate.setMonth(closureDate.getMonth() + remaining);
        
        const completed = remaining <= 0;
        
        html += `
            <div class="timeline-item ${completed ? 'completed' : ''}">
                <div class="timeline-date">
                    ${completed ? 'âœ… Completed!' : `Closes: ${closureDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`}
                </div>
                <div class="flex-between">
                    <div>
                        <div class="timeline-title">${loan.type} - ${loan.name || 'Loan'}</div>
                        <div class="fs-12 text-muted">
                            Interest: ${loan.interestRate || 0}% | EMI: ${formatCurrency(loan.emiAmount)} | 
                            ${remaining} months left
                        </div>
                    </div>
                    <div class="timeline-amount">${formatCurrency(outstanding)}</div>
                </div>
                <div class="emi-progress mt-10">
                    <div class="progress-bar">
                        <div class="progress-fill ${completed ? 'green' : 'orange'}" 
                             style="width:${Math.round(((loan.paidEMIs || 0) / (loan.totalEMIs || 1)) * 100)}%"></div>
                    </div>
                    <div class="progress-info">
                        <span>${loan.paidEMIs || 0} of ${loan.totalEMIs || 0} paid</span>
                        <span>Priority #${idx + 1}</span>
                    </div>
                </div>
                ${!completed && data.balance > 0 ? `
                    <div class="mt-10 fs-12" style="padding:8px;background:rgba(46,203,113,0.1);border-radius:6px;color:var(--secondary)">
                        ðŸ’¡ If you pay extra ${formatCurrency(data.balance * 0.3)}/mo, this closes ${Math.ceil(remaining * 0.3)} months earlier!
                    </div>
                ` : ''}
            </div>`;
    });
    
    html += `</div>`;
    
    // Calculate total debt-free date
    const maxRemaining = Math.max(...allLoans.map(l => (l.totalEMIs || 0) - (l.paidEMIs || 0)));
    const debtFreeDate = new Date();
    debtFreeDate.setMonth(debtFreeDate.getMonth() + maxRemaining);
    
    html += `
        <div class="section mt-20" style="background:var(--surface-2);border:2px solid var(--primary)">
            <div class="section-body text-center">
                <i class="fas fa-flag-checkered" style="font-size:40px;color:var(--primary);margin-bottom:10px"></i>
                <h2>ðŸŽ¯ Debt-Free Target</h2>
                <div class="fs-24 fw-800 mt-10" style="color:var(--secondary)">
                    ${debtFreeDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </div>
                <p class="text-muted mt-10">${maxRemaining} months from now</p>
                ${data.balance > 0 ? `
                    <p class="mt-10 text-success">With extra payments of ${formatCurrency(data.balance * 0.5)}/mo, 
                    you could be free by ${new Date(Date.now() + maxRemaining * 0.6 * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}!</p>
                ` : ''}
            </div>
        </div>`;
    
    el.innerHTML = html;
}
