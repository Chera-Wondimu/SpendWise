
/* =========================================
   SPENDWISE — BUDGET MANAGER
   Monthly budget and spending progress
========================================= */

const BudgetManager = (() => {

    // 1. DOM ELEMENTS

    const budgetModal = document.getElementById("budgetModal");
    const budgetForm = document.getElementById("budgetForm");
    const budgetAmountInput = document.getElementById("budgetAmount");

    const budgetSpentElement = document.getElementById("budgetSpent");
    const budgetLimitElement = document.getElementById("budgetLimit");
    const budgetProgress = document.getElementById("budgetProgress");
    const budgetPercentage = document.getElementById("budgetPercentage");
    const budgetRemainingText = document.getElementById("budgetRemainingText");

    const editBudgetButton = document.getElementById("editBudgetBtn");
    const closeBudgetButton = document.getElementById("closeBudgetModal");
    const cancelBudgetButton = document.getElementById("cancelBudgetModal");

    // 2. NOTIFICATION HELPER

    function notify(message, type = "success") {
        if (typeof window.showToast === "function") {
            window.showToast(message, type);
        } else {
            console.log(message);
        }
    }

    // 3. GET CURRENT MONTH

    function getCurrentMonth() {
        const now = new Date();

        return {
            year: now.getFullYear(),
            month: now.getMonth()
        };
    }

    // 4. GET CURRENT MONTH EXPENSES

    function getMonthlyExpenses() {
        const transactions = TransactionManager.getAll();

        const current = getCurrentMonth();

        return transactions.filter(transaction => {
            if (transaction.type !== "expense") {
                return false;
            }

            const date = new Date(`${transaction.date}T00:00:00`);

            return (
                date.getFullYear() === current.year &&
                date.getMonth() === current.month
            );
        });
    }

    // 5. CALCULATE TOTAL SPENDING

    function getTotalSpent() {
        return getMonthlyExpenses().reduce(
            (total, transaction) => total + Number(transaction.amount),
            0
        );
    }

    // 6. GET BUDGET INFORMATION

    function getSummary() {
        const budget = SpendWiseStorage.getBudget();
        const spent = getTotalSpent();

        const remaining = budget - spent;

        const percentage = budget > 0
            ? (spent / budget) * 100
            : spent > 0 ? 100 : 0;

        return {
            budget,
            spent,
            remaining,
            percentage,
            isExceeded: spent > budget,
            isNearLimit: percentage >= 80 && percentage <= 100
        };
    }

    // 7. UPDATE BUDGET DISPLAY

    function render() {
        const summary = getSummary();

        const {
            budget,
            spent,
            remaining,
            percentage,
            isExceeded,
            isNearLimit
        } = summary;

        const formatCurrency = amount =>
            TransactionManager.formatCurrency(amount);

        if (budgetSpentElement) {
            budgetSpentElement.textContent = formatCurrency(spent);
        }

        if (budgetLimitElement) {
            budgetLimitElement.textContent = formatCurrency(budget);
        }

        if (budgetProgress) {
            budgetProgress.style.width = `${Math.min(percentage, 100)}%`;

            if (isExceeded) {
                budgetProgress.style.background = "var(--danger)";
            } else if (isNearLimit) {
                budgetProgress.style.background = "var(--warning)";
            } else {
                budgetProgress.style.background =
                    "linear-gradient(90deg, #8065e9, #b39cff)";
            }

            budgetProgress.setAttribute(
                "aria-valuenow",
                Math.min(percentage, 100).toFixed(1)
            );
        }

        if (budgetPercentage) {
            budgetPercentage.textContent = `${percentage.toFixed(1)}%`;
        }

        if (budgetRemainingText) {
            if (isExceeded) {
                budgetRemainingText.textContent =
                    `${formatCurrency(Math.abs(remaining))} over budget`;
            } else {
                budgetRemainingText.textContent =
                    `${formatCurrency(remaining)} remaining`;
            }

            budgetRemainingText.style.color = isExceeded
                ? "var(--danger)"
                : isNearLimit
                    ? "var(--warning)"
                    : "var(--text-secondary)";
        }

        return summary;
    }

    // 8. OPEN BUDGET MODAL

    function openModal() {
        if (!budgetModal || !budgetAmountInput) return;

        budgetAmountInput.value = SpendWiseStorage.getBudget();

        budgetModal.classList.add("show");

        budgetAmountInput.focus();
    }

    // 9. CLOSE BUDGET MODAL

    function closeModal() {
        if (budgetModal) {
            budgetModal.classList.remove("show");
        }
    }

    // 10. SAVE NEW BUDGET

    function saveBudget(event) {
        event.preventDefault();

        const amount = Number(budgetAmountInput.value);

        if (!Number.isFinite(amount) || amount <= 0) {
            notify("Enter a valid budget greater than zero.", "error");
            budgetAmountInput.focus();
            return;
        }

        const saved = SpendWiseStorage.saveBudget(amount);

        if (!saved) {
            notify("Could not save your budget.", "error");
            return;
        }

        render();

        closeModal();

        notify("Monthly budget updated successfully!");

        document.dispatchEvent(new CustomEvent("budgetUpdated", {
            detail: {
                budget: amount
            }
        }));
    }

    // 11. EVENT LISTENERS

    function bindEvents() {

        if (editBudgetButton) {
            editBudgetButton.addEventListener("click", openModal);
        }

        if (closeBudgetButton) {
            closeBudgetButton.addEventListener("click", closeModal);
        }

        if (cancelBudgetButton) {
            cancelBudgetButton.addEventListener("click", closeModal);
        }

        if (budgetForm) {
            budgetForm.addEventListener("submit", saveBudget);
        }

        if (budgetModal) {
            budgetModal.addEventListener("click", event => {
                if (event.target === budgetModal) {
                    closeModal();
                }
            });
        }

        // Update budget whenever transactions change
        document.addEventListener("transactionsUpdated", render);
    }

    // 12. INITIALIZE

    function init() {
        bindEvents();
        render();
    }

    return {
        init,
        render,
        getSummary,
        getTotalSpent,
        getMonthlyExpenses,
        openModal,
        closeModal,
        saveBudget
    };

})();
