// ============================================
// SAVINGS GUIDE & PURCHASE ADVISOR MODULE
// ============================================

function renderSavingsGuide(container) {
    container.innerHTML = `
        <div class="guide-cards">
            <div class="guide-card">
                <div class="guide-card-icon" style="background:rgba(46,203,113,0.15);color:var(--secondary)">💰</div>
                <h3>50/30/20 Rule</h3>
                <p>The golden rule of personal finance:</p>
                <ul>
                    <li><strong>50% Needs:</strong> Rent, EMIs, bills, groceries</li>
                    <li><strong>30% Wants:</strong> Entertainment, dining, shopping</li>
                    <li><strong>20% Savings:</strong> Emergency fund, investments, FD</li>
                </ul>
            </div>
            
            <div class="guide-card">
                <div class="guide-card-icon" style="background:rgba(108,99,255,0.15);color:var(--primary)">🏦</div>
                <h3>Emergency Fund</h3>
                <p>Build a safety net before anything else:</p>
                <ul>
                    <li>Save <strong>6 months of expenses</strong></li>
                    <li>Keep in liquid fund or savings account</li>
                    <li>Never invest emergency fund in stocks</li>
                    <li>Start with even ₹500/month</li>
                </ul>
            </div>
            
            <div class="guide-card">
                <div class="guide-card-icon" style="background:rgba(231,76,60,0.15);color:var(--danger)">📉</div>
                <h3>Debt Avalanche Method</h3>
                <p>Pay off debts smartly:</p>
                <ul>
                    <li>List all loans by <strong>interest rate</strong></li>
                    <li>Pay minimum on all loans</li>
                    <li>Put extra money on <strong>highest interest</strong> loan</li>
                    <li>Once paid, move to next highest</li>
                </ul>
            </div>
            
            <div class="guide-card">
                <div class="guide-card-icon" style="background:rgba(243,156,18,0.15);color:var(--warning)">🛒</div>
                <h3>Smart Shopping</h3>
                <p>Save on everyday purchases:</p>
                <ul>
                    <li><strong>30-day rule:</strong> Wait before buying non-essentials</li>
                    <li>Use cashback apps and coupons</li>
                    <li>Buy during sales (Big Billion Day, Prime Day)</li>
                    <li>Compare prices on multiple platforms</li>
                    <li>Buy in bulk for regular items</li>
                </ul>
            </div>
            
            <div class="guide-card">
                <div class="guide-card-icon" style="background:rgba(52,152,219,0.15);color:var(--info)">📱</div>
                <h3>Reduce Monthly Bills</h3>
                <p>Quick wins for lower bills:</p>
                <ul>
                    <li>Switch to annual subscriptions (save 20-40%)</li>
                    <li>Use LED bulbs (save 50% electricity)</li>
                    <li>Audit all subscriptions monthly</li>
                    <li>Negotiate phone/internet plans</li>
                    <li>Use free alternatives where possible</li>
                </ul>
            </div>
            
            <div class="guide-card">
                <div class="guide-card-icon" style="background:rgba(155,89,182,0.15);color:#9B59B6">📈</div>
                <h3>Investment Ladder</h3>
                <p>Start investing step by step:</p>
                <ul>
                    <li><strong>Step 1:</strong> Emergency fund (Savings/Liquid Fund)</li>
                    <li><strong>Step 2:</strong> PPF/ELSS for tax saving</li>
                    <li><strong>Step 3:</strong> Index Fund SIP (₹500-5000/mo)</li>
                    <li><strong>Step 4:</strong> Diversify - stocks, gold, bonds</li>
                    <li><strong>Step 5:</strong> Real estate (when ready)</li>
                </ul>
            </div>
            
            <div class="guide-card">
                <div class="guide-card-icon" style="background:rgba(26,188,156,0.15);color:#1ABC9C">🍔</div>
                <h3>Food & Dining Savings</h3>
                <p>Biggest daily expense reducer:</p>
                <ul>
                    <li>Cook at home 5 days/week</li>
                    <li>Meal prep on weekends</li>
                    <li>Carry lunch to office</li>
                    <li>Limit ordering in to 2x/week</li>
                    <li>Use Swiggy/Zomato coupons when ordering</li>
                </ul>
            </div>
            
            <div class="guide-card">
                <div class="guide-card-icon" style="background:rgba(230,126,34,0.15);color:#E67E22">🚗</div>
                <h3>Transport Savings</h3>
                <p>Reduce commute costs:</p>
                <ul>
                    <li>Carpool with colleagues</li>
                    <li>Use metro/bus for regular commute</li>
                    <li>Maintain vehicle properly (better mileage)</li>
                    <li>Use Ola/Uber share or pool</li>
                    <li>Walk/cycle for short distances</li>
                </ul>
            </div>
            
            <div class="guide-card">
                <div class="guide-card-icon" style="background:rgba(255,107,107,0.15);color:#FF6B6B">💳</div>
                <h3>Credit Card Wisdom</h3>
                <p>Use credit wisely:</p>
                <ul>
                    <li><strong>Always pay full bill</strong> - Never pay minimum</li>
                    <li>Use rewards/cashback cards smartly</li>
                    <li>Keep utilization below 30%</li>
                    <li>Don't convert to EMI (high interest!)</li>
                    <li>Have max 2 cards</li>
                </ul>
            </div>
            
            <div class="guide-card">
                <div class="guide-card-icon" style="background:rgba(46,203,113,0.15);color:var(--secondary)">🎯</div>
                <h3>Financial Goals</h3>
                <p>Set clear money goals:</p>
                <ul>
                    <li><strong>Short-term (1yr):</strong> Emergency fund, vacation</li>
                    <li><strong>Medium (3-5yr):</strong> Car, education, wedding</li>
                    <li><strong>Long-term (10+yr):</strong> House, retirement</li>
                    <li>Write them down with amounts</li>
                    <li>Review and adjust quarterly</li>
                </ul>
            </div>
            
            <div class="guide-card">
                <div class="guide-card-icon" style="background:rgba(108,99,255,0.15);color:var(--primary)">🧠</div>
                <h3>Money Mindset</h3>
                <p>Psychology of saving:</p>
                <ul>
                    <li>Pay yourself first (save before spending)</li>
                    <li>Avoid lifestyle inflation with raises</li>
                    <li>Track every rupee for 1 month</li>
                    <li>Differentiate needs vs wants</li>
                    <li>Celebrate small financial wins</li>
                </ul>
            </div>
            
            <div class="guide-card">
                <div class="guide-card-icon" style="background:rgba(231,76,60,0.15);color:var(--danger)">⚠️</div>
                <h3>Money Mistakes to Avoid</h3>
                <p>Common pitfalls:</p>
                <ul>
                    <li>❌ No emergency fund</li>
                    <li>❌ Taking loans for lifestyle</li>
                    <li>❌ Not tracking expenses</li>
                    <li>❌ Ignoring insurance</li>
                    <li>❌ Delaying investments</li>
                    <li>❌ Lending more than you can lose</li>
                </ul>
            </div>
        </div>
    `;
}

// ============ PURCHASE ADVISOR ============
function renderPurchaseAdvisor(container) {
    container.innerHTML = `
        <div class="section">
            <div class="section-header">
                <h2 class="section-title"><i class="fas fa-brain"></i> Should I Buy This?</h2>
            </div>
            <div class="section-body">
                <p class="text-muted mb-20">Let AI analyze whether you should make a purchase now or wait.</p>
                
                <div class="purchase-form">
                    <div class="form-group">
                        <label><i class="fas fa-tag"></i> What do you want to buy?</label>
                        <input type="text" id="purchaseItem" placeholder="e.g., iPhone 15, Laptop, Washing Machine">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label><i class="fas fa-rupee-sign"></i> Price (₹)</label>
                            <input type="number" id="purchasePrice" placeholder="50000">
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-list"></i> Category</label>
                            <select id="purchaseCategory">
                                <option value="electronics">Electronics</option>
                                <option value="appliance">Home Appliance</option>
                                <option value="fashion">Fashion/Clothing</option>
                                <option value="vehicle">Vehicle</option>
                                <option value="furniture">Furniture</option>
                                <option value="gadget">Gadget/Accessory</option>
                                <option value="subscription">Subscription/Service</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-question-circle"></i> How urgently do you need it?</label>
                        <select id="purchaseUrgency">
                            <option value="high">Urgent - Need it now</option>
                            <option value="medium">Can wait 1-2 weeks</option>
                            <option value="low">Can wait 1-3 months</option>
                            <option value="want">Just want it (not a need)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-info-circle"></i> Any other details?</label>
                        <textarea id="purchaseNotes" placeholder="e.g., Old one is broken, saw a deal, friend recommended..."></textarea>
                    </div>
                    <button class="btn btn-primary btn-full mt-10" onclick="analyzePurchase()">
                        <i class="fas fa-brain"></i> Analyze Purchase Decision
                    </button>
                </div>
                
                <div id="purchaseResult"></div>
            </div>
        </div>
    `;
}

async function analyzePurchase() {
    const item = document.getElementById('purchaseItem').value;
    const price = parseFloat(document.getElementById('purchasePrice').value);
    const category = document.getElementById('purchaseCategory').value;
    const urgency = document.getElementById('purchaseUrgency').value;
    const notes = document.getElementById('purchaseNotes').value;
    
    if (!item || !price) {
        showToast('Please fill in item name and price', 'error');
        return;
    }
    
    const resultEl = document.getElementById('purchaseResult');
    resultEl.innerHTML = '<div class="flex-center mt-20"><div class="spinner"></div> Analyzing...</div>';
    
    const data = await getAllFinancialData(getUID());
    
    setTimeout(() => {
        const analysis = generatePurchaseAdvice(item, price, category, urgency, notes, data);
        resultEl.innerHTML = analysis;
    }, 1500);
}

function generatePurchaseAdvice(item, price, category, urgency, notes, data) {
    const balance = data.balance;
    const income = data.totalIncome;
    const priceToIncome = (price / income) * 100;
    const priceToBalance = balance > 0 ? (price / balance) * 100 : Infinity;
    const hasEmergencyFund = balance * 6 > data.totalExpenses * 6;
    
    let verdict = 'wait';
    let verdictTitle = '';
    let verdictDesc = '';
    const factors = [];
    
    // Decision Logic
    let score = 50; // Start neutral
    
    // Urgency factor
    if (urgency === 'high') { score += 20; factors.push({ icon: 'check-circle', type: 'positive', text: `High urgency - You need this ${item}` }); }
    else if (urgency === 'medium') { score += 5; factors.push({ icon: 'info-circle', type: 'neutral', text: 'Medium urgency - Can wait a bit for better deal' }); }
    else if (urgency === 'low') { score -= 10; factors.push({ icon: 'clock', type: 'neutral', text: 'Low urgency - Good candidate for waiting' }); }
    else { score -= 20; factors.push({ icon: 'times-circle', type: 'negative', text: 'This is a want, not a need. Apply 30-day rule.' }); }
    
    // Affordability
    if (price <= balance * 0.2) {
        score += 20;
        factors.push({ icon: 'check-circle', type: 'positive', text: `Affordable - Only ${Math.round(priceToBalance)}% of your monthly surplus` });
    } else if (price <= balance) {
        score += 5;
        factors.push({ icon: 'info-circle', type: 'neutral', text: `Takes ${Math.round(priceToBalance)}% of your surplus. Consider saving for it.` });
    } else if (price <= balance * 3) {
        score -= 10;
        factors.push({ icon: 'exclamation-triangle', type: 'negative', text: `Expensive - Would take ${Math.ceil(price / balance)} months of savings` });
    } else {
        score -= 25;
        factors.push({ icon: 'times-circle', type: 'negative', text: `Very expensive relative to your income. Not recommended right now.` });
    }
    
    // Loan burden
    const totalEMI = data.bankEMI + data.personalEMI + data.installments;
    if (totalEMI > income * 0.4) {
        score -= 15;
        factors.push({ icon: 'exclamation-circle', type: 'negative', text: 'High EMI burden. Focus on clearing loans before big purchases.' });
    } else if (totalEMI > 0) {
        score -= 5;
        factors.push({ icon: 'info-circle', type: 'neutral', text: `Active loans of ${formatCurrency(totalEMI)}/mo. Consider loan priority.` });
    } else {
        score += 10;
        factors.push({ icon: 'check-circle', type: 'positive', text: 'No active loans! Good position for purchases.' });
    }
    
    // Sale timing
    const saleMonths = [0, 9, 10]; // Jan, Oct, Nov (sale seasons)
    const currentMonth = new Date().getMonth();
    const isNearSale = saleMonths.some(m => Math.abs(m - currentMonth) <= 1);
    
    if (category === 'electronics' || category === 'appliance') {
        if (isNearSale) {
            score += 10;
            factors.push({ icon: 'tag', type: 'positive', text: '🏷️ Sale season! Good time for electronics deals.' });
        } else {
            score -= 5;
            factors.push({ icon: 'clock', type: 'neutral', text: `Next big sale in ${getNextSaleInfo()}. Waiting could save 10-30%.` });
        }
        
        // New model cycle
        if (category === 'electronics') {
            factors.push({ icon: 'lightbulb', type: 'neutral', text: 'Check if newer model is coming soon - current prices may drop.' });
        }
    }
    
    // Emergency fund check
    if (!hasEmergencyFund) {
        score -= 15;
        factors.push({ icon: 'exclamation-triangle', type: 'negative', text: '⚠️ You don\'t have 6 months emergency fund yet. Prioritize that.' });
    }
    
    // Final verdict
    if (score >= 60) {
        verdict = 'buy';
        verdictTitle = '✅ Go Ahead & Buy!';
        verdictDesc = `Based on your finances, buying ${item} is reasonable right now.`;
    } else if (score >= 35) {
        verdict = 'wait';
        verdictTitle = '⏳ Wait & Save';
        verdictDesc = `Better to wait ${urgency === 'want' ? '30 days' : '1-2 weeks'} and save specifically for this.`;
    } else {
        verdict = 'skip';
        verdictTitle = '❌ Skip For Now';
        verdictDesc = 'Your current financial situation suggests postponing this purchase.';
    }
    
    return `
        <div class="purchase-result">
            <div class="purchase-verdict">
                <div class="verdict-icon ${verdict}">
                    ${verdict === 'buy' ? '✅' : verdict === 'wait' ? '⏳' : '❌'}
                </div>
                <div class="verdict-text">
                    <h3>${verdictTitle}</h3>
                    <p>${verdictDesc}</p>
                </div>
            </div>
            
            <div style="padding:12px;background:var(--dark);border-radius:8px;margin-bottom:15px">
                <div class="flex-between">
                    <span class="text-muted">Item:</span>
                    <span class="fw-700">${item}</span>
                </div>
                <div class="flex-between mt-10">
                    <span class="text-muted">Price:</span>
                    <span class="fw-700">${formatCurrency(price)}</span>
                </div>
                <div class="flex-between mt-10">
                    <span class="text-muted">% of Income:</span>
                    <span class="fw-700 ${priceToIncome > 30 ? 'text-danger' : priceToIncome > 15 ? 'text-warning' : 'text-success'}">
                        ${Math.round(priceToIncome)}%
                    </span>
                </div>
                <div class="flex-between mt-10">
                    <span class="text-muted">Score:</span>
                    <span class="fw-700 ${score >= 60 ? 'text-success' : score >= 35 ? 'text-warning' : 'text-danger'}">
                        ${score}/100
                    </span>
                </div>
            </div>
            
            <h4 class="mb-10">Analysis Factors:</h4>
            <div class="purchase-factors">
                ${factors.map(f => `
                    <div class="factor-item">
                        <i class="fas fa-${f.icon} ${f.type}"></i>
                        <span>${f.text}</span>
                    </div>
                `).join('')}
            </div>
            
            ${verdict !== 'buy' ? `
                <div style="margin-top:20px;padding:15px;background:rgba(108,99,255,0.1);border-radius:8px;border:1px solid rgba(108,99,255,0.2)">
                    <h4 style="color:var(--primary);margin-bottom:8px">💡 Smart Alternative:</h4>
                    <p class="fs-14">Save ${formatCurrency(Math.ceil(price / 3))} for 3 months, then buy during the next sale. 
                    You'll likely save ${formatCurrency(price * 0.15)} (15%) and won't impact your finances.</p>
                </div>
            ` : `
                <div style="margin-top:20px;padding:15px;background:rgba(46,203,113,0.1);border-radius:8px;border:1px solid rgba(46,203,113,0.2)">
                    <h4 style="color:var(--secondary);margin-bottom:8px">💡 Pro Tips:</h4>
                    <p class="fs-14">• Compare prices on Amazon, Flipkart, Croma, Reliance Digital<br>
                    • Check for bank card offers (extra 5-10% off)<br>
                    • Use cashback apps like CRED, Cashkaro</p>
                </div>
            `}
        </div>
    `;
}

function getNextSaleInfo() {
    const now = new Date();
    const month = now.getMonth();
    
    const sales = [
        { month: 0, name: 'Republic Day Sale (Jan)' },
        { month: 2, name: 'Holi Sale (Mar)' },
        { month: 6, name: 'Prime Day (Jul)' },
        { month: 9, name: 'Big Billion Day/Great Indian (Oct)' },
        { month: 10, name: 'Diwali Sale (Nov)' },
        { month: 11, name: 'Year End Sale (Dec)' }
    ];
    
    for (let sale of sales) {
        if (sale.month > month) {
            return sale.name;
        }
    }
    return sales[0].name;
}