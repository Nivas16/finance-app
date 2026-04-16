// ============================================
// AI FINANCIAL ADVISOR MODULE
// ============================================

let aiChatHistory = [];

function renderAIAdvisor(container) {
    container.innerHTML = `
        <div class="ai-chat">
            <div class="ai-chat-header">
                <div class="ai-avatar">ðŸ¤–</div>
                <div>
                    <div class="fw-700">AI Financial Advisor</div>
                    <div class="fs-12" style="opacity:0.8">Personalized advice based on your data</div>
                </div>
            </div>
            <div class="ai-chat-messages" id="aiMessages">
                <!-- Messages load here -->
            </div>
            <div class="ai-suggestion-chips" id="aiChips">
                <button class="ai-chip" onclick="askAI('Where should I save money?')">ðŸ’° Where to save?</button>
                <button class="ai-chip" onclick="askAI('How to reduce my loans faster?')">ðŸ“‰ Reduce loans</button>
                <button class="ai-chip" onclick="askAI('Am I spending too much?')">ðŸ¤” Am I overspending?</button>
                <button class="ai-chip" onclick="askAI('When will all my loans close?')">ðŸ“… Loan closure date</button>
                <button class="ai-chip" onclick="askAI('Give me a monthly budget plan')">ðŸ“Š Budget plan</button>
                <button class="ai-chip" onclick="askAI('What expenses can I cut?')">âœ‚ï¸ Cut expenses</button>
                <button class="ai-chip" onclick="askAI('Investment suggestions for beginners')">ðŸ“ˆ Investments</button>
                <button class="ai-chip" onclick="askAI('Emergency fund advice')">ðŸ†˜ Emergency fund</button>
            </div>
            <div class="ai-input-area">
                <input type="text" id="aiInput" placeholder="Ask me anything about your finances..." 
                       onkeypress="if(event.key==='Enter')askAI()">
                <button class="btn btn-primary" onclick="askAI()">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>
    `;
    
    // Initial greeting
    addAIMessage('bot', `ðŸ‘‹ Hello! I'm your **AI Financial Advisor**. I've analyzed your financial data and I'm ready to help you with:

â€¢ ðŸ’° **Saving strategies** - Where to put your money
â€¢ ðŸ“‰ **Loan reduction** - How to close loans faster  
â€¢ ðŸ›’ **Purchase decisions** - Buy now or wait?
â€¢ ðŸ“Š **Budget planning** - Optimize your spending
â€¢ ðŸ“ˆ **Investment tips** - Grow your wealth

Ask me anything or tap a suggestion below!`);
}

function addAIMessage(role, text) {
    const messagesEl = document.getElementById('aiMessages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `ai-message ${role}`;
    
    // Simple markdown-like formatting
    let formattedText = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>')
        .replace(/â€¢ /g, '&bull; ');
    
    msgDiv.innerHTML = `
        <div class="ai-message-avatar">${role === 'bot' ? 'ðŸ¤–' : 'ðŸ‘¤'}</div>
        <div class="ai-message-bubble">${formattedText}</div>
    `;
    
    messagesEl.appendChild(msgDiv);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    
    aiChatHistory.push({ role, text });
}

async function askAI(predefinedQuestion) {
    const input = document.getElementById('aiInput');
    const question = predefinedQuestion || input.value.trim();
    
    if (!question) return;
    
    // Add user message
    addAIMessage('user', question);
    input.value = '';
    
    // Show typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.className = 'ai-message bot';
    typingDiv.id = 'aiTyping';
    typingDiv.innerHTML = `
        <div class="ai-message-avatar">ðŸ¤–</div>
        <div class="ai-message-bubble"><div class="spinner"></div> Analyzing your finances...</div>
    `;
    document.getElementById('aiMessages').appendChild(typingDiv);
    
    // Get financial data
    const data = await getAllFinancialData(getUID());
    
    // Generate AI response
    setTimeout(() => {
        typingDiv.remove();
        const response = generateAIResponse(question, data);
        addAIMessage('bot', response);
    }, 1000 + Math.random() * 1000);
}

function generateAIResponse(question, data) {
    const q = question.toLowerCase();
    const balance = data.balance;
    const income = data.totalIncome;
    const expenses = data.totalExpenses;
    const totalEMI = data.bankEMI + data.personalEMI + data.installments;
    const savingsRate = income > 0 ? Math.round((balance / income) * 100) : 0;
    const emiRatio = income > 0 ? Math.round((totalEMI / income) * 100) : 0;
    
    // Where to save money
    if (q.includes('save') || q.includes('saving') || q.includes('invest')) {
        if (balance <= 0) {
            return `âš ï¸ **Alert: You're spending more than you earn!**

Before thinking about saving, you need to:

1. **Cut non-essential expenses** immediately
2. **Negotiate lower EMIs** where possible
3. **Find additional income sources**

Your current deficit is **${formatCurrency(Math.abs(balance))}**. 

Focus on reducing expenses by at least **${formatCurrency(Math.abs(balance) + 5000)}** to start saving.`;
        }
        
        const emergencyFund = income * 6;
        return `ðŸ“Š **Your Savings Analysis:**

Monthly surplus: **${formatCurrency(balance)}** (${savingsRate}% of income)

**Recommended allocation of ${formatCurrency(balance)}:**

ðŸ†˜ **Emergency Fund (30%):** ${formatCurrency(balance * 0.3)}/mo
â†’ Target: ${formatCurrency(emergencyFund)} (6 months expenses)
â†’ Keep in: High-yield savings account or Liquid Fund

ðŸ“ˆ **SIP / Mutual Funds (40%):** ${formatCurrency(balance * 0.4)}/mo
â†’ Start with index funds (Nifty 50/Sensex)
â†’ Apps: Groww, Zerodha, Kuvera

ðŸ¦ **Fixed Deposit / RD (20%):** ${formatCurrency(balance * 0.2)}/mo
â†’ Safe returns 6-7% p.a.
â†’ Use for goals < 2 years

ðŸŽ¯ **Personal Goals (10%):** ${formatCurrency(balance * 0.1)}/mo
â†’ Vacation, gadgets, learning

${savingsRate >= 30 ? 'ðŸŒŸ **Great job!** You\'re saving well. Keep it up!' : 
  savingsRate >= 15 ? 'ðŸ‘ **Good start!** Try to increase to 30% savings rate.' : 
  'âš ï¸ **Needs improvement.** Cut unnecessary expenses to save more.'}`;
    }
    
    // Reduce loans
    if (q.includes('loan') && (q.includes('reduce') || q.includes('close') || q.includes('faster') || q.includes('pay'))) {
        let loanAdvice = `ðŸ“‰ **Loan Reduction Strategy:**\n\n`;
        
        // Sort loans by interest rate (highest first - avalanche method)
        const allLoans = [
            ...data.bankEMIs.map(e => ({ ...e, category: 'Bank' })),
            ...data.personalEMIs.map(e => ({ ...e, interestRate: 0, category: 'Personal' })),
            ...data.installmentList.map(e => ({ ...e, interestRate: 0, category: 'Installment' }))
        ].sort((a, b) => (b.interestRate || 0) - (a.interestRate || 0));
        
        if (allLoans.length === 0) {
            return 'ðŸŽ‰ **Congratulations! You have no loans!** You\'re debt-free. Focus on building wealth through investments.';
        }
        
        loanAdvice += `You have **${allLoans.length} active loans** with total EMI of **${formatCurrency(totalEMI)}/mo**\n\n`;
        loanAdvice += `**ðŸ”¥ Debt Avalanche Strategy (Recommended):**\n`;
        loanAdvice += `Pay minimum on all loans, but put extra money towards the highest interest rate loan first.\n\n`;
        
        loanAdvice += `**Priority Order:**\n`;
        allLoans.forEach((loan, i) => {
            const remaining = ((loan.totalEMIs || 0) - (loan.paidEMIs || 0)) * (loan.emiAmount || 0);
            loanAdvice += `${i + 1}. **${loan.bankName || loan.personName || loan.name}** - ${loan.interestRate || 0}% interest - ${formatCurrency(remaining)} remaining\n`;
        });
        
        if (balance > 0) {
            loanAdvice += `\nðŸ’¡ **Tip:** You have **${formatCurrency(balance)}** surplus. Put **${formatCurrency(balance * 0.5)}** extra towards your highest-interest loan each month to close it faster!`;
        }
        
        // Estimate closure
        const totalRemaining = allLoans.reduce((s, l) => s + ((l.totalEMIs || 0) - (l.paidEMIs || 0)) * (l.emiAmount || 0), 0);
        const monthsToFree = totalEMI > 0 ? Math.ceil(totalRemaining / totalEMI) : 0;
        
        loanAdvice += `\n\nðŸ“… **Estimated debt-free date:** ~${monthsToFree} months (${new Date(Date.now() + monthsToFree * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })})`;
        
        return loanAdvice;
    }
    
    // When will loans close
    if (q.includes('when') && (q.includes('close') || q.includes('free') || q.includes('finish'))) {
        let response = `ðŸ“… **Loan Closure Timeline:**\n\n`;
        
        const allLoans = [
            ...data.bankEMIs.map(e => ({ ...e, type: 'ðŸ¦ Bank' })),
            ...data.personalEMIs.map(e => ({ ...e, type: 'ðŸ¤ Personal', bankName: e.personName })),
            ...data.installmentList.map(e => ({ ...e, type: 'ðŸ¢ Installment', bankName: e.name }))
        ];
        
        if (allLoans.length === 0) {
            return 'ðŸŽ‰ **You have no active loans!** You\'re already debt-free!';
        }
        
        allLoans.forEach(loan => {
            const remaining = (loan.totalEMIs || 0) - (loan.paidEMIs || 0);
            const closureDate = new Date();
            closureDate.setMonth(closureDate.getMonth() + remaining);
            
            response += `${loan.type} **${loan.bankName || 'Loan'}**\n`;
            response += `â†’ ${remaining} EMIs left (${formatCurrency(loan.emiAmount)}/mo)\n`;
            response += `â†’ Closes: **${closureDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}**\n\n`;
        });
        
        return response;
    }
    
    // Am I spending too much
    if (q.includes('spending') || q.includes('overspend') || q.includes('too much')) {
        let response = `ðŸ” **Spending Analysis:**\n\n`;
        response += `**Income:** ${formatCurrency(income)}\n`;
        response += `**Total Outflow:** ${formatCurrency(expenses)} (${income > 0 ? Math.round((expenses/income)*100) : 0}%)\n`;
        response += `**Balance:** ${formatCurrency(balance)}\n\n`;
        
        const rules = [
            { name: 'EMIs', amount: totalEMI, ideal: 30, actual: emiRatio },
            { name: 'Rent', amount: data.rent, ideal: 30, actual: income > 0 ? Math.round((data.rent/income)*100) : 0 },
            { name: 'Bills', amount: data.bills, ideal: 10, actual: income > 0 ? Math.round((data.bills/income)*100) : 0 },
            { name: 'Expenses', amount: data.otherExpenses, ideal: 15, actual: income > 0 ? Math.round((data.otherExpenses/income)*100) : 0 }
        ];
        
        response += `**Category Analysis (% of income):**\n`;
        rules.forEach(r => {
            const status = r.actual <= r.ideal ? 'âœ…' : r.actual <= r.ideal * 1.5 ? 'âš ï¸' : 'ðŸš¨';
            response += `${status} **${r.name}:** ${r.actual}% (ideal: <${r.ideal}%) - ${formatCurrency(r.amount)}\n`;
        });
        
        if (savingsRate < 10) {
            response += `\nðŸš¨ **Warning:** Very low savings! You need to cut at least **${formatCurrency(income * 0.2 - balance)}** from expenses.`;
        } else if (savingsRate < 20) {
            response += `\nâš ï¸ **Caution:** Savings below recommended 20%. Review non-essential spending.`;
        } else {
            response += `\nâœ… **Good!** Your savings rate of ${savingsRate}% is healthy.`;
        }
        
        return response;
    }
    
    // Budget plan
    if (q.includes('budget') || q.includes('plan')) {
        const ideal = {
            needs: Math.round(income * 0.5),
            wants: Math.round(income * 0.3),
            savings: Math.round(income * 0.2)
        };
        
        return `ðŸ“Š **Monthly Budget Plan (50/30/20 Rule):**

Based on your income of **${formatCurrency(income)}**:

**ðŸ  Needs (50%) - ${formatCurrency(ideal.needs)}:**
â€¢ Rent: ${formatCurrency(Math.min(data.rent, ideal.needs * 0.6))}
â€¢ EMIs: ${formatCurrency(totalEMI)}
â€¢ Bills: ${formatCurrency(data.bills)}
â€¢ Groceries & essentials

**ðŸŽ¯ Wants (30%) - ${formatCurrency(ideal.wants)}:**
â€¢ Dining out
â€¢ Entertainment
â€¢ Shopping
â€¢ Subscriptions

**ðŸ’° Savings (20%) - ${formatCurrency(ideal.savings)}:**
â€¢ Emergency fund: ${formatCurrency(ideal.savings * 0.3)}
â€¢ Investments: ${formatCurrency(ideal.savings * 0.5)}
â€¢ Goals: ${formatCurrency(ideal.savings * 0.2)}

**Your Current Reality:**
â€¢ Needs: ${formatCurrency(totalEMI + data.bills + data.rent)} (${income > 0 ? Math.round(((totalEMI + data.bills + data.rent)/income)*100) : 0}%)
â€¢ Other: ${formatCurrency(data.otherExpenses)} (${income > 0 ? Math.round((data.otherExpenses/income)*100) : 0}%)
â€¢ Savings: ${formatCurrency(Math.max(0, balance))} (${Math.max(0, savingsRate)}%)

${savingsRate >= 20 ? 'âœ… You\'re meeting the 20% savings target!' : `âš ï¸ You need to save ${formatCurrency(ideal.savings - Math.max(0, balance))} more to hit 20% target.`}`;
    }
    
    // Cut expenses
    if (q.includes('cut') || q.includes('reduce expense') || q.includes('expense')) {
        return `âœ‚ï¸ **Expense Cutting Tips:**

**Quick Wins (Save ${formatCurrency(income * 0.05)}-${formatCurrency(income * 0.1)}/month):**

1. ðŸ” **Cook at home** - Save 40-60% on food
2. ðŸ“± **Audit subscriptions** - Cancel unused ones
3. â˜• **Reduce daily small expenses** - â‚¹50-100/day adds up!
4. ðŸš— **Use public transport** 2-3 days/week
5. ðŸ›’ **Buy groceries in bulk** monthly

**Medium Impact:**
6. ðŸ’¡ **Reduce electricity** - LED bulbs, AC optimization
7. ðŸ“ž **Switch to cheaper phone plan**
8. ðŸ  **Negotiate rent** at renewal
9. ðŸŽ¬ **Free entertainment** - parks, libraries, free events
10. ðŸ›ï¸ **30-day rule** - Wait 30 days before non-essential purchases

**Big Moves:**
11. ðŸ  **Get a roommate** - Cut rent 50%
12. ðŸ’³ **Balance transfer** loans to lower interest
13. ðŸš— **Sell unused vehicle** - Save insurance + fuel
14. ðŸ“š **DIY learning** instead of paid courses

Your biggest expense categories to target:
${data.rent > totalEMI ? 'â€¢ **Rent** is your biggest cost - consider alternatives' : 'â€¢ **EMIs** are heavy - focus on closing high-interest ones first'}
${data.otherExpenses > income * 0.15 ? 'â€¢ **Other expenses** seem high - track daily spending' : ''}`;
    }
    
    // Investment suggestions
    if (q.includes('invest')) {
        return `ðŸ“ˆ **Investment Guide for Beginners:**

**Step 1: Emergency Fund First**
â†’ Save 3-6 months expenses (${formatCurrency(expenses * 6)})
â†’ Keep in: Savings account or Liquid Mutual Fund

**Step 2: Start Small SIPs**
â†’ Even â‚¹500/month grows over time
â†’ Best for beginners: **Index Funds** (Nifty 50)

**Step 3: Diversify Gradually**

| Risk Level | Option | Expected Return |
|------------|--------|----------------|
| Low | FD/RD | 6-7% p.a. |
| Low | PPF | 7.1% p.a. |
| Medium | Debt Mutual Funds | 7-9% p.a. |
| Medium-High | Equity Mutual Funds | 12-15% p.a. |
| High | Direct Stocks | Variable |

**Recommended for You:**
${balance > 10000 ? 
`â€¢ Start SIP of **${formatCurrency(Math.round(balance * 0.4 / 500) * 500)}** in Nifty 50 Index Fund
â€¢ RD of **${formatCurrency(Math.round(balance * 0.2 / 500) * 500)}** for safety` :
`â€¢ Focus on building emergency fund first
â€¢ Start with â‚¹500-1000 SIP when possible`}

**Apps:** Groww, Zerodha Coin, Kuvera, Paytm Money`;
    }
    
    // Emergency fund
    if (q.includes('emergency')) {
        const target = expenses * 6;
        return `ðŸ†˜ **Emergency Fund Guide:**

**Why?** Unexpected job loss, medical emergency, or major repair

**Target:** ${formatCurrency(target)} (6 months of expenses)

**How to build it:**
â€¢ Save **${formatCurrency(Math.round(balance * 0.3))}** monthly from your surplus
â€¢ Time to reach target: ~${balance > 0 ? Math.ceil(target / (balance * 0.3)) : 'âˆž'} months

**Where to keep it:**
1. **Savings Account** - Instant access, 3-4% interest
2. **Liquid Mutual Fund** - 1-day withdrawal, 5-6% returns
3. **Short-term FD** - Break if needed, 6-7% returns

**Rules:**
â€¢ âŒ Don't invest emergency fund in stocks
â€¢ âŒ Don't use it for wants/desires
â€¢ âœ… Only for genuine emergencies
â€¢ âœ… Replenish immediately after using`;
    }
    
    // Default helpful response
    return `ðŸ¤” I understand your question about "${question}". Here's what I can tell you based on your finances:

**Your Financial Snapshot:**
â€¢ Income: ${formatCurrency(income)}
â€¢ Total Obligations: ${formatCurrency(expenses)}
â€¢ Free Cash: ${formatCurrency(balance)}
â€¢ Health Score: ${savingsRate >= 20 ? 'ðŸŸ¢ Good' : savingsRate >= 10 ? 'ðŸŸ¡ Fair' : 'ðŸ”´ Needs Work'}

**Try asking me about:**
â€¢ "Where should I save money?"
â€¢ "How to reduce loans faster?"
â€¢ "Give me a budget plan"
â€¢ "When will my loans close?"
â€¢ "What expenses can I cut?"
â€¢ "Investment suggestions"

I'm here to help you achieve financial freedom! ðŸ’ª`;
}
