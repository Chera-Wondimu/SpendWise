
/* =========================================
   SPENDWISE — ANALYTICS MANAGER
   Chart.js visualizations and spending data
========================================= */

const AnalyticsManager = (() => {

    // 1. CHART INSTANCES

    let spendingChart = null;
    let categoryChart = null;

    // 2. DOM ELEMENTS

    const spendingCanvas = document.getElementById("spendingChart");
    const categoryCanvas = document.getElementById("categoryChart");

    const spendingPeriod = document.getElementById("spendingPeriod");

    const categoryLegend = document.getElementById("categoryLegend");

    const spendingEmpty = document.getElementById("spendingChartEmpty");
    const categoryEmpty = document.getElementById("categoryChartEmpty");

    // 3. CATEGORY COLORS

    const categoryColors = {
        Food: "#8b5cf6",
        Transportation: "#3b82f6",
        Shopping: "#ec4899",
        Bills: "#f59e0b",
        Entertainment: "#14b8a6",
        Health: "#ef4444",
        Education: "#06b6d4",
        Salary: "#22c55e",
        Freelance: "#a78bfa",
        Investment: "#eab308",
        Gift: "#f97316",
        Other: "#94a3b8"
    };

    const fallbackColors = [
        "#8065e9",
        "#3b82f6",
        "#ec4899",
        "#f59e0b",
        "#14b8a6",
        "#ef4444",
        "#06b6d4",
        "#22c55e"
    ];

    // 4. HELPERS

    function getTransactions() {
        return TransactionManager.getAll();
    }

    function formatCurrency(amount) {
        return TransactionManager.formatCurrency(amount);
    }

    function getTextColor() {
        return getComputedStyle(document.documentElement)
            .getPropertyValue("--text-secondary")
            .trim() || "#94a3b8";
    }

    function getBorderColor() {
        return getComputedStyle(document.documentElement)
            .getPropertyValue("--border")
            .trim() || "#293650";
    }

    function getCategoryColor(category, index) {
        return categoryColors[category] ||
            fallbackColors[index % fallbackColors.length];
    }

    function getMonthKey(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    }

    function getDateKey(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    }

    // 5. CHART EMPTY STATES

    function toggleEmptyState(canvas, emptyState, hasData) {
        if (canvas) {
            canvas.style.display = hasData ? "block" : "none";
        }

        if (emptyState) {
            emptyState.hidden = hasData;
        }
    }

    // 6. CHART DEFAULT OPTIONS

    function getChartDefaults() {
        const textColor = getTextColor();
        const borderColor = getBorderColor();

        return {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: false
                },

                tooltip: {
                    backgroundColor: "#151d31",
                    titleColor: "#ffffff",
                    bodyColor: "#dbe4f0",

                    padding: 12,
                    cornerRadius: 9,

                    callbacks: {
                        label(context) {
                            return `${context.dataset.label || context.label}: ${formatCurrency(context.parsed.y ?? context.parsed)}`;
                        }
                    }
                }
            },

            scales: {
                x: {
                    grid: {
                        display: false
                    },

                    ticks: {
                        color: textColor,
                        font: {
                            size: 10
                        }
                    },

                    border: {
                        display: false
                    }
                },

                y: {
                    beginAtZero: true,

                    grid: {
                        color: borderColor,
                        drawTicks: false
                    },

                    ticks: {
                        color: textColor,
                        padding: 10,
                        font: {
                            size: 10
                        },

                        callback(value) {
                            return new Intl.NumberFormat("en-US", {
                                notation: "compact",
                                maximumFractionDigits: 1
                            }).format(value);
                        }
                    },

                    border: {
                        display: false
                    }
                }
            }
        };
    }

    // 7. SPENDING PERIOD DATA

    function getPeriodData(period = "month") {
        const transactions = getTransactions();

        const now = new Date();

        let labels = [];
        let incomeData = [];
        let expenseData = [];

        if (period === "week") {

            // Last seven days
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now);
                date.setHours(0, 0, 0, 0);
                date.setDate(now.getDate() - i);

                const key = getDateKey(date);

                const dailyTransactions = transactions.filter(transaction =>
                    transaction.date === key
                );

                const income = dailyTransactions
                    .filter(transaction => transaction.type === "income")
                    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

                const expenses = dailyTransactions
                    .filter(transaction => transaction.type === "expense")
                    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

                labels.push(date.toLocaleDateString("en-US", {
                    weekday: "short"
                }));

                incomeData.push(income);
                expenseData.push(expenses);
            }

        } else if (period === "year") {

            // Last twelve months
            for (let i = 11; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

                const key = getMonthKey(date);

                const monthlyTransactions = transactions.filter(transaction => {
                    const transactionDate = new Date(
                        `${transaction.date}T00:00:00`
                    );

                    return getMonthKey(transactionDate) === key;
                });

                const income = monthlyTransactions
                    .filter(transaction => transaction.type === "income")
                    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

                const expenses = monthlyTransactions
                    .filter(transaction => transaction.type === "expense")
                    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

                labels.push(date.toLocaleDateString("en-US", {
                    month: "short"
                }));

                incomeData.push(income);
                expenseData.push(expenses);
            }

        } else {

            // Current month, grouped by day
            const year = now.getFullYear();
            const month = now.getMonth();

            const daysInMonth = new Date(year, month + 1, 0).getDate();

            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);

                const key = getDateKey(date);

                const dailyTransactions = transactions.filter(transaction =>
                    transaction.date === key
                );

                const income = dailyTransactions
                    .filter(transaction => transaction.type === "income")
                    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

                const expenses = dailyTransactions
                    .filter(transaction => transaction.type === "expense")
                    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

                labels.push(day);

                incomeData.push(income);
                expenseData.push(expenses);
            }
        }

        return {
            labels,
            incomeData,
            expenseData
        };
    }

    // 8. RENDER SPENDING CHART

    function renderSpendingChart() {
        if (!spendingCanvas || typeof Chart === "undefined") {
            return;
        }

        const period = spendingPeriod
            ? spendingPeriod.value
            : "month";

        const data = getPeriodData(period);

        const hasData = data.incomeData.some(value => value > 0) ||
            data.expenseData.some(value => value > 0);

        toggleEmptyState(spendingCanvas, spendingEmpty, hasData);

        if (!hasData) {
            if (spendingChart) {
                spendingChart.destroy();
                spendingChart = null;
            }

            return;
        }

        if (spendingChart) {
            spendingChart.destroy();
        }

        const defaults = getChartDefaults();

        spendingChart = new Chart(spendingCanvas, {
            type: "line",

            data: {
                labels: data.labels,

                datasets: [
                    {
                        label: "Income",
                        data: data.incomeData,

                        borderColor: "#22c55e",
                        backgroundColor: "rgba(34, 197, 94, 0.10)",

                        borderWidth: 2.5,
                        tension: 0.4,

                        fill: true,

                        pointRadius: 2,
                        pointHoverRadius: 6,

                        pointBackgroundColor: "#22c55e"
                    },

                    {
                        label: "Expenses",
                        data: data.expenseData,

                        borderColor: "#ef4444",
                        backgroundColor: "rgba(239, 68, 68, 0.08)",

                        borderWidth: 2.5,
                        tension: 0.4,

                        fill: true,

                        pointRadius: 2,
                        pointHoverRadius: 6,

                        pointBackgroundColor: "#ef4444"
                    }
                ]
            },

            options: {
                ...defaults,

                interaction: {
                    intersect: false,
                    mode: "index"
                },

                plugins: {
                    ...defaults.plugins,

                    legend: {
                        display: true,
                        position: "top",
                        align: "end",

                        labels: {
                            color: getTextColor(),
                            usePointStyle: true,
                            pointStyle: "circle",
                            boxWidth: 7,
                            padding: 18,
                            font: {
                                size: 10
                            }
                        }
                    }
                }
            }
        });
    }

    // 9. CATEGORY BREAKDOWN DATA

    function getCategoryData() {
        const transactions = getTransactions();

        const currentMonth = new Date();

        const monthlyExpenses = transactions.filter(transaction => {
            if (transaction.type !== "expense") {
                return false;
            }

            const date = new Date(`${transaction.date}T00:00:00`);

            return (
                date.getFullYear() === currentMonth.getFullYear() &&
                date.getMonth() === currentMonth.getMonth()
            );
        });

        const categoryTotals = {};

        monthlyExpenses.forEach(transaction => {
            const category = transaction.category;

            categoryTotals[category] =
                (categoryTotals[category] || 0) +
                Number(transaction.amount);
        });

        return Object.entries(categoryTotals)
            .map(([category, amount]) => ({
                category,
                amount
            }))
            .sort((a, b) => b.amount - a.amount);
    }

    // 10. RENDER CATEGORY LEGEND

    function renderCategoryLegend(data, total) {
        if (!categoryLegend) return;

        if (data.length === 0 || total === 0) {
            categoryLegend.innerHTML = "";
            return;
        }

        categoryLegend.innerHTML = data.map((item, index) => {
            const percentage = (item.amount / total) * 100;

            const color = getCategoryColor(item.category, index);

            return `
                <div class="legend-item">
                    <span
                        class="legend-color"
                        style="background-color: ${color}"
                    ></span>

                    <span>
                        ${item.category}
                        <strong>${percentage.toFixed(1)}%</strong>
                    </span>
                </div>
            `;
        }).join("");
    }

    // 11. RENDER CATEGORY CHART

    function renderCategoryChart() {
        if (!categoryCanvas || typeof Chart === "undefined") {
            return;
        }

        const data = getCategoryData();

        const total = data.reduce(
            (sum, item) => sum + item.amount,
            0
        );

        const hasData = data.length > 0 && total > 0;

        toggleEmptyState(categoryCanvas, categoryEmpty, hasData);

        if (!hasData) {
            if (categoryChart) {
                categoryChart.destroy();
                categoryChart = null;
            }

            renderCategoryLegend([], 0);

            return;
        }

        if (categoryChart) {
            categoryChart.destroy();
        }

        const colors = data.map((item, index) =>
            getCategoryColor(item.category, index)
        );

        categoryChart = new Chart(categoryCanvas, {
            type: "doughnut",

            data: {
                labels: data.map(item => item.category),

                datasets: [
                    {
                        data: data.map(item => item.amount),

                        backgroundColor: colors,

                        borderColor: getComputedStyle(
                            document.documentElement
                        ).getPropertyValue("--surface").trim(),

                        borderWidth: 4,

                        hoverOffset: 8
                    }
                ]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,

                cutout: "72%",

                plugins: {
                    legend: {
                        display: false
                    },

                    tooltip: {
                        backgroundColor: "#151d31",
                        titleColor: "#ffffff",
                        bodyColor: "#dbe4f0",

                        padding: 12,
                        cornerRadius: 9,

                        callbacks: {
                            label(context) {
                                const amount = context.parsed;

                                const percentage = total > 0
                                    ? (amount / total) * 100
                                    : 0;

                                return `${formatCurrency(amount)} (${percentage.toFixed(1)}%)`;
                            }
                        }
                    }
                }
            }
        });

        renderCategoryLegend(data, total);
    }

    // 12. RENDER ALL ANALYTICS

    function render() {
        renderSpendingChart();
        renderCategoryChart();
    }

    // 13. REFRESH CHART COLORS WHEN THEME CHANGES

    function refreshTheme() {
        render();
    }

    // 14. EVENT LISTENERS

    function bindEvents() {

        if (spendingPeriod) {
            spendingPeriod.addEventListener("change", renderSpendingChart);
        }

        document.addEventListener("transactionsUpdated", render);

        document.addEventListener("budgetUpdated", render);
        
        document.addEventListener("themeChanged", refreshTheme);
    }

    // 15. INITIALIZE

    function init() {
        bindEvents();
        render();
    }

    return {
        init,
        render,
        renderSpendingChart,
        renderCategoryChart,
        getPeriodData,
        getCategoryData,
        refreshTheme
    };

})();
