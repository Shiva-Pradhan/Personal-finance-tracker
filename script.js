const STORAGE_KEY = "financeData";
const INCOME_KEY = "monthlyIncome";
const CURRENCY_KEY = "currency";
const THEME_KEY = "theme";
const BUDGET_KEY = "financeBudgets";
const GOAL_KEY = "financeGoals";

let transactions = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let monthlyIncome = Number(localStorage.getItem(INCOME_KEY)) || 0;
let currency = localStorage.getItem(CURRENCY_KEY) || "₹";
let budgets = JSON.parse(localStorage.getItem(BUDGET_KEY)) || {};
let goals = JSON.parse(localStorage.getItem(GOAL_KEY)) || [];

let expenseChart = null;
let trendChart = null;

function saveAll() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    localStorage.setItem(INCOME_KEY, monthlyIncome.toString());
    localStorage.setItem(CURRENCY_KEY, currency);
    localStorage.setItem(BUDGET_KEY, JSON.stringify(budgets));
    localStorage.setItem(GOAL_KEY, JSON.stringify(goals));
}

function formatCurrency(value) {
    return `${currency}${Number(value).toFixed(2)}`;
}

function generateId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

// Fixed Real-Time Income Sync Engine
document.getElementById("saveIncomeBtn").addEventListener("click", function() {
    const inputField = document.getElementById("monthlyIncome");
    monthlyIncome = Number(inputField.value) || 0;
    saveAll();
    render(); // Instantly triggers total income recalculation across dashboards
    inputField.value = monthlyIncome;
});

// Clear Button Logic: Clears everything instantly
document.getElementById("clearAllBtn").addEventListener("click", function() {
    if(confirm("Are you absolutely sure you want to delete all metrics, budgets, goals, and history?")) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(INCOME_KEY);
        localStorage.removeItem(CURRENCY_KEY);
        localStorage.removeItem(BUDGET_KEY);
        localStorage.removeItem(GOAL_KEY);
        localStorage.removeItem(THEME_KEY);
        transactions = [];
        monthlyIncome = 0;
        budgets = {};
        goals = [];
        document.getElementById("monthlyIncome").value = "";
        saveAll();
        render();
    }
});

// Transaction Controller
document.getElementById("transactionForm").addEventListener("submit", function(e) {
    e.preventDefault();
    const category = document.getElementById("category").value;
    const type = document.getElementById("type").value;
    const amount = Number(document.getElementById("amount").value) || 0;

    if (type === "expense" && budgets[category]) {
        let currentSpent = transactions
            .filter(item => item.type === "expense" && item.category === category)
            .reduce((sum, item) => sum + Number(item.amount), 0);
        
        if ((currentSpent + amount) > budgets[category]) {
            alert(`⚠️ Warning: Budget exceeded for "${category}"!`);
        }
    }
    
    const transaction = {
        id: generateId(),
        date: document.getElementById("date").value,
        description: document.getElementById("description").value,
        category: category,
        type: type,
        amount: amount,
        recurring: document.getElementById("recurring").checked
    };

    transactions.push(transaction);
    saveAll();
    render();
    
    document.getElementById("description").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("recurring").checked = false;
    document.getElementById("date").value = new Date().toISOString().split('T')[0];
});

window.deleteTransaction = function(id) {
    transactions = transactions.filter(x => x.id !== id);
    saveAll();
    render();
};

document.getElementById("budgetForm").addEventListener("submit", function(e) {
    e.preventDefault();
    const cat = document.getElementById("budgetCategory").value;
    const amt = Number(document.getElementById("budgetAmount").value) || 0;
    budgets[cat] = amt;
    saveAll();
    render();
    document.getElementById("budgetAmount").value = "";
});

document.getElementById("goalForm").addEventListener("submit", function(e) {
    e.preventDefault();
    const name = document.getElementById("goalName").value;
    const target = Number(document.getElementById("goalTarget").value) || 0;
    goals.push({ id: generateId(), name: name, target: target });
    saveAll();
    render();
    document.getElementById("goalName").value = "";
    document.getElementById("goalTarget").value = "";
});

window.deleteGoal = function(id) {
    goals = goals.filter(g => g.id !== id);
    saveAll();
    render();
};

// Math Matrix Calculations Engine
let globalCalculatedBalance = 0;
function updateDashboard() {
    let totalIncomeCalculated = Number(monthlyIncome); 
    let totalExpenseCalculated = 0;

    transactions.forEach(item => {
        if (item.type === "income") totalIncomeCalculated += Number(item.amount);
        else if (item.type === "expense") totalExpenseCalculated += Number(item.amount);
    });

    globalCalculatedBalance = totalIncomeCalculated - totalExpenseCalculated;

    document.getElementById("totalIncomeDisplay").textContent = formatCurrency(totalIncomeCalculated);
    document.getElementById("totalExpenseDisplay").textContent = formatCurrency(totalExpenseCalculated);
    document.getElementById("netBalanceDisplay").textContent = formatCurrency(globalCalculatedBalance);
}

function renderBudgetsAndGoals() {
    const budgetContainer = document.getElementById("budgetStatusContainer");
    budgetContainer.innerHTML = "";
    if (Object.keys(budgets).length === 0) {
        budgetContainer.innerHTML = `<p style="color:var(--secondary); font-size:14px;">No budget constraints set.</p>`;
    }
    Object.entries(budgets).forEach(([category, limit]) => {
        let spent = transactions
            .filter(item => item.type === "expense" && item.category === category)
            .reduce((sum, item) => sum + Number(item.amount), 0);
        let percent = Math.min((spent / limit) * 100, 100).toFixed(0);
        let barColor = percent >= 100 ? "var(--red)" : percent >= 80 ? "var(--orange)" : "var(--green)";
        budgetContainer.innerHTML += `
            <div class="progress-container">
                <div class="progress-info">
                    <span><strong>${category}</strong> (${percent}%)</span>
                    <span>${formatCurrency(spent)} / ${formatCurrency(limit)}</span>
                </div>
                <div class="progress-bar-bg"><div class="progress-bar-fill" style="width: ${percent}%; background-color: ${barColor};"></div></div>
            </div>`;
    });

    const goalsContainer = document.getElementById("goalsContainer");
    goalsContainer.innerHTML = "";
    if (goals.length === 0) {
        goalsContainer.innerHTML = `<p style="color:var(--secondary); font-size:14px;">No active milestones.</p>`;
    }
    let availableSavingsPool = Math.max(0, globalCalculatedBalance);
    goals.forEach(goal => {
        let funded = Math.min(availableSavingsPool, goal.target);
        availableSavingsPool -= funded;
        let percent = Math.min((funded / goal.target) * 100, 100).toFixed(0);
        goalsContainer.innerHTML += `
            <div class="progress-container" style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px;">
                <div class="progress-info">
                    <span><strong>${goal.name}</strong> (${percent}%)</span>
                    <button onclick="deleteGoal(${goal.id})" style="padding:2px 6px; font-size:11px;" class="btn-danger">Wipe</button>
                </div>
                <div class="progress-info" style="margin-top:2px; font-size:12px; color:var(--secondary);">
                    <span>Funded: ${formatCurrency(funded)} / Target: ${formatCurrency(goal.target)}</span>
                </div>
                <div class="progress-bar-bg" style="margin-top:5px;"><div class="progress-bar-fill" style="width: ${percent}%; background-color: var(--blue);"></div></div>
            </div>`;
    });
}

function renderTransactions() {
    const tbody = document.getElementById("transactionList");
    if (!tbody) return;
    tbody.innerHTML = "";
    const search = (document.getElementById("searchInput").value || "").toLowerCase();
    const filter = document.getElementById("filterType").value;
    const filtered = transactions.filter(item => {
        return item.description.toLowerCase().includes(search) && (filter === "all" || item.type === filter);
    });
    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6">No Transactions Found</td></tr>`;
        return;
    }
    filtered.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.date}</td>
            <td>${item.description}</td>
            <td>${item.category}</td>
            <td style="color: ${item.type === 'income' ? 'var(--green)' : 'var(--red)'};">${item.type}</td>
            <td>${formatCurrency(item.amount)}</td>
            <td><button class="delete-btn" onclick="deleteTransaction(${item.id})">Delete</button></td>`;
        tbody.appendChild(row);
    });
}

function renderCharts() {
    const canvasExp = document.getElementById("expenseChart");
    if (canvasExp) {
        if (expenseChart) expenseChart.destroy();
        let dataObj = {};
        transactions.filter(x => x.type === "expense").forEach(item => {
            dataObj[item.category] = (dataObj[item.category] || 0) + Number(item.amount);
        });
        const labels = Object.keys(dataObj).length ? Object.keys(dataObj) : ["No Expenses"];
        const datasetData = Object.values(dataObj).length ? Object.values(dataObj) : [1];
        expenseChart = new Chart(canvasExp, {
            type: "doughnut",
            data: { labels: labels, datasets: [{ data: datasetData, backgroundColor: ['#e74c3c', '#3498db', '#f1c40f', '#9b59b6', '#1abc9c'] }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'Expense Metrics', color: '#fff' } } }
        });
    }

    const canvasTrend = document.getElementById("trendChart");
    if (canvasTrend) {
        if (trendChart) trendChart.destroy();
        let monthlyData = {};
        transactions.filter(x => x.type === "expense").forEach(item => {
            const parts = item.date.split("-");
            if(parts.length === 3) {
                const monthName = new Date(parts[0], parts[1] - 1, parts[2]).toLocaleString("default", { month: "short" });
                monthlyData[monthName] = (monthlyData[monthName] || 0) + Number(item.amount);
            }
        });
        const labels = Object.keys(monthlyData).length ? Object.keys(monthlyData) : ["No Data"];
        const datasetData = Object.values(monthlyData).length ? Object.values(monthlyData) : [0];
        trendChart = new Chart(canvasTrend, {
            type: "bar",
            data: { labels: labels, datasets: [{ label: "Expenses Overview", data: datasetData, backgroundColor: '#3498db' }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'Monthly Outflow Analytics', color: '#fff' } } }
        });
    }
}

document.getElementById("exportCsvBtn").addEventListener("click", function() {
    if (transactions.length === 0) { alert("No data to export!"); return; }
    let csvContent = "data:text/csv;charset=utf-8,Date,Description,Category,Type,Amount\n";
    transactions.forEach(t => { csvContent += `${t.date},"${t.description.replace(/"/g, '""')}",${t.category},${t.type},${t.amount}\n`; });
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Financial_Report.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
});

document.getElementById("importCsvFile").addEventListener("change", function(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            const lines = evt.target.result.split("\n");
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                const cols = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
                if(cols.length < 5) continue;
                transactions.push({
                    id: generateId() + i, date: cols[0].trim(),
                    description: cols[1].replace(/^"|"$/g, '').trim(),
                    category: cols[2].trim(), type: cols[3].trim().toLowerCase(),
                    amount: Number(cols[4]) || 0, recurring: false
                });
            }
            saveAll(); render(); alert("Data parsing completed!");
        } catch (err) { alert("File parsing error."); }
    };
    reader.readAsText(file);
});

document.getElementById("searchInput").addEventListener("input", renderTransactions);
document.getElementById("filterType").addEventListener("change", renderTransactions);
document.getElementById("currencySelector").value = currency;
document.getElementById("currencySelector").addEventListener("change", e => { currency = e.target.value; saveAll(); render(); });

const themeToggleBtn = document.getElementById("themeToggle");
themeToggleBtn.onclick = () => {
    document.body.classList.toggle("light");
    const isLight = document.body.classList.contains("light");
    localStorage.setItem(THEME_KEY, isLight);
    themeToggleBtn.textContent = isLight ? "🌙 Dark Mode" : "☀️ Light Mode";
};

function render() { updateDashboard(); renderBudgetsAndGoals(); renderTransactions(); renderCharts(); }

document.getElementById("monthlyIncome").value = monthlyIncome || "";
document.getElementById("date").value = new Date().toISOString().split('T')[0];
render();