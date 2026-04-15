// ============================================
// EMI MANAGEMENT MODULE
// ============================================

// ============ BANK EMI ============
function renderBankEMI(container) {
    container.innerHTML = `
        <div class="section">
            <div class="section-header">
                <h2 class="section-title"><i class="fas fa-university"></i> Bank EMIs</h2>
                <button class="btn btn-primary btn-sm" onclick="openAddBankEMIModal()">
                    <i class="fas fa-plus"></i> Add Bank EMI
                </button>
            </div>
            <div class="section-body" id="bankEMIList">
                <div class="flex-center"><div class="spinner"></div></div>
            </div>
        </div>
    `;
    loadBankEMIs();
}

async function loadBankEMIs() {
    const uid = getUID();
    try {
        const snapshot = await db.collection('users').doc(uid)
            .collection('bankEMIs').orderBy('createdAt', 'desc').get();
        
        const emis = [];
        snapshot.forEach(doc => emis.push({ id: doc.id, ...doc.data() }));
        
        const el = document.getElementById('bankEMIList');
        
        if (emis.length === 0) {
            el.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-university"></i>
                    <h3>No Bank EMIs</h3>
                    <p>Add your home loan, car loan, personal loan EMIs</p>
                    <button class="btn btn-primary" onclick="openAddBankEMIModal()">
                        <i class="fas fa-plus"></i> Add Bank EMI
                    </button>
                </div>`;
            return;
        }
        
        let html = '<div class="emi-grid">';
        let totalMonthly = 0;
        let totalOutstanding = 0;
        
        emis.forEach(emi => {
            const paidEMIs = emi.paidEMIs || 0;
            const totalEMIs = emi.totalEMIs || 1;
            const progress = Math.min(100, Math.round((paidEMIs / totalEMIs) * 100));
          //  const remaining = totalEMIs - paidEMIs;
          //  const outstanding = remaining * (emi.emiAmount || 0);

const P = emi.loanAmount || 0;
const annualRate = emi.interestRate || 0;
const r = (annualRate / 12) / 100;
const n = totalEMIs;
const p = paidEMIs;

let outstanding = 0;

if (r > 0) {
    outstanding = P * (Math.pow(1 + r, n) - Math.pow(1 + r, p)) /
                  (Math.pow(1 + r, n) - 1);
} else {
    // fallback if 0% interest
    outstanding = (n - p) * (emi.emiAmount || 0);
}

const remaining = n - p;

            
            totalMonthly += emi.emiAmount || 0;
            totalOutstanding += outstanding;
            
            let progressClass = 'blue';
            if (progress > 75) progressClass = 'green';
            else if (progress > 40) progressClass = 'orange';
            else progressClass = 'red';
            
            html += `
                <div class="emi-card">
                    <div class="emi-card-top">
                        <div>
                            <div class="emi-name">${emi.bankName}</div>
                            <div class="emi-type">${emi.loanType || 'Personal Loan'}</div>
                        </div>
                        <div class="emi-amount">${formatCurrency(emi.emiAmount)}/mo</div>
                    </div>
                    <div class="emi-progress">
                        <div class="progress-bar">
                            <div class="progress-fill ${progressClass}" style="width:${progress}%"></div>
                        </div>
                        <div class="progress-info">
                            <span>${paidEMIs} of ${totalEMIs} EMIs paid</span>
                            <span>${progress}%</span>
                        </div>
                    </div>
                    <div class="emi-details">
                        <div class="emi-detail">
                            <span class="emi-detail-label">Loan Amount</span>
                            <span class="emi-detail-value">${formatCurrency(emi.loanAmount)}</span>
                        </div>
                        <div class="emi-detail">
                            <span class="emi-detail-label">Interest Rate</span>
                            <span class="emi-detail-value">${emi.interestRate || 0}%</span>
                        </div>
                        <div class="emi-detail">
                            <span class="emi-detail-label">Remaining EMIs</span>
                            <span class="emi-detail-value">${remaining} months</span>
                        </div>
                        <div class="emi-detail">
                            <span class="emi-detail-label">Outstanding</span>
                            <span class="emi-detail-value text-danger">${formatCurrency(outstanding)}</span>
                        </div>
                        <div class="emi-detail">
                            <span class="emi-detail-label">Start Date</span>
                            <span class="emi-detail-value">${emi.startDate || '-'}</span>
                        </div>
                        <div class="emi-detail">
                            <span class="emi-detail-label">End Date</span>
                            <span class="emi-detail-value">${emi.endDate || '-'}</span>
                        </div>
                    </div>
                    <div class="emi-actions">
                        <button class="btn btn-sm btn-success" onclick="payEMI('bankEMIs','${emi.id}',${paidEMIs},${totalEMIs})">
                            <i class="fas fa-check"></i> Pay EMI
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="editBankEMI('${emi.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteEMI('bankEMIs','${emi.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>`;
        });
        html += '</div>';
        
        html += `
            <div class="flex-between mt-20" style="padding:15px;background:var(--dark);border-radius:var(--radius-sm)">
                <div>
                    <div class="fs-12 text-muted">Monthly EMI Total</div>
                    <div class="fw-800 text-warning fs-18">${formatCurrency(totalMonthly)}</div>
                </div>
                <div class="text-right">
                    <div class="fs-12 text-muted">Total Outstanding</div>
                    <div class="fw-800 text-danger fs-18">${formatCurrency(totalOutstanding)}</div>
                </div>
            </div>`;
        
        el.innerHTML = html;
    } catch (err) {
        console.error(err);
    }
}

function openAddBankEMIModal() {
    openModal(`
        <div class="modal-header">
            <h2>Add Bank EMI</h2>
            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
        </div>
        <form onsubmit="saveBankEMI(event)">
            <div class="form-group">
                <label>Bank Name</label>
                <input type="text" id="emiBank" placeholder="e.g., SBI, HDFC, ICICI" required>
            </div>
            <div class="form-group">
                <label>Loan Type</label>
                <select id="emiLoanType">
                    <option value="Personal Loan">Personal Loan</option>
                    <option value="Home Loan">Home Loan</option>
                    <option value="Car Loan">Car Loan</option>
                    <option value="Education Loan">Education Loan</option>
                    <option value="Gold Loan">Gold Loan</option>
                    <option value="Credit Card">Credit Card EMI</option>
                    <option value="Business Loan">Business Loan</option>
                    <option value="Two Wheeler">Two Wheeler Loan</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Loan Amount (₹)</label>
                    <input type="number" id="emiLoanAmt" placeholder="500000" required>
                </div>
                <div class="form-group">
                    <label>Interest Rate (%)</label>
                    <input type="number" id="emiRate" placeholder="12" step="0.1" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>EMI Amount (₹)</label>
                    <input type="number" id="emiAmount" placeholder="15000" required>
                </div>
                <div class="form-group">
                    <label>Total EMIs (months)</label>
                    <input type="number" id="emiTotal" placeholder="36" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>EMIs Already Paid</label>
                    <input type="number" id="emiPaid" placeholder="0" value="0">
                </div>
                <div class="form-group">
                    <label>Start Date</label>
                    <input type="month" id="emiStart">
                </div>
            </div>
            <button type="submit" class="btn btn-success btn-full mt-15">
                <i class="fas fa-save"></i> Save EMI
            </button>
        </form>
    `);
}

async function saveBankEMI(e) {
    e.preventDefault();
    showSyncStatus(true);
    
    const totalEMIs = parseInt(document.getElementById('emiTotal').value);
    const startDate = document.getElementById('emiStart').value;
    let endDate = '';
    
    if (startDate) {
        const sd = new Date(startDate + '-01');
        sd.setMonth(sd.getMonth() + totalEMIs);
        endDate = sd.toISOString().slice(0, 7);
    }
    
    try {
        await db.collection('users').doc(getUID()).collection('bankEMIs').add({
            bankName: document.getElementById('emiBank').value,
            loanType: document.getElementById('emiLoanType').value,
            loanAmount: parseFloat(document.getElementById('emiLoanAmt').value),
            interestRate: parseFloat(document.getElementById('emiRate').value),
            emiAmount: parseFloat(document.getElementById('emiAmount').value),
            totalEMIs: totalEMIs,
            paidEMIs: parseInt(document.getElementById('emiPaid').value) || 0,
            startDate: startDate,
            endDate: endDate,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        closeModal();
        showToast('Bank EMI added!', 'success');
        loadBankEMIs();
    } catch (err) {
        showToast('Error saving', 'error');
    }
    showSyncStatus(false);
}

async function payEMI(collection, id, currentPaid, totalEMIs) {
    if (currentPaid >= totalEMIs) {
        showToast('All EMIs already paid! 🎉', 'success');
        return;
    }
    showSyncStatus(true);
    try {
        await db.collection('users').doc(getUID()).collection(collection).doc(id).update({
            paidEMIs: currentPaid + 1
        });
        showToast('EMI payment recorded!', 'success');
        
        if (currentPaid + 1 >= totalEMIs) {
            showToast('🎉 Congratulations! Loan fully paid!', 'success');
        }
        
        // Refresh current page
        if (collection === 'bankEMIs') loadBankEMIs();
        else if (collection === 'personalEMIs') loadPersonalEMIs();
        else if (collection === 'installments') loadInstallments();
    } catch (err) {
        showToast('Error', 'error');
    }
    showSyncStatus(false);
}

async function deleteEMI(collection, id) {
    if (!confirm('Delete this EMI?')) return;
    showSyncStatus(true);
    try {
        await db.collection('users').doc(getUID()).collection(collection).doc(id).delete();
        showToast('EMI deleted', 'info');
        
        if (collection === 'bankEMIs') loadBankEMIs();
        else if (collection === 'personalEMIs') loadPersonalEMIs();
        else if (collection === 'installments') loadInstallments();
    } catch (err) {
        showToast('Error', 'error');
    }
    showSyncStatus(false);
}

// ============ PERSONAL EMI ============
function renderPersonalEMI(container) {
    container.innerHTML = `
        <div class="section">
            <div class="section-header">
                <h2 class="section-title"><i class="fas fa-handshake"></i> Personal EMIs / Borrowed Money</h2>
                <button class="btn btn-primary btn-sm" onclick="openAddPersonalEMIModal()">
                    <i class="fas fa-plus"></i> Add Personal EMI
                </button>
            </div>
            <div class="section-body" id="personalEMIList">
                <div class="flex-center"><div class="spinner"></div></div>
            </div>
        </div>
    `;
    loadPersonalEMIs();
}

async function loadPersonalEMIs() {
    const uid = getUID();
    try {
        const snapshot = await db.collection('users').doc(uid)
            .collection('personalEMIs').orderBy('createdAt', 'desc').get();
        
        const emis = [];
        snapshot.forEach(doc => emis.push({ id: doc.id, ...doc.data() }));
        
        const el = document.getElementById('personalEMIList');
        
        if (emis.length === 0) {
            el.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-handshake"></i>
                    <h3>No Personal EMIs</h3>
                    <p>Track money borrowed from friends or family</p>
                    <button class="btn btn-primary" onclick="openAddPersonalEMIModal()">
                        <i class="fas fa-plus"></i> Add Personal EMI
                    </button>
                </div>`;
            return;
        }
        
        let html = '<div class="emi-grid">';
        emis.forEach(emi => {
            const paidEMIs = emi.paidEMIs || 0;
            const totalEMIs = emi.totalEMIs || 1;
            const progress = Math.min(100, Math.round((paidEMIs / totalEMIs) * 100));
            
            html += `
                <div class="emi-card">
                    <div class="emi-card-top">
                        <div>
                            <div class="emi-name">${emi.personName}</div>
                            <div class="emi-type">${emi.reason || 'Personal Loan'}</div>
                        </div>
                        <div class="emi-amount">${formatCurrency(emi.emiAmount)}/mo</div>
                    </div>
                    <div class="emi-progress">
                        <div class="progress-bar">
                            <div class="progress-fill ${progress > 75 ? 'green' : progress > 40 ? 'orange' : 'red'}" 
                                 style="width:${progress}%"></div>
                        </div>
                        <div class="progress-info">
                            <span>${paidEMIs} of ${totalEMIs} paid</span>
                            <span>${progress}%</span>
                        </div>
                    </div>
                    <div class="emi-details">
                        <div class="emi-detail">
                            <span class="emi-detail-label">Total Borrowed</span>
                            <span class="emi-detail-value">${formatCurrency(emi.totalAmount)}</span>
                        </div>
                        <div class="emi-detail">
                            <span class="emi-detail-label">Remaining</span>
                            <span class="emi-detail-value text-danger">${formatCurrency((totalEMIs - paidEMIs) * emi.emiAmount)}</span>
                        </div>
                        <div class="emi-detail">
                            <span class="emi-detail-label">Phone</span>
                            <span class="emi-detail-value">${emi.phone || '-'}</span>
                        </div>
                        <div class="emi-detail">
                            <span class="emi-detail-label">Due Date</span>
                            <span class="emi-detail-value">${emi.dueDate || 'Monthly'}</span>
                        </div>
                    </div>
                    <div class="emi-actions">
                        <button class="btn btn-sm btn-success" onclick="payEMI('personalEMIs','${emi.id}',${paidEMIs},${totalEMIs})">
                            <i class="fas fa-check"></i> Pay
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteEMI('personalEMIs','${emi.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>`;
        });
        html += '</div>';
        el.innerHTML = html;
    } catch (err) { console.error(err); }
}

function openAddPersonalEMIModal() {
    openModal(`
        <div class="modal-header">
            <h2>Add Personal EMI</h2>
            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
        </div>
        <form onsubmit="savePersonalEMI(event)">
            <div class="form-group">
                <label>Person Name (Lender)</label>
                <input type="text" id="persName" placeholder="e.g., Rahul, Uncle" required>
            </div>
            <div class="form-group">
                <label>Reason</label>
                <input type="text" id="persReason" placeholder="e.g., Emergency, Medical">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Total Amount (₹)</label>
                    <input type="number" id="persTotal" placeholder="50000" required>
                </div>
                <div class="form-group">
                    <label>Monthly EMI (₹)</label>
                    <input type="number" id="persEMI" placeholder="5000" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Total Installments</label>
                    <input type="number" id="persTotalEMIs" placeholder="10" required>
                </div>
                <div class="form-group">
                    <label>Already Paid</label>
                    <input type="number" id="persPaid" placeholder="0" value="0">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Phone Number</label>
                    <input type="text" id="persPhone" placeholder="Optional">
                </div>
                <div class="form-group">
                    <label>Due Date</label>
                    <input type="text" id="persDue" value="Monthly">
                </div>
            </div>
            <button type="submit" class="btn btn-success btn-full mt-15">
                <i class="fas fa-save"></i> Save
            </button>
        </form>
    `);
}

async function savePersonalEMI(e) {
    e.preventDefault();
    showSyncStatus(true);
    try {
        await db.collection('users').doc(getUID()).collection('personalEMIs').add({
            personName: document.getElementById('persName').value,
            reason: document.getElementById('persReason').value,
            totalAmount: parseFloat(document.getElementById('persTotal').value),
            emiAmount: parseFloat(document.getElementById('persEMI').value),
            totalEMIs: parseInt(document.getElementById('persTotalEMIs').value),
            paidEMIs: parseInt(document.getElementById('persPaid').value) || 0,
            phone: document.getElementById('persPhone').value,
            dueDate: document.getElementById('persDue').value,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        closeModal();
        showToast('Personal EMI added!', 'success');
        loadPersonalEMIs();
    } catch (err) {
        showToast('Error', 'error');
    }
    showSyncStatus(false);
}

// ============ INSTALLMENTS (Society Loan) ============
function renderInstallments(container) {
    container.innerHTML = `
        <div class="section">
            <div class="section-header">
                <h2 class="section-title"><i class="fas fa-building"></i> Society Loans & Installments</h2>
                <button class="btn btn-primary btn-sm" onclick="openAddInstallmentModal()">
                    <i class="fas fa-plus"></i> Add Installment
                </button>
            </div>
            <div class="section-body" id="installmentList">
                <div class="flex-center"><div class="spinner"></div></div>
            </div>
        </div>
    `;
    loadInstallments();
}

async function loadInstallments() {
    const uid = getUID();
    try {
        const snapshot = await db.collection('users').doc(uid)
            .collection('installments').orderBy('createdAt', 'desc').get();
        
        const items = [];
        snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
        
        const el = document.getElementById('installmentList');
        
        if (items.length === 0) {
            el.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-building"></i>
                    <h3>No Installments</h3>
                    <p>Track society loans, chit funds, or any installment payments</p>
                    <button class="btn btn-primary" onclick="openAddInstallmentModal()">
                        <i class="fas fa-plus"></i> Add Installment
                    </button>
                </div>`;
            return;
        }
        
        let html = '<div class="emi-grid">';
        items.forEach(item => {
            const paidEMIs = item.paidEMIs || 0;
            const totalEMIs = item.totalEMIs || 1;
            const progress = Math.min(100, Math.round((paidEMIs / totalEMIs) * 100));
            
            html += `
                <div class="emi-card">
                    <div class="emi-card-top">
                        <div>
                            <div class="emi-name">${item.name}</div>
                            <div class="emi-type">${item.type || 'Society Loan'}</div>
                        </div>
                        <div class="emi-amount">${formatCurrency(item.emiAmount)}/mo</div>
                    </div>
                    <div class="emi-progress">
                        <div class="progress-bar">
                            <div class="progress-fill ${progress > 75 ? 'green' : 'orange'}" style="width:${progress}%"></div>
                        </div>
                        <div class="progress-info">
                            <span>${paidEMIs} of ${totalEMIs} paid</span>
                            <span>${progress}%</span>
                        </div>
                    </div>
                    <div class="emi-details">
                        <div class="emi-detail">
                            <span class="emi-detail-label">Total Amount</span>
                            <span class="emi-detail-value">${formatCurrency(item.totalAmount)}</span>
                        </div>
                        <div class="emi-detail">
                            <span class="emi-detail-label">Remaining</span>
                            <span class="emi-detail-value text-danger">${formatCurrency((totalEMIs - paidEMIs) * item.emiAmount)}</span>
                        </div>
                    </div>
                    <div class="emi-actions">
                        <button class="btn btn-sm btn-success" onclick="payEMI('installments','${item.id}',${paidEMIs},${totalEMIs})">
                            <i class="fas fa-check"></i> Pay
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteEMI('installments','${item.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>`;
        });
        html += '</div>';
        el.innerHTML = html;
    } catch (err) { console.error(err); }
}

function openAddInstallmentModal() {
    openModal(`
        <div class="modal-header">
            <h2>Add Installment</h2>
            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
        </div>
        <form onsubmit="saveInstallment(event)">
            <div class="form-group">
                <label>Name</label>
                <input type="text" id="instName" placeholder="e.g., Society Loan, Chit Fund" required>
            </div>
            <div class="form-group">
                <label>Type</label>
                <select id="instType">
                    <option value="Society Loan">Society Loan</option>
                    <option value="Chit Fund">Chit Fund</option>
                    <option value="Recurring Deposit">Recurring Deposit</option>
                    <option value="Equipment EMI">Equipment EMI</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Total Amount (₹)</label>
                    <input type="number" id="instTotal" placeholder="100000" required>
                </div>
                <div class="form-group">
                    <label>Monthly Installment (₹)</label>
                    <input type="number" id="instEMI" placeholder="5000" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Total Installments</label>
                    <input type="number" id="instTotalEMIs" placeholder="20" required>
                </div>
                <div class="form-group">
                    <label>Already Paid</label>
                    <input type="number" id="instPaid" value="0">
                </div>
            </div>
            <button type="submit" class="btn btn-success btn-full mt-15">
                <i class="fas fa-save"></i> Save
            </button>
        </form>
    `);
}

async function saveInstallment(e) {
    e.preventDefault();
    showSyncStatus(true);
    try {
        await db.collection('users').doc(getUID()).collection('installments').add({
            name: document.getElementById('instName').value,
            type: document.getElementById('instType').value,
            totalAmount: parseFloat(document.getElementById('instTotal').value),
            emiAmount: parseFloat(document.getElementById('instEMI').value),
            totalEMIs: parseInt(document.getElementById('instTotalEMIs').value),
            paidEMIs: parseInt(document.getElementById('instPaid').value) || 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        closeModal();
        showToast('Installment added!', 'success');
        loadInstallments();
    } catch (err) {
        showToast('Error', 'error');
    }
    showSyncStatus(false);
}
