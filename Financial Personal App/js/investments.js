
// ============================================
// SIP & INVESTMENTS MODULE
// ============================================

// ============ SIP TRACKING ============
function renderSIP(container) {
    container.innerHTML = `
        <div class="section">
            <div class="section-header">
                <h2 class="section-title"><i class="fas fa-chart-line"></i> SIP Investments</h2>
                <button class="btn btn-primary btn-sm" onclick="openAddSIPModal()">
                    <i class="fas fa-plus"></i> Add SIP
                </button>
            </div>
            <div class="section-body" id="sipList">
                <div class="flex-center"><div class="spinner"></div></div>
            </div>
        </div>
    `;
    loadSIPs();
}

async function loadSIPs() {
    const uid = getUID();
    try {
        const snapshot = await db.collection('users').doc(uid)
            .collection('sips').orderBy('createdAt', 'desc').get();
        
        const sips = [];
        snapshot.forEach(doc => sips.push({ id: doc.id, ...doc.data() }));
        
        const el = document.getElementById('sipList');
        
        if (sips.length === 0) {
            el.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-chart-line"></i>
                    <h3>No SIP Investments</h3>
                    <p>Track your mutual fund SIPs, stock SIPs, and recurring investments</p>
                    <button class="btn btn-primary" onclick="openAddSIPModal()">
                        <i class="fas fa-plus"></i> Add SIP
                    </button>
                </div>`;
            return;
        }
        
        let html = '<div class="emi-grid">';
        let totalInvested = 0;
        let totalCurrentValue = 0;
        
        sips.forEach(sip => {
            const monthlyAmount = sip.monthlyAmount || 0;
            const installmentsDone = sip.installmentsDone || 0;
            const totalInstallments = sip.totalInstallments || 1;
            const progress = Math.min(100, Math.round((installmentsDone / totalInstallments) * 100));
            const expectedReturns = sip.expectedReturns || 12;
            
            // Calculate expected corpus using compound interest formula
            const monthlyRate = expectedReturns / 12 / 100;
            const investedSoFar = monthlyAmount * installmentsDone;
            let currentValue = investedSoFar;
            
            if (monthlyRate > 0 && installmentsDone > 0) {
                // FV = P * ((1+r)^n - 1)/r * (1+r)
                currentValue = monthlyAmount * (Math.pow(1 + monthlyRate, installmentsDone) - 1) / monthlyRate * (1 + monthlyRate);
            }
            
            totalInvested += investedSoFar;
            totalCurrentValue += currentValue;
            const totalGain = totalCurrentValue - totalInvested;
            
            html += `
                <div class="emi-card sip-card">
                    <div class="emi-card-top">
                        <div>
                            <div class="emi-name">${sip.fundName}</div>
                            <div class="emi-type">${sip.fundType || 'Mutual Fund'} • ${sip.frequency || 'Monthly'}</div>
                        </div>
                        <div class="emi-amount">${formatCurrency(monthlyAmount)}/${sip.frequency === 'Monthly' ? 'mo' : 'qr'}</div>
                    </div>
                    <div class="emi-progress">
                        <div class="progress-bar">
                            <div class="progress-fill green" style="width:${progress}%"></div>
                        </div>
                        <div class="progress-info">
                            <span>${installmentsDone} of ${totalInstallments} installments</span>
                            <span>${progress}%</span>
                        </div>
                    </div>
                    <div class="emi-details">
                        <div class="emi-detail">
                            <span class="emi-detail-label">Fund House</span>
                            <span class="emi-detail-value">${sip.fundHouse || '-'}</span>
                        </div>
                        <div class="emi-detail">
                            <span class="emi-detail-label">Expected Returns</span>
                            <span class="emi-detail-value text-success">${expectedReturns}% p.a.</span>
                        </div>
                        <div class="emi-detail">
                            <span class="emi-detail-label">Invested So Far</span>
                            <span class="emi-detail-value">${formatCurrency(investedSoFar)}</span>
                        </div>
                        <div class="emi-detail">
                            <span class="emi-detail-label">Current Value</span>
                            <span class="emi-detail-value ${currentValue > investedSoFar ? 'text-success' : 'text-danger'}">${formatCurrency(currentValue)}</span>
                        </div>
                        <div class="emi-detail">
                            <span class="emi-detail-label">Start Date</span>
                            <span class="emi-detail-value">${sip.startDate || '-'}</span>
                        </div>
                        <div class="emi-detail">
                            <span class="emi-detail-label">Next SIP Date</span>
                            <span class="emi-detail-value">${calculateNextSIPDate(sip.startDate, installmentsDone)}</span>
                        </div>
                    </div>
                    <div class="emi-actions">
                        <button class="btn btn-sm btn-success" onclick="recordSIPInstallment('${sip.id}', ${installmentsDone}, ${totalInstallments})">
                            <i class="fas fa-check"></i> Record Installment
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="editSIP('${sip.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteSIP('${sip.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>`;
        });
        html += '</div>';
        
        // Summary Section
        html += `
            <div class="flex-between mt-20" style="padding:15px;background:linear-gradient(135deg, #1a1a2e, #16213e);border-radius:var(--radius-md)">
                <div>
                    <div class="fs-12 text-muted">Total Invested</div>
                    <div class="fw-800 fs-18">${formatCurrency(totalInvested)}</div>
                </div>
                <div>
                    <div class="fs-12 text-muted">Current Value</div>
                    <div class="fw-800 fs-18 text-success">${formatCurrency(totalCurrentValue)}</div>
                </div>
                <div>
                    <div class="fs-12 text-muted">Total Returns</div>
                    <div class="fw-800 fs-18 ${totalCurrentValue - totalInvested >= 0 ? 'text-success' : 'text-danger'}">
                        ${formatCurrency(totalCurrentValue - totalInvested)} 
                        (${totalInvested > 0 ? ((totalCurrentValue - totalInvested) / totalInvested * 100).toFixed(2) : 0}%)
                    </div>
                </div>
            </div>`;
        
        el.innerHTML = html;
    } catch (err) {
        console.error(err);
    }
}

function openAddSIPModal() {
    openModal(`
        <div class="modal-header">
            <h2><i class="fas fa-chart-line"></i> Add SIP Investment</h2>
            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
        </div>
        <form onsubmit="saveSIP(event)">
            <div class="form-group">
                <label>Fund/Scheme Name</label>
                <input type="text" id="sipFundName" placeholder="e.g., SBI Bluechip Fund, HDFC Balanced" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Fund Type</label>
                    <select id="sipFundType">
                        <option value="Large Cap">Large Cap</option>
                        <option value="Mid Cap">Mid Cap</option>
                        <option value="Small Cap">Small Cap</option>
                        <option value="ELSS">ELSS (Tax Saving)</option>
                        <option value="Balanced">Balanced/Hybrid</option>
                        <option value="Debt">Debt Fund</option>
                        <option value="Liquid">Liquid Fund</option>
                        <option value="Index">Index Fund</option>
                        <option value="Sectoral">Sectoral Fund</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Fund House</label>
                    <input type="text" id="sipFundHouse" placeholder="e.g., SBI, HDFC, ICICI">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Monthly SIP Amount (₹)</label>
                    <input type="number" id="sipAmount" placeholder="5000" required>
                </div>
                <div class="form-group">
                    <label>SIP Frequency</label>
                    <select id="sipFrequency">
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Total Installments</label>
                    <input type="number" id="sipTotalInstallments" placeholder="60" required>
                </div>
                <div class="form-group">
                    <label>Installments Already Paid</label>
                    <input type="number" id="sipInstallmentsDone" value="0">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Expected Return Rate (%) p.a.</label>
                    <input type="number" id="sipExpectedReturns" placeholder="12" step="0.5" value="12">
                </div>
                <div class="form-group">
                    <label>Start Date</label>
                    <input type="month" id="sipStartDate">
                </div>
            </div>
            <button type="submit" class="btn btn-success btn-full mt-15">
                <i class="fas fa-save"></i> Add SIP
            </button>
        </form>
    `);
}

async function saveSIP(e) {
    e.preventDefault();
    showSyncStatus(true);
    
    try {
        await db.collection('users').doc(getUID()).collection('sips').add({
            fundName: document.getElementById('sipFundName').value,
            fundType: document.getElementById('sipFundType').value,
            fundHouse: document.getElementById('sipFundHouse').value,
            monthlyAmount: parseFloat(document.getElementById('sipAmount').value),
            frequency: document.getElementById('sipFrequency').value,
            totalInstallments: parseInt(document.getElementById('sipTotalInstallments').value),
            installmentsDone: parseInt(document.getElementById('sipInstallmentsDone').value) || 0,
            expectedReturns: parseFloat(document.getElementById('sipExpectedReturns').value),
            startDate: document.getElementById('sipStartDate').value,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        closeModal();
        showToast('SIP added successfully!', 'success');
        loadSIPs();
    } catch (err) {
        showToast('Error saving SIP', 'error');
    }
    showSyncStatus(false);
}

async function recordSIPInstallment(id, currentDone, totalInstallments) {
    if (currentDone >= totalInstallments) {
        showToast('All SIP installments completed! 🎉', 'success');
        return;
    }
    showSyncStatus(true);
    try {
        await db.collection('users').doc(getUID()).collection('sips').doc(id).update({
            installmentsDone: currentDone + 1
        });
        showToast('SIP installment recorded!', 'success');
        loadSIPs();
    } catch (err) {
        showToast('Error', 'error');
    }
    showSyncStatus(false);
}

async function deleteSIP(id) {
    if (!confirm('Delete this SIP?')) return;
    showSyncStatus(true);
    try {
        await db.collection('users').doc(getUID()).collection('sips').doc(id).delete();
        showToast('SIP deleted', 'info');
        loadSIPs();
    } catch (err) {
        showToast('Error', 'error');
    }
    showSyncStatus(false);
}

function calculateNextSIPDate(startDate, installmentsDone) {
    if (!startDate) return 'Not set';
    const date = new Date(startDate + '-01');
    date.setMonth(date.getMonth() + installmentsDone);
    return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

// ============ SHARE MARKET / STOCKS ============
function renderStocks(container) {
    container.innerHTML = `
        <div class="section">
            <div class="section-header">
                <h2 class="section-title"><i class="fas fa-chart-line"></i> Share Market Portfolio</h2>
                <button class="btn btn-primary btn-sm" onclick="openAddStockModal()">
                    <i class="fas fa-plus"></i> Add Stock
                </button>
            </div>
            <div class="section-body" id="stocksList">
                <div class="flex-center"><div class="spinner"></div></div>
            </div>
        </div>
    `;
    loadStocks();
}

async function loadStocks() {
    const uid = getUID();
    try {
        const snapshot = await db.collection('users').doc(uid)
            .collection('stocks').orderBy('createdAt', 'desc').get();
        
        const stocks = [];
        snapshot.forEach(doc => stocks.push({ id: doc.id, ...doc.data() }));
        
        const el = document.getElementById('stocksList');
        
        if (stocks.length === 0) {
            el.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-chart-line"></i>
                    <h3>No Stocks in Portfolio</h3>
                    <p>Track your stock investments, buy price, and current value</p>
                    <button class="btn btn-primary" onclick="openAddStockModal()">
                        <i class="fas fa-plus"></i> Add Stock
                    </button>
                </div>`;
            return;
        }
        
        let html = '<div class="emi-grid">';
        let totalInvested = 0;
        let totalCurrent = 0;
        
        for (const stock of stocks) {
            const quantity = stock.quantity || 0;
            const buyPrice = stock.buyPrice || 0;
            const invested = quantity * buyPrice;
            let currentPrice = stock.currentPrice || buyPrice;
            let currentValue = quantity * currentPrice;
            
            totalInvested += invested;
            totalCurrent += currentValue;
            
            const gainLoss = currentValue - invested;
            const gainLossPercent = invested > 0 ? (gainLoss / invested * 100) : 0;
            
            html += `
                <div class="emi-card stock-card">
                    <div class="emi-card-top">
                        <div>
                            <div class="emi-name">${stock.stockName} <span class="stock-symbol">(${stock.symbol || stock.stockName})</span></div>
                            <div class="emi-type">${stock.exchange || 'NSE'} • ${stock.sector || 'Stock'}</div>
                        </div>
                        <div class="emi-amount">${formatCurrency(currentValue)}</div>
                    </div>
                    <div class="stock-price-info">
                        <span>Buy: ₹${buyPrice.toFixed(2)}</span>
                        <span>Current: ₹${currentPrice.toFixed(2)}</span>
                        <span>Qty: ${quantity}</span>
                    </div>
                    <div class="emi-details">
                        <div class="emi-detail">
                            <span class="emi-detail-label">Invested Amount</span>
                            <span class="emi-detail-value">${formatCurrency(invested)}</span>
                        </div>
                        <div class="emi-detail">
                            <span class="emi-detail-label">Current Value</span>
                            <span class="emi-detail-value ${gainLoss >= 0 ? 'text-success' : 'text-danger'}">${formatCurrency(currentValue)}</span>
                        </div>
                        <div class="emi-detail">
                            <span class="emi-detail-label">Profit/Loss</span>
                            <span class="emi-detail-value ${gainLoss >= 0 ? 'text-success' : 'text-danger'}">
                                ${formatCurrency(gainLoss)} (${gainLossPercent >= 0 ? '+' : ''}${gainLossPercent.toFixed(2)}%)
                            </span>
                        </div>
                        <div class="emi-detail">
                            <span class="emi-detail-label">Buy Date</span>
                            <span class="emi-detail-value">${stock.buyDate || '-'}</span>
                        </div>
                    </div>
                    <div class="emi-actions">
                        <button class="btn btn-sm btn-outline" onclick="updateStockPrice('${stock.id}')">
                            <i class="fas fa-sync-alt"></i> Update Price
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteStock('${stock.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>`;
        }
        html += '</div>';
        
        // Portfolio Summary
        const totalGainLoss = totalCurrent - totalInvested;
        html += `
            <div class="flex-between mt-20" style="padding:15px;background:linear-gradient(135deg, #1a1a2e, #16213e);border-radius:var(--radius-md)">
                <div>
                    <div class="fs-12 text-muted">Total Invested</div>
                    <div class="fw-800 fs-18">${formatCurrency(totalInvested)}</div>
                </div>
                <div>
                    <div class="fs-12 text-muted">Current Value</div>
                    <div class="fw-800 fs-18">${formatCurrency(totalCurrent)}</div>
                </div>
                <div>
                    <div class="fs-12 text-muted">Total P&L</div>
                    <div class="fw-800 fs-18 ${totalGainLoss >= 0 ? 'text-success' : 'text-danger'}">
                        ${formatCurrency(totalGainLoss)} (${totalInvested > 0 ? ((totalGainLoss / totalInvested) * 100).toFixed(2) : 0}%)
                    </div>
                </div>
            </div>`;
        
        el.innerHTML = html;
    } catch (err) {
        console.error(err);
    }
}

function openAddStockModal() {
    openModal(`
        <div class="modal-header">
            <h2><i class="fas fa-chart-line"></i> Add Stock</h2>
            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
        </div>
        <form onsubmit="saveStock(event)">
            <div class="form-group">
                <label>Stock Name</label>
                <input type="text" id="stockName" placeholder="e.g., Reliance Industries" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Symbol (Optional)</label>
                    <input type="text" id="stockSymbol" placeholder="e.g., RELIANCE">
                </div>
                <div class="form-group">
                    <label>Exchange</label>
                    <select id="stockExchange">
                        <option value="NSE">NSE</option>
                        <option value="BSE">BSE</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Quantity</label>
                    <input type="number" id="stockQuantity" placeholder="10" required>
                </div>
                <div class="form-group">
                    <label>Buy Price (₹)</label>
                    <input type="number" id="stockBuyPrice" placeholder="2500" step="0.01" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Current Price (₹)</label>
                    <input type="number" id="stockCurrentPrice" placeholder="2700" step="0.01">
                </div>
                <div class="form-group">
                    <label>Sector</label>
                    <select id="stockSector">
                        <option value="IT">IT</option>
                        <option value="Banking">Banking</option>
                        <option value="Pharma">Pharma</option>
                        <option value="Auto">Auto</option>
                        <option value="Energy">Energy</option>
                        <option value="FMCG">FMCG</option>
                        <option value="Metal">Metal</option>
                        <option value="Others">Others</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>Buy Date</label>
                <input type="date" id="stockBuyDate">
            </div>
            <button type="submit" class="btn btn-success btn-full mt-15">
                <i class="fas fa-save"></i> Add Stock
            </button>
        </form>
    `);
}

async function saveStock(e) {
    e.preventDefault();
    showSyncStatus(true);
    
    try {
        await db.collection('users').doc(getUID()).collection('stocks').add({
            stockName: document.getElementById('stockName').value,
            symbol: document.getElementById('stockSymbol').value,
            exchange: document.getElementById('stockExchange').value,
            quantity: parseInt(document.getElementById('stockQuantity').value),
            buyPrice: parseFloat(document.getElementById('stockBuyPrice').value),
            currentPrice: parseFloat(document.getElementById('stockCurrentPrice').value) || parseFloat(document.getElementById('stockBuyPrice').value),
            sector: document.getElementById('stockSector').value,
            buyDate: document.getElementById('stockBuyDate').value,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        closeModal();
        showToast('Stock added!', 'success');
        loadStocks();
    } catch (err) {
        showToast('Error saving stock', 'error');
    }
    showSyncStatus(false);
}

async function updateStockPrice(id) {
    const newPrice = prompt('Enter current stock price (₹):');
    if (!newPrice || isNaN(newPrice)) return;
    
    showSyncStatus(true);
    try {
        await db.collection('users').doc(getUID()).collection('stocks').doc(id).update({
            currentPrice: parseFloat(newPrice)
        });
        showToast('Stock price updated!', 'success');
        loadStocks();
    } catch (err) {
        showToast('Error', 'error');
    }
    showSyncStatus(false);
}

async function deleteStock(id) {
    if (!confirm('Delete this stock from portfolio?')) return;
    showSyncStatus(true);
    try {
        await db.collection('users').doc(getUID()).collection('stocks').doc(id).delete();
        showToast('Stock deleted', 'info');
        loadStocks();
    } catch (err) {
        showToast('Error', 'error');
    }
    showSyncStatus(false);
}

// ============ SHARE MARKET TIPS (Mock API - You can replace with real API) ============
function renderMarketTips(container) {
    container.innerHTML = `
        <div class="section">
            <div class="section-header">
                <h2 class="section-title"><i class="fas fa-lightbulb"></i> Share Market Tips & Insights</h2>
                <button class="btn btn-outline btn-sm" onclick="refreshMarketTips()">
                    <i class="fas fa-sync-alt"></i> Refresh
                </button>
            </div>
            <div class="section-body" id="marketTipsList">
                <div class="flex-center"><div class="spinner"></div></div>
            </div>
        </div>
    `;
    loadMarketTips();
}

async function loadMarketTips() {
    const el = document.getElementById('marketTipsList');
    
    // Sample tips - You can replace with real API like Alpha Vantage, Yahoo Finance, or NSE API
    const tips = [
        { type: 'BUY', stock: 'RELIANCE', target: '₹2,850', reason: 'Strong support at ₹2,400 level', timeframe: 'Short Term' },
        { type: 'BUY', stock: 'HDFC BANK', target: '₹1,750', reason: 'Breakout above consolidation', timeframe: 'Medium Term' },
        { type: 'HOLD', stock: 'TCS', target: '₹4,200', reason: 'Consolidating, wait for breakout', timeframe: 'Long Term' },
        { type: 'SELL', stock: 'ITC', target: '₹400', reason: 'Resistance at higher levels', timeframe: 'Short Term' },
        { type: 'BUY', stock: 'INFY', target: '₹1,650', reason: 'Oversold levels, expected bounce', timeframe: 'Short Term' }
    ];
    
    let html = '<div class="tips-grid">';
    tips.forEach(tip => {
        const typeClass = tip.type === 'BUY' ? 'tip-buy' : (tip.type === 'SELL' ? 'tip-sell' : 'tip-hold');
        html += `
            <div class="tip-card ${typeClass}">
                <div class="tip-header">
                    <span class="tip-type">${tip.type}</span>
                    <span class="tip-stock">${tip.stock}</span>
                </div>
                <div class="tip-target">Target: ${tip.target}</div>
                <div class="tip-reason">${tip.reason}</div>
                <div class="tip-timeframe">⏱️ ${tip.timeframe}</div>
            </div>
        `;
    });
    html += '</div>';
    
    // Disclaimer
    html += `
        <div class="disclaimer mt-20" style="padding:12px;background:rgba(255,193,7,0.1);border-radius:var(--radius-sm);font-size:12px;color:var(--text-muted)">
            <i class="fas fa-shield-alt"></i> Disclaimer: These are sample tips for demonstration. For real market tips, integrate with NSE/BSE API or financial data providers.
        </div>`;
    
    el.innerHTML = html;
}

function refreshMarketTips() {
    showToast('Refreshing market tips...', 'info');
    loadMarketTips();
}
