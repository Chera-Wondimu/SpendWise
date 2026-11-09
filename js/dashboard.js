
/* =========================================
   SPENDWISE — DASHBOARD MANAGER
========================================= */

const DashboardManager = (() => {

    /* =========================================
       1. DOM ELEMENTS
    ========================================= */

    const elements = {
        totalBalance: document.getElementById("totalBalance"),
        totalIncome: document.getElementById("totalIncome"),
        totalExpenses: document.getElementById("totalExpenses"),
        remainingBudget: document.getElementById("remainingBudget"),
        currentDate: document.getElementById("currentDate")
    };


    /* =========================================
       2. HELPER FUNCTIONS
    ========================================= */

    function getTransactions() {
        return TransactionManager.getAll();
    }

    function formatCurrency(amount) {
        return TransactionManager.formatCurrency(amount);
    }

    function getCurrentDate() {
        return new Date();
    }

    function isCurrentMonth(dateString) {
        const date = new Date(`${dateString}T00:00:00`);
        const today = getCurrentDate();

        return (
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    }


    /* =========================================
       3. DASHBOARD SUMMARY
    ========================================= */

    function getSummary() {
        const transactions = getTransactions();

        let totalIncome = 0;
        let totalExpenses = 0;

        let allTimeIncome = 0;
        let allTimeExpenses = 0;

        transactions.forEach(transaction => {
            const amount = Number(transaction.amount) || 0;

            if (transaction.type === "income") {
                allTimeIncome += amount;

                if (isCurrentMonth(transaction.date)) {
                    totalIncome += amount;
                }
            }

            if (transaction.type === "expense") {
                allTimeExpenses += amount;

                if (isCurrentMonth(transaction.date)) {
                    totalExpenses += amount;
                }
            }
        });

        const totalBalance = allTimeIncome - allTimeExpenses;

        const budgetSummary = BudgetManager.getSummary();

        const budget = budgetSummary.budget;
        const remainingBudget = budget - totalExpenses;

        return {
            totalBalance,
            totalIncome,
            totalExpenses,
            budget,
            remainingBudget,
            allTimeIncome,
            allTimeExpenses
        };
    }


    /* =========================================
       4. RENDER SUMMARY CARDS
    ========================================= */

    function renderSummary() {
        const summary = getSummary();

        if (elements.totalBalance) {
            elements.totalBalance.textContent =
                formatCurrency(summary.totalBalance);
        }

        if (elements.totalIncome) {
            elements.totalIncome.textContent =
                formatCurrency(summary.totalIncome);
        }

        if (elements.totalExpenses) {
            elements.totalExpenses.textContent =
                formatCurrency(summary.totalExpenses);
        }

        if (elements.remainingBudget) {
            elements.remainingBudget.textContent =
                formatCurrency(summary.remainingBudget);
        }
    }


    /* =========================================
       5. RENDER CURRENT DATE
    ========================================= */

    function renderDate() {
        if (!elements.currentDate) return;

        const today = getCurrentDate();

        elements.currentDate.textContent =
            new Intl.DateTimeFormat("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric"
            }).format(today);
    }


    /* =========================================
       6. RENDER DASHBOARD
    ========================================= */

    function render() {
        renderSummary();
        renderDate();
    }


    /* =========================================
       7. EVENT LISTENERS
    ========================================= */

    function bindEvents() {
        document.addEventListener(
            "transactionsUpdated",
            renderSummary
        );

        document.addEventListener(
            "budgetUpdated",
            renderSummary
        );
    }


    /* =========================================
       8. INITIALIZE
    ========================================= */

    function init() {
        bindEvents();
        render();
    }


    /* =========================================
       9. PUBLIC METHODS
    ========================================= */

    return {
        init,
        render,
        renderSummary,
        renderDate,
        getSummary
    };

})();
