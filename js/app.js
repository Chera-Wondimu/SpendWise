
/* =========================================
   SPENDWISE — MAIN APPLICATION
========================================= */

const SpendWiseApp = (() => {

    /* =========================================
       1. DOM ELEMENTS
    ========================================= */

    const elements = {
        sidebar: document.getElementById("sidebar"),
        sidebarOverlay: document.getElementById("sidebarOverlay"),
        menuToggle: document.getElementById("menuToggle"),
        closeSidebar: document.getElementById("closeSidebar"),

        themeToggle: document.getElementById("themeToggle"),
        notificationButton: document.getElementById("notificationButton"),

        transactionModal: document.getElementById("transactionModal"),
        transactionForm: document.getElementById("transactionForm"),
        transactionId: document.getElementById("transactionId"),
        transactionTitle: document.getElementById("transactionTitle"),
        transactionAmount: document.getElementById("transactionAmount"),
        transactionCategory: document.getElementById("transactionCategory"),
        transactionDate: document.getElementById("transactionDate"),
        modalTitle: document.getElementById("modalTitle"),

        closeModal: document.getElementById("closeModal"),
        cancelModal: document.getElementById("cancelModal"),

        addTransactionBtn: document.getElementById("addTransactionBtn"),
        emptyAddTransactionBtn: document.getElementById("emptyAddTransactionBtn"),
        viewAllTransactions: document.getElementById("viewAllTransactions"),

        toastContainer: document.getElementById("toastContainer")
    };


    /* =========================================
       2. PAGE CONFIGURATION
    ========================================= */

    const pageNames = {
        dashboard: "Dashboard",
        transactions: "Transactions",
        budgets: "Budgets",
        analytics: "Analytics",
        categories: "Categories",
        settings: "Settings"
    };


    /* =========================================
       3. TOAST NOTIFICATIONS
    ========================================= */

    function showToast(message, type = "success") {
        if (!elements.toastContainer) return;

        const icons = {
            success: "check-circle",
            error: "alert-circle",
            warning: "alert-triangle",
            info: "info"
        };

        const toast = document.createElement("div");

        toast.className = `toast ${type}`;

        toast.innerHTML = `
            <div class="toast-icon">
                <i data-lucide="${icons[type] || icons.info}"></i>
            </div>

            <div class="toast-content">
                <span class="toast-message"></span>
            </div>

            <button class="toast-close" type="button" aria-label="Close notification">
                <i data-lucide="x"></i>
            </button>
        `;

        toast.querySelector(".toast-message").textContent = message;

        elements.toastContainer.appendChild(toast);

        if (window.lucide) {
            window.lucide.createIcons();
        }

        let timeout;

        function removeToast() {
            toast.classList.add("removing");

            setTimeout(() => {
                toast.remove();
            }, 250);
        }

        function startTimer() {
            clearTimeout(timeout);
            timeout = setTimeout(removeToast, 4000);
        }

        toast.querySelector(".toast-close").addEventListener(
            "click",
            () => {
                clearTimeout(timeout);
                removeToast();
            }
        );

        toast.addEventListener("mouseenter", () => {
            clearTimeout(timeout);
        });

        toast.addEventListener("mouseleave", startTimer);

        startTimer();
    }


    /* =========================================
       4. THEME MANAGEMENT
    ========================================= */

    function applyTheme(theme) {
        const selectedTheme = theme === "light" ? "light" : "dark";

        document.documentElement.setAttribute(
            "data-theme",
            selectedTheme
        );

        if (typeof SpendWiseStorage !== "undefined") {
            SpendWiseStorage.saveTheme(selectedTheme);
        }

        updateThemeButton(selectedTheme);

        document.dispatchEvent(
            new CustomEvent("themeChanged", {
                detail: { theme: selectedTheme }
            })
        );

        if (typeof AnalyticsManager !== "undefined") {
            AnalyticsManager.refreshTheme();
        }
    }


    function updateThemeButton(theme) {
        if (!elements.themeToggle) return;

        const icon = theme === "dark" ? "sun" : "moon";

        elements.themeToggle.innerHTML = `
            <i data-lucide="${icon}"></i>
        `;

        elements.themeToggle.setAttribute(
            "aria-label",
            theme === "dark"
                ? "Switch to light mode"
                : "Switch to dark mode"
        );

        elements.themeToggle.setAttribute(
            "title",
            theme === "dark"
                ? "Switch to light mode"
                : "Switch to dark mode"
        );

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }


    function initializeTheme() {
        const savedTheme =
            typeof SpendWiseStorage !== "undefined"
                ? SpendWiseStorage.getTheme()
                : "dark";

        applyTheme(savedTheme || "dark");
    }


    function toggleTheme() {
        const currentTheme =
            document.documentElement.getAttribute("data-theme") || "dark";

        const newTheme = currentTheme === "dark" ? "light" : "dark";

        applyTheme(newTheme);

        showToast(
            `${newTheme === "dark" ? "Dark" : "Light"} mode enabled.`,
            "success"
        );
    }


    function bindTheme() {
        elements.themeToggle?.addEventListener(
            "click",
            toggleTheme
        );
    }


    /* =========================================
       5. PAGE NAVIGATION
    ========================================= */

    function showPage(pageName) {
        if (!pageNames[pageName]) return;

        Object.keys(pageNames).forEach(page => {
            const pageElement = document.getElementById(page);

            if (pageElement) {
                pageElement.style.display =
                    page === pageName ? "" : "none";
            }
        });

        document.querySelectorAll(".nav-link[data-page]").forEach(link => {
            link.classList.toggle(
                "active",
                link.dataset.page === pageName
            );
        });

        const breadcrumb = document.querySelector(".breadcrumb strong");

        if (breadcrumb) {
            breadcrumb.textContent = pageNames[pageName];
        }

        closeSidebar();

        if (pageName === "dashboard") {
            DashboardManager.render();
        }

        if (pageName === "transactions") {
            TransactionManager.render();
        }

        if (pageName === "analytics") {
            AnalyticsManager.render();
        }

        if (pageName === "budgets") {
            BudgetManager.render();
        }
    }


    function bindNavigation() {
        document.querySelectorAll(".nav-link[data-page]").forEach(link => {
            link.addEventListener("click", event => {
                event.preventDefault();

                showPage(link.dataset.page);
            });
        });

        elements.viewAllTransactions?.addEventListener(
            "click",
            event => {
                event.preventDefault();
                showPage("transactions");
            }
        );
    }


    /* =========================================
       6. SIDEBAR MANAGEMENT
    ========================================= */

    function openSidebar() {
        elements.sidebar?.classList.add("open", "active");
        elements.sidebarOverlay?.classList.add("show");

        document.body.classList.add("sidebar-open");
    }


    function closeSidebar() {
        elements.sidebar?.classList.remove("open", "active");
        elements.sidebarOverlay?.classList.remove("show");

        document.body.classList.remove("sidebar-open");
    }


    function bindSidebar() {
        elements.menuToggle?.addEventListener(
            "click",
            openSidebar
        );

        elements.closeSidebar?.addEventListener(
            "click",
            closeSidebar
        );

        elements.sidebarOverlay?.addEventListener(
            "click",
            closeSidebar
        );
    }


    /* =========================================
       7. LOCAL DATE HELPER
    ========================================= */

    function getLocalDate() {
        const today = new Date();

        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }


    /* =========================================
       8. TRANSACTION MODAL
    ========================================= */

    function openTransactionModal() {
        if (!elements.transactionModal) return;

        elements.transactionForm?.reset();

        if (elements.transactionId) {
            elements.transactionId.value = "";
        }

        if (elements.modalTitle) {
            elements.modalTitle.textContent = "Add Transaction";
        }

        const expenseRadio = document.querySelector(
            'input[name="transactionType"][value="expense"]'
        );

        if (expenseRadio) {
            expenseRadio.checked = true;
        }

        if (elements.transactionDate) {
            elements.transactionDate.value = getLocalDate();
        }

        if (elements.transactionCategory) {
            TransactionManager.updateCategoryOptions("expense");
        }

        elements.transactionModal.classList.add("show");
        document.body.classList.add("modal-open");

        elements.transactionTitle?.focus();
    }


    function closeTransactionModal() {
        elements.transactionModal?.classList.remove("show");

        document.body.classList.remove("modal-open");
    }


    function bindTransactionModal() {
        elements.addTransactionBtn?.addEventListener(
            "click",
            openTransactionModal
        );

        elements.emptyAddTransactionBtn?.addEventListener(
            "click",
            openTransactionModal
        );

        document.querySelectorAll("[data-open-transaction]").forEach(button => {
            button.addEventListener("click", openTransactionModal);
        });

        elements.closeModal?.addEventListener(
            "click",
            closeTransactionModal
        );

        elements.cancelModal?.addEventListener(
            "click",
            closeTransactionModal
        );

        elements.transactionModal?.addEventListener(
            "click",
            event => {
                if (event.target === elements.transactionModal) {
                    closeTransactionModal();
                }
            }
        );
    }


    /* =========================================
       9. NOTIFICATIONS
    ========================================= */

    function bindNotifications() {
        elements.notificationButton?.addEventListener(
            "click",
            () => {
                showToast(
                    "You're all caught up!",
                    "info"
                );
            }
        );
    }


    /* =========================================
       10. KEYBOARD SHORTCUTS
    ========================================= */

    function bindKeyboardControls() {
        document.addEventListener("keydown", event => {

            if (event.key === "Escape") {
                closeTransactionModal();
                closeSidebar();
            }

            if (
                (event.ctrlKey || event.metaKey) &&
                event.key.toLowerCase() === "n"
            ) {
                event.preventDefault();
                openTransactionModal();
            }

        });
    }


    /* =========================================
       11. INITIALIZE APPLICATION
    ========================================= */

    function init() {

        window.showToast = showToast;

        initializeTheme();

        bindTheme();
        bindNavigation();
        bindSidebar();
        bindTransactionModal();
        bindNotifications();
        bindKeyboardControls();

        TransactionManager.init();
        BudgetManager.init();
        AnalyticsManager.init();
        DashboardManager.init();

        showPage("dashboard");

        if (window.lucide) {
            window.lucide.createIcons();
        }

        console.log("SpendWise initialized successfully.");
    }


    /* =========================================
       12. PUBLIC METHODS
    ========================================= */

    return {
        init,
        showToast,
        showPage,
        openSidebar,
        closeSidebar,
        openTransactionModal,
        closeTransactionModal,
        toggleTheme,
        applyTheme
    };

})();


/* =========================================
   START APPLICATION
========================================= */

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        SpendWiseApp.init
    );
} else {
    SpendWiseApp.init();
}
