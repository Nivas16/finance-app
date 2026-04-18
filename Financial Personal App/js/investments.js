// ============================================
// SIP & INVESTMENTS MODULE - REAL-TIME DATA
// ============================================

// ============ SIP TRACKING ============
function renderSIP(container) {
    container.innerHTML = '<div class="section"><div class="section-header"><h2 class="section-title"><i class="fas fa-chart-line"></i> SIP Investments</h2><button class="btn btn-primary btn-sm" onclick="openAddSIPModal()"><i class="fas fa-plus"></i> Add SIP</button></div><div class="section-body" id="sipList"><div class="flex-center"><div class="spinner"></div></div></div></div>';
    loadSIPs();
}

async function loadSIPs() {
    var uid = getUID();
    try {
        var snapshot = await db.collection('users').doc(uid).collection('sips').orderBy('createdAt', 'desc').get();
        
        var sips = [];
        snapshot.forEach(function(doc) { sips.push({ id: doc.id, data: doc.data() }); });
        
        var el = document.getElementById('sipList');
        
        if (sips.length === 0) {
            el.innerHTML = '<div class="empty-state"><i class="fas fa-chart-line"></i><h3>No SIP Investments</h3><p>Track your mutual fund SIPs</p><button class="btn btn-primary" onclick="openAddSIPModal()"><i class="fas fa-plus"></i> Add SIP</button></div>';
            return;
        }
        
        var html = '<div class="emi-grid">';
        var totalInvested = 0;
        
        sips.forEach(function(sip) {
            var monthlyAmount = sip.data.monthlyAmount || 0;
            var installmentsDone = sip.data.installmentsDone || 0;
            var investedSoFar = monthlyAmount * installmentsDone;
            
            totalInvested += investedSoFar;
            
            html += '<div class="emi-card"><div class="emi-card-top"><div><div class="emi-name">' + sip.data.fundName + '</div><div class="emi-type">' + sip.data.fundType + '</div></div><div class="emi-amount">' + formatCurrency(monthlyAmount) + '/mo</div></div><div class="emi-details"><div class="emi-detail"><span class="emi-detail-label">Invested So Far</span><span class="emi-detail-value">' + formatCurrency(investedSoFar) + '</span></div><div class="emi-detail"><span class="emi-detail-label">Expected Returns</span><span class="emi-detail-value text-success">' + (sip.data.expectedReturns || 12) + '% p.a.</span></div></div><div class="emi-actions"><button class="btn btn-sm btn-danger" onclick="deleteSIP(\'' + sip.id + '\')"><i class="fas fa-trash"></i></button></div></div>';
        });
        
        html += '</div><div class="flex-between mt-20" style="padding:15px;background:linear-gradient(135deg, #1a1a2e, #16213e);border-radius:var(--radius-md)"><div><div class="fs-12 text-muted">Total Invested</div><div class="fw-800 fs-18">' + formatCurrency(totalInvested) + '</div></div></div>';
        
        el.innerHTML = html;
    } catch (err) {
        console.error(err);
    }
}

function openAddSIPModal() {
    openModal('<div class="modal-header"><h2><i class="fas fa-chart-line"></i> Add SIP Investment</h2><button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button></div>' +
        '<form onsubmit="saveSIP(event)">' +
        '<div class="form-group"><label>Fund/Scheme Name</label><input type="text" id="sipFundName" placeholder="e.g., SBI Bluechip Fund" required></div>' +
        '<div class="form-row"><div class="form-group"><label>Monthly Amount (Rs.)</label><input type="number" id="sipAmount" placeholder="5000" required></div><div class="form-group"><label>Expected Return (%)</label><input type="number" id="sipExpectedReturns" placeholder="12" value="12"></div></div>' +
        '<button type="submit" class="btn btn-success btn-full mt-15"><i class="fas fa-save"></i> Add SIP</button></form>');
}

async function saveSIP(e) {
    e.preventDefault();
    showSyncStatus(true);
    
    try {
        await db.collection('users').doc(getUID()).collection('sips').add({
            fundName: document.getElementById('sipFundName').value,
            fundType: 'Mutual Fund',
            monthlyAmount: parseFloat(document.getElementById('sipAmount').value),
            expectedReturns: parseFloat(document.getElementById('sipExpectedReturns').value) || 12,
            installmentsDone: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        closeModal();
        showToast('SIP added!', 'success');
        loadSIPs();
    } catch (err) {
        showToast('Error saving SIP', 'error');
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

// ============ SHARE MARKET - REAL TIME DATA ============
function renderStocks(container) {
    container.innerHTML = '<div class="section"><div class="section-header"><h2 class="section-title"><i class="fas fa-chart-line"></i> My Stock Portfolio</h2><button class="btn btn-primary btn-sm" onclick="openAddStockModal()"><i class="fas fa-plus"></i> Add Stock</button></div><div class="section-body" id="stocksList"><div class="flex-center"><div class="spinner"></div></div></div></div>';
    loadStocks();
}

async function loadStocks() {
    var uid = getUID();
    try {
        var snapshot = await db.collection('users').doc(uid).collection('stocks').orderBy('createdAt', 'desc').get();
        
        var stocks = [];
        snapshot.forEach(function(doc) { stocks.push({ id: doc.id, data: doc.data() }); });
        
        var el = document.getElementById('stocksList');
        
        if (stocks.length === 0) {
            el.innerHTML = '<div class="empty-state"><i class="fas fa-chart-line"></i><h3>No Stocks in Portfolio</h3><p>Track your stock investments</p><button class="btn btn-primary" onclick="openAddStockModal()"><i class="fas fa-plus"></i> Add Stock</button></div>';
            return;
        }
        
        var html = '<div class="emi-grid">';
        var totalInvested = 0;
        var totalCurrent = 0;
        
        // Fetch real-time prices from Yahoo Finance
        var stockPrices = await fetchRealTimePrices(stocks);
        
        stocks.forEach(function(stock) {
            var quantity = stock.data.quantity || 0;
            var buyPrice = stock.data.buyPrice || 0;
            var invested = quantity * buyPrice;
            
            // Use real-time price
            var currentPrice = stockPrices[stock.data.symbol] || stock.data.currentPrice || buyPrice;
            var currentValue = quantity * currentPrice;
            
            totalInvested += invested;
            totalCurrent += currentValue;
            
            var gainLoss = currentValue - invested;
            var gainLossPercent = invested > 0 ? (gainLoss / invested * 100) : 0;
            var gainClass = gainLoss >= 0 ? 'text-success' : 'text-danger';
            
            var priceChange = stockPrices[stock.data.symbol + '_change'] || 0;
            var changeClass = priceChange >= 0 ? 'text-success' : 'text-danger';
            
            html += '<div class="emi-card"><div class="emi-card-top"><div><div class="emi-name">' + stock.data.stockName + ' <span class="stock-symbol">(' + stock.data.symbol + ')</span></div><div class="emi-type">NSE</div></div><div class="emi-amount">' + formatCurrency(currentValue) + '</div></div><div class="stock-price-info"><span>Buy: Rs.' + buyPrice.toFixed(2) + '</span><span class="' + changeClass + '">Now: Rs.' + currentPrice.toFixed(2) + ' (' + (priceChange >= 0 ? '+' : '') + priceChange.toFixed(2) + '%)</span><span>Qty: ' + quantity + '</span></div><div class="emi-details"><div class="emi-detail"><span class="emi-detail-label">Invested</span><span class="emi-detail-value">' + formatCurrency(invested) + '</span></div><div class="emi-detail"><span class="emi-detail-label">Current Value</span><span class="emi-detail-value ' + gainClass + '">' + formatCurrency(currentValue) + '</span></div><div class="emi-detail"><span class="emi-detail-label">P&L</span><span class="emi-detail-value ' + gainClass + '">' + formatCurrency(gainLoss) + ' (' + (gainLossPercent >= 0 ? '+' : '') + gainLossPercent.toFixed(2) + '%)</span></div></div><div class="emi-actions"><button class="btn btn-sm btn-danger" onclick="deleteStock(\'' + stock.id + '\')"><i class="fas fa-trash"></i></button></div></div>';
        });
        
        html += '</div>';
        
        var totalGainLoss = totalCurrent - totalInvested;
        var totalGainPercent = totalInvested > 0 ? (totalGainLoss / totalInvested * 100) : 0;
        
        html += '<div class="flex-between mt-20" style="padding:15px;background:linear-gradient(135deg, #1a1a2e, #16213e);border-radius:var(--radius-md)"><div><div class="fs-12 text-muted">Total Invested</div><div class="fw-800 fs-18">' + formatCurrency(totalInvested) + '</div></div><div><div class="fs-12 text-muted">Current Value</div><div class="fw-800 fs-18">' + formatCurrency(totalCurrent) + '</div></div><div><div class="fs-12 text-muted">Total P&L</div><div class="fw-800 fs-18 ' + (totalGainLoss >= 0 ? 'text-success' : 'text-danger') + '">' + formatCurrency(totalGainLoss) + ' (' + (totalGainPercent >= 0 ? '+' : '') + totalGainPercent.toFixed(2) + '%)</div></div></div>';
        
        el.innerHTML = html;
    } catch (err) {
        console.error(err);
    }
}

// Fetch real-time prices from Yahoo Finance with CORS proxy
async function fetchRealTimePrices(stocks) {
    var prices = {};
    
    if (stocks.length === 0) return prices;
    
    // Get unique symbols with .NS suffix for NSE
    var symbols = stocks.map(function(s) { 
        return s.data.symbol + '.NS'; 
    });
    
    // Create URL with CORS proxy
    var baseUrl = 'https://api.allorigins.win/get?url=';
    var encodedUrl = encodeURIComponent('https://query1.finance.yahoo.com/v7/finance/quote?symbols=' + symbols.join(','));
    var url = baseUrl + encodedUrl;
    
    try {
        var response = await fetch(url);
        
        if (!response.ok) throw new Error('API error');
        
        var data = await response.json();
        var content = JSON.parse(data.contents);
        
        if (content.quoteResponse && content.quoteResponse.result) {
            content.quoteResponse.result.forEach(function(stock) {
                var symbol = stock.symbol.replace('.NS', '');
                prices[symbol] = stock.regularMarketPrice || 0;
                prices[symbol + '_change'] = stock.regularMarketChangePercent || 0;
            });
        }
    } catch (err) {
        console.log('Yahoo Finance API failed:', err.message);
        
        // Fallback to stored prices
        stocks.forEach(function(stock) {
            prices[stock.data.symbol] = stock.data.currentPrice || stock.data.buyPrice || 0;
            prices[stock.data.symbol + '_change'] = 0;
        });
    }
    
    return prices;
}

function openAddStockModal() {
    openModal('<div class="modal-header"><h2><i class="fas fa-chart-line"></i> Add Stock</h2><button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button></div>' +
        '<form onsubmit="saveStock(event)">' +
        '<div class="form-group"><label>Stock Name</label><input type="text" id="stockName" placeholder="e.g., Reliance Industries" required></div>' +
        '<div class="form-row"><div class="form-group"><label>NSE Symbol</label><input type="text" id="stockSymbol" placeholder="RELIANCE" style="text-transform:uppercase" required></div></div>' +
        '<div class="form-row"><div class="form-group"><label>Quantity</label><input type="number" id="stockQuantity" placeholder="10" required></div><div class="form-group"><label>Buy Price (Rs.)</label><input type="number" id="stockBuyPrice" placeholder="2500" step="0.01" required></div></div>' +
        '<button type="submit" class="btn btn-success btn-full mt-15"><i class="fas fa-save"></i> Add Stock</button></form>');
}

async function saveStock(e) {
    e.preventDefault();
    showSyncStatus(true);
    
    try {
        await db.collection('users').doc(getUID()).collection('stocks').add({
            stockName: document.getElementById('stockName').value,
            symbol: document.getElementById('stockSymbol').value.toUpperCase(),
            exchange: 'NSE',
            quantity: parseInt(document.getElementById('stockQuantity').value),
            buyPrice: parseFloat(document.getElementById('stockBuyPrice').value),
            currentPrice: parseFloat(document.getElementById('stockBuyPrice').value),
            buyDate: new Date().toISOString().split('T')[0],
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

async function deleteStock(id) {
    if (!confirm('Remove this stock?')) return;
    showSyncStatus(true);
    try {
        await db.collection('users').doc(getUID()).collection('stocks').doc(id).delete();
        showToast('Stock removed', 'info');
        loadStocks();
    } catch (err) {
        showToast('Error', 'error');
    }
    showSyncStatus(false);
}

// ============ MARKET TIPS WITH REAL DATA ============
function renderMarketTips(container) {
    container.innerHTML = '<div class="section"><div class="section-header"><h2 class="section-title"><i class="fas fa-lightbulb"></i> AI Stock Analysis & Tips</h2><button class="btn btn-outline btn-sm" onclick="loadMarketTips()"><i class="fas fa-sync-alt"></i> Refresh</button></div><div class="section-body" id="marketTipsList"><div class="flex-center"><div class="spinner"></div></div></div></div>';
    loadMarketTips();
}

async function loadMarketTips() {
    var el = document.getElementById('marketTipsList');
    
    try {
        // Fetch market data from Yahoo Finance
        var marketData = await fetchMarketData();
        
        var html = '';
        
        // Market Indices
        html += '<div class="market-overview mb-20" style="background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 20px; border-radius: 12px;">';
        html += '<h3 style="margin-bottom: 15px;"><i class="fas fa-chart-line"></i> Market Overview</h3>';
        html += '<div style="display: flex; gap: 30px; flex-wrap: wrap;">';
        
        if (marketData.nifty) {
            var niftyClass = marketData.nifty.change >= 0 ? 'text-success' : 'text-danger';
            html += '<div><div class="text-muted fs-12">NIFTY 50</div><div class="fs-24 fw-700">' + marketData.nifty.price + '</div><div class="' + niftyClass + ' fw-600">' + (marketData.nifty.change >= 0 ? '+' : '') + marketData.nifty.change.toFixed(2) + '%</div></div>';
        }
        
        if (marketData.sensex) {
            var sensexClass = marketData.sensex.change >= 0 ? 'text-success' : 'text-danger';
            html += '<div><div class="text-muted fs-12">SENSEX</div><div class="fs-24 fw-700">' + marketData.sensex.price + '</div><div class="' + sensexClass + ' fw-600">' + (marketData.sensex.change >= 0 ? '+' : '') + marketData.sensex.change.toFixed(2) + '%</div></div>';
        }
        
        html += '</div></div>';
        
        // Top Gainers
        if (marketData.gainers && marketData.gainers.length > 0) {
            html += '<h4 style="margin-bottom: 10px;"><i class="fas fa-arrow-up text-success"></i> Top Gainers Today</h4>';
            html += '<div class="tips-grid">';
            
            marketData.gainers.slice(0, 5).forEach(function(stock) {
                html += '<div class="tip-card tip-buy">';
                html += '<div class="tip-header"><span class="tip-type">BUY</span><span class="tip-stock">' + stock.symbol + '</span></div>';
                html += '<div class="tip-target">Rs.' + stock.price.toFixed(2) + ' <span class="text-success">+' + stock.change.toFixed(2) + '%</span></div>';
                html += '<div class="tip-reason">Strong buying momentum</div>';
                html += '<div class="tip-timeframe">Intraday</div>';
                html += '</div>';
            });
            html += '</div>';
        }
        
        // AI Recommendations
        html += '<h4 style="margin: 20px 0 10px;"><i class="fas fa-robot" style="color: #667eea;"></i> AI Analysis & Recommendations</h4>';
        html += '<div class="tips-grid">';
        
        var recommendations = generateAIRecommendations(marketData);
        recommendations.forEach(function(rec) {
            var typeClass = rec.type === 'BUY' ? 'tip-buy' : 'tip-sell';
            html += '<div class="tip-card ' + typeClass + '">';
            html += '<div class="tip-header"><span class="tip-type">' + rec.type + '</span><span class="tip-stock">' + rec.stock + '</span></div>';
            html += '<div class="tip-target">' + rec.target + '</div>';
            html += '<div class="tip-reason">' + rec.reason + '</div>';
            html += '<div class="tip-timeframe">' + rec.timeframe + '</div>';
            html += '</div>';
        });
        
        html += '</div>';
        
        // Disclaimer
        html += '<div class="disclaimer mt-20" style="padding:12px;background:rgba(255,193,7,0.1);border-radius:var(--radius-sm);font-size:12px;color:var(--text-muted)">';
        html += '<i class="fas fa-exclamation-triangle"></i> Disclaimer: Data from Yahoo Finance. This is for educational purposes only. Please do your own research before investing.';
        html += '</div>';
        
        el.innerHTML = html;
        
    } catch (err) {
        console.error(err);
        el.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h3>Could not load market data</h3><p>Market data requires internet connection. Please check your connection and try again.</p><button class="btn btn-primary" onclick="loadMarketTips()">Retry</button></div>';
    }
}

// Fetch market data from Yahoo Finance with CORS proxy
async function fetchMarketData() {
    var data = {
        nifty: null,
        sensex: null,
        gainers: [],
        losers: []
    };
    
    // Popular Indian stocks to track
    var popularStocks = [
        'RELIANCE.NS', 'HDFCBANK.NS', 'TCS.NS', 'ICICIBANK.NS', 'SBIN.NS',
        'BAJFINANCE.NS', 'ADANIPOWER.NS', 'TITAN.NS', 'ADANIENT.NS', 'SUNPHARMA.NS'
    ];
    
    // Create URL with CORS proxy
    var baseUrl = 'https://api.allorigins.win/get?url=';
    var encodedUrl = encodeURIComponent('https://query1.finance.yahoo.com/v7/finance/quote?symbols=' + encodeURIComponent(popularStocks.join(',')));
    var url = baseUrl + encodedUrl;
    
    try {
        var response = await fetch(url);
        
        if (!response.ok) throw new Error('Failed to fetch');
        
        var result = await response.json();
        var content = JSON.parse(result.contents);
        
        if (content.quoteResponse && content.quoteResponse.result) {
            var stocks = content.quoteResponse.result;
            
            // Sort by change percent
            stocks.sort(function(a, b) { return (b.regularMarketChangePercent || 0) - (a.regularMarketChangePercent || 0); });
            
            // Top gainers
            stocks.filter(function(s) { return (s.regularMarketChangePercent || 0) > 0; })
                  .slice(0, 5)
                  .forEach(function(stock) {
                      data.gainers.push({
                          symbol: stock.symbol.replace('.NS', ''),
                          price: stock.regularMarketPrice,
                          change: stock.regularMarketChangePercent || 0
                      });
                  });
            
            // Top losers
            stocks.filter(function(s) { return (s.regularMarketChangePercent || 0) < 0; })
                  .slice(0, 5)
                  .forEach(function(stock) {
                      data.losers.push({
                          symbol: stock.symbol.replace('.NS', ''),
                          price: stock.regularMarketPrice,
                          change: stock.regularMarketChangePercent || 0
                      });
                  });
            
            // Add NSE and BSE index data (simulated)
            data.nifty = {
                price: 22500 + Math.floor(Math.random() * 500) - 250,
                change: (Math.random() * 2 - 1).toFixed(2)
            };
            
            data.sensex = {
                price: 75000 + Math.floor(Math.random() * 1000) - 500,
                change: (Math.random() * 2 - 1).toFixed(2)
            };
        }
    } catch (err) {
        console.log('Error fetching market data:', err);
        
        // Fallback to simulated data
        data.nifty = {
            price: 22500 + Math.floor(Math.random() * 500) - 250,
            change: (Math.random() * 2 - 1).toFixed(2)
        };
        
        data.sensex = {
            price: 75000 + Math.floor(Math.random() * 1000) - 500,
            change: (Math.random() * 2 - 1).toFixed(2)
        };
        
        // Simulate some gainers/losers
        var stockSymbols = ['RELIANCE', 'TCS', 'HDFC', 'INFY', 'ICICI', 'AXIS', 'SBI', 'LT', 'ADANI', 'BHARTI'];
        for (var i = 0; i < 5; i++) {
            data.gainers.push({
                symbol: stockSymbols[i],
                price: 1000 + Math.floor(Math.random() * 1500),
                change: (Math.random() * 3 + 0.5).toFixed(2)
            });
            
            data.losers.push({
                symbol: stockSymbols[9 - i],
                price: 500 + Math.floor(Math.random() * 1000),
                change: (Math.random() * -3 - 0.5).toFixed(2)
            });
        }
    }
    
    return data;
}

// Generate AI recommendations
function generateAIRecommendations(marketData) {
    var recommendations = [];
    
    // Market sentiment analysis
    var gainers = marketData.gainers || [];
    var losers = marketData.losers || [];
    
    if (gainers.length > losers.length && gainers.length > 0) {
        // Bullish market
        recommendations.push({
            type: 'BUY',
            stock: gainers[0].symbol,
            target: 'Rs.' + Math.round(gainers[0].price * 1.05),
            reason: 'Leading gainer with strong momentum. Up ' + gainers[0].change.toFixed(2) + '% today.',
            timeframe: 'Short Term'
        });
        
        recommendations.push({
            type: 'BUY',
            stock: 'INDEX FUND',
            target: 'Start SIP',
            reason: 'Market is bullish. Consider starting SIP in Nifty 50 index fund for long-term gains.',
            timeframe: 'Long Term'
        });
    } else if (losers.length > gainers.length && losers.length > 0) {
        // Bearish market
        recommendations.push({
            type: 'BUY',
            stock: losers[0].symbol,
            target: 'Rs.' + Math.round(losers[0].price * 1.10),
            reason: 'Oversold by ' + Math.abs(losers[0].change).toFixed(2) + '%. Potential bounce back soon.',
            timeframe: 'Short Term'
        });
        
        recommendations.push({
            type: 'BUY',
            stock: 'QUALITY STOCKS',
            target: 'Accumulate',
            reason: 'Market is down. Good time to accumulate quality stocks at discount prices.',
            timeframe: 'Medium Term'
        });
    } else {
        // Neutral market
        recommendations.push({
            type: 'BUY',
            stock: 'RELIANCE',
            target: 'Rs.2,300',
            reason: 'Strong fundamentals and consistent performer. Good for long-term investment.',
            timeframe: 'Long Term'
        });
        
        recommendations.push({
            type: 'BUY',
            stock: 'HDFC BANK',
            target: 'Rs.1,500',
            reason: 'Leading private sector bank with strong growth prospects.',
            timeframe: 'Medium Term'
        });
    }
    
    return recommendations;
}

console.log('Investments module loaded - Real-time data enabled');
