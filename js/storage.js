
/* =========================================
   SPENDWISE — STORAGE MANAGER
   Handles LocalStorage operations
========================================= */

const SpendWiseStorage = (() => {
    const KEYS = {
        transactions: "spendwise_transactions",
        budget: "spendwise_budget",
        theme: "spendwise_theme"
    };

    const DEFAULT_BUDGET = 10000;

    // Safely read data from LocalStorage
    function read(key, fallback) {
        try {
            const storedData = localStorage.getItem(key);

            if (storedData === null) {
                return fallback;
            }

            return JSON.parse(storedData);
        } catch (error) {
            console.error(`Error reading ${key}:`, error);
            return fallback;
        }
    }

    // Safely save data to LocalStorage
    function write(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error saving ${key}:`, error);
            return false;
        }
    }

    // Get all transactions
    function getTransactions() {
        const transactions = read(KEYS.transactions, []);

        return Array.isArray(transactions) ? transactions : [];
    }

    // Save all transactions
    function saveTransactions(transactions) {
        if (!Array.isArray(transactions)) {
            console.error("Transactions must be an array.");
            return false;
        }

        return write(KEYS.transactions, transactions);
    }

    // Get monthly budget
    
function getBudget() {
    const savedBudget = read(KEYS.budget, null);

    if (savedBudget === null) {
        write(KEYS.budget, DEFAULT_BUDGET);
        return DEFAULT_BUDGET;
    }

    const budget = Number(savedBudget);

    if (!Number.isFinite(budget) || budget < 0) {
        write(KEYS.budget, DEFAULT_BUDGET);
        return DEFAULT_BUDGET;
    }

    return budget;
}


    // Save monthly budget
    function saveBudget(amount) {
        const budget = Number(amount);

        if (!Number.isFinite(budget) || budget < 0) {
            console.error("Invalid budget amount.");
            return false;
        }

        try {
            localStorage.setItem(KEYS.budget, String(budget));
            return true;
        } catch (error) {
            console.error("Error saving budget:", error);
            return false;
        }
    }

    // Get saved theme
    function getTheme() {
        const theme = localStorage.getItem(KEYS.theme);

        return theme === "light" ? "light" : "dark";
    }

    // Save theme
    function saveTheme(theme) {
        if (theme !== "dark" && theme !== "light") {
            return false;
        }

        try {
            localStorage.setItem(KEYS.theme, theme);
            return true;
        } catch (error) {
            console.error("Error saving theme:", error);
            return false;
        }
    }

    // Clear all SpendWise application data
    function clearAll() {
        try {
            Object.values(KEYS).forEach(key => {
                localStorage.removeItem(key);
            });

            return true;
        } catch (error) {
            console.error("Error clearing SpendWise data:", error);
            return false;
        }
    }

    return {
        getTransactions,
        saveTransactions,
        getBudget,
        saveBudget,
        getTheme,
        saveTheme,
        clearAll
    };
})();
