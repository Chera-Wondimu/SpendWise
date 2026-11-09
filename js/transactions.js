
/* =========================================
   SPENDWISE — TRANSACTION MANAGER
   Add, edit, delete, search and filter
========================================= */

const TransactionManager = (() => {

    /* =========================================
       1. DOM ELEMENTS
    ========================================= */

    const form = document.getElementById("transactionForm");
    const modal = document.getElementById("transactionModal");

    const transactionIdInput = document.getElementById("transactionId");
    const titleInput = document.getElementById("transactionTitle");
    const amountInput = document.getElementById("transactionAmount");
    const categoryInput = document.getElementById("transactionCategory");
    const dateInput = document.getElementById("transactionDate");
    const descriptionInput = document.getElementById("transactionDescription");

    const searchInput = document.getElementById("transactionSearch");
    const typeFilter = document.getElementById("typeFilter");
    const categoryFilter = document.getElementById("categoryFilter");

    const recentTransactions = document.getElementById("recentTransactions");
    const allTransactions = document.getElementById("allTransactions");


    /* =========================================
       2. CATEGORY CONFIGURATION
    ========================================= */

    const categories = {
        expense: [
            "Food",
            "Transportation",
            "Shopping",
            "Bills",
            "Entertainment",
            "Health",
            "Education",
            "Other"
        ],

        income: [
            "Salary",
            "Freelance",
            "Investment",
            "Gift",
            "Other"
        ]
    };

    const categoryIcons = {
        Food: "utensils",
        Transportation: "car",
        Shopping: "shopping-bag",
        Bills: "receipt",
        Entertainment: "gamepad-2",
        Health: "heart-pulse",
        Education: "graduation-cap",
        Salary: "briefcase-business",
        Freelance: "laptop",
        Investment: "trending-up",
        Gift: "gift",
        Other: "circle-dollar-sign"
    };


    /* =========================================
       3. DATA ACCESS
    ========================================= */

    function getAll() {
        return SpendWiseStorage.getTransactions() || [];
    }

    function getById(id) {
        return getAll().find(transaction => transaction.id === id);
    }

    function generateId() {
        if (
            window.crypto &&
            typeof window.crypto.randomUUID === "function"
        ) {
            return window.crypto.randomUUID();
        }

        return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    }

    function notify(message, type = "success") {
        if (typeof window.showToast === "function") {
            window.showToast(message, type);
        } else {
            console.log(message);
        }
    }

    function emitUpdate() {
        document.dispatchEvent(
            new CustomEvent("transactionsUpdated", {
                detail: {
                    transactions: getAll()
                }
            })
        );
    }

    function getLocalDate() {
        const today = new Date();

        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }


    /* =========================================
       4. FORM DATA
    ========================================= */

    function getSelectedType() {
        const selected = document.querySelector(
            'input[name="transactionType"]:checked'
        );

        return selected ? selected.value : "expense";
    }

    function getFormData() {
        const title = titleInput.value.trim();
        const amount = Number(amountInput.value);
        const category = categoryInput.value;
        const date = dateInput.value;
        const description = descriptionInput.value.trim();
        const type = getSelectedType();

        if (!title) {
            notify("Please enter a transaction title.", "error");
            titleInput.focus();
            return null;
        }

        if (!Number.isFinite(amount) || amount <= 0) {
            notify("Please enter a valid amount greater than zero.", "error");
            amountInput.focus();
            return null;
        }

        if (!category) {
            notify("Please select a transaction category.", "error");
            categoryInput.focus();
            return null;
        }

        if (!date) {
            notify("Please select a transaction date.", "error");
            dateInput.focus();
            return null;
        }

        if (!categories[type].includes(category)) {
            notify(
                "Please select a valid category for this transaction type.",
                "error"
            );
            categoryInput.focus();
            return null;
        }

        return {
            title,
            amount,
            type,
            category,
            date,
            description
        };
    }


    /* =========================================
       5. ADD TRANSACTION
    ========================================= */

    function add(transactionData) {
        const transactions = getAll();

        const transaction = {
            id: generateId(),
            ...transactionData,
            createdAt: new Date().toISOString()
        };

        transactions.push(transaction);

        const saved = SpendWiseStorage.saveTransactions(transactions);

        if (!saved) {
            notify("Could not save the transaction.", "error");
            return false;
        }

        emitUpdate();

        notify("Transaction added successfully!");

        return transaction;
    }


    /* =========================================
       6. UPDATE TRANSACTION
    ========================================= */

    function update(id, updatedData) {
        const transactions = getAll();

        const index = transactions.findIndex(
            transaction => transaction.id === id
        );

        if (index === -1) {
            notify("Transaction not found.", "error");
            return false;
        }

        transactions[index] = {
            ...transactions[index],
            ...updatedData,
            id
        };

        const saved = SpendWiseStorage.saveTransactions(transactions);

        if (!saved) {
            notify("Could not update the transaction.", "error");
            return false;
        }

        emitUpdate();

        notify("Transaction updated successfully!");

        return transactions[index];
    }


    /* =========================================
       7. DELETE TRANSACTION
    ========================================= */

    function remove(id) {
        const transactions = getAll();

        const updatedTransactions = transactions.filter(
            transaction => transaction.id !== id
        );

        if (updatedTransactions.length === transactions.length) {
            notify("Transaction not found.", "error");
            return false;
        }

        const saved = SpendWiseStorage.saveTransactions(updatedTransactions);

        if (!saved) {
            notify("Could not delete the transaction.", "error");
            return false;
        }

        emitUpdate();

        notify("Transaction deleted successfully!");

        return true;
    }


    /* =========================================
       8. FORMAT VALUES
    ========================================= */

    function formatCurrency(amount) {
        return new Intl.NumberFormat("en-ET", {
            style: "currency",
            currency: "ETB",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(Number(amount) || 0);
    }

    function formatDate(dateString) {
        const date = new Date(`${dateString}T00:00:00`);

        if (Number.isNaN(date.getTime())) {
            return dateString || "";
        }

        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[character]);
    }


    /* =========================================
       9. TRANSACTION ROW
    ========================================= */

    function createRow(transaction) {
        const isIncome = transaction.type === "income";

        const icon = categoryIcons[transaction.category] || "wallet";

        const amountClass = isIncome
            ? "income-amount"
            : "expense-amount";

        const amountPrefix = isIncome ? "+" : "-";

        return `
            <tr data-transaction-id="${escapeHTML(transaction.id)}">

                <td>
                    <div class="transaction-name">
                        <div class="transaction-icon">
                            <i data-lucide="${icon}"></i>
                        </div>

                        <div>
                            <strong>${escapeHTML(transaction.title)}</strong>
                            <small>${escapeHTML(
                                transaction.description || transaction.category
                            )}</small>
                        </div>
                    </div>
                </td>

                <td>${escapeHTML(transaction.category)}</td>

                <td>${formatDate(transaction.date)}</td>

                <td class="${amountClass}">
                    ${amountPrefix}${formatCurrency(transaction.amount)}
                </td>

                <td>
                    <div class="action-buttons">

                        <button
                            type="button"
                            class="action-button edit-transaction"
                            data-id="${escapeHTML(transaction.id)}"
                            aria-label="Edit transaction"
                            title="Edit transaction"
                        >
                            <i data-lucide="pencil"></i>
                        </button>

                        <button
                            type="button"
                            class="action-button delete delete-transaction"
                            data-id="${escapeHTML(transaction.id)}"
                            aria-label="Delete transaction"
                            title="Delete transaction"
                        >
                            <i data-lucide="trash-2"></i>
                        </button>

                    </div>
                </td>

            </tr>
        `;
    }


    /* =========================================
       10. EMPTY STATES
    ========================================= */

    function updateEmptyStates(total, filtered) {
        const recentEmpty = document.getElementById("emptyTransactions");
        const allEmpty = document.getElementById("allTransactionsEmpty");

        if (recentEmpty) {
            recentEmpty.style.display = total === 0 ? "flex" : "none";
        }

        if (allEmpty) {
            allEmpty.style.display = filtered === 0 ? "flex" : "none";
        }
    }


    /* =========================================
       11. CATEGORY FILTER OPTIONS
    ========================================= */

    function updateCategoryFilterOptions(transactions = getAll()) {
        if (!categoryFilter) return;

        const previousSelection = categoryFilter.value || "all";

        // Only include categories currently used by transactions.
        const usedCategories = [
            ...new Set(
                transactions
                    .map(transaction => transaction.category)
                    .filter(category => typeof category === "string" && category.trim())
            )
        ];

        // Keep a consistent category order.
        const categoryOrder = [
            ...categories.expense,
            ...categories.income
        ];

        usedCategories.sort((a, b) => {
            return categoryOrder.indexOf(a) - categoryOrder.indexOf(b);
        });

        categoryFilter.innerHTML = `
            <option value="all">All categories</option>

            ${usedCategories.map(category => `
                <option value="${escapeHTML(category)}">
                    ${escapeHTML(category)}
                </option>
            `).join("")}
        `;

        // Keep the user's selection if that category still exists.
        if (usedCategories.includes(previousSelection)) {
            categoryFilter.value = previousSelection;
        } else {
            categoryFilter.value = "all";
        }
    }


    /* =========================================
       12. RENDER TRANSACTIONS
    ========================================= */

    function render() {
        const transactions = getAll();

        // Update the category filter whenever transactions change.
        updateCategoryFilterOptions(transactions);

        // Latest transactions first.
        const sortedTransactions = [...transactions].sort((a, b) => {
            const dateDifference =
                new Date(b.date) - new Date(a.date);

            if (dateDifference !== 0) {
                return dateDifference;
            }

            return new Date(b.createdAt || 0) -
                new Date(a.createdAt || 0);
        });

        // Dashboard: latest five transactions.
        if (recentTransactions) {
            const recent = sortedTransactions.slice(0, 5);

            recentTransactions.innerHTML = recent
                .map(createRow)
                .join("");
        }

        // Search and filters.
        const searchTerm = searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";

        const selectedType = typeFilter
            ? typeFilter.value
            : "all";

        const selectedCategory = categoryFilter
            ? categoryFilter.value
            : "all";

        const filteredTransactions = sortedTransactions.filter(transaction => {
            const title = String(transaction.title || "").toLowerCase();
            const category = String(transaction.category || "").toLowerCase();
            const description = String(transaction.description || "").toLowerCase();

            const matchesSearch =
                title.includes(searchTerm) ||
                category.includes(searchTerm) ||
                description.includes(searchTerm);

            const matchesType =
                selectedType === "all" ||
                transaction.type === selectedType;

            const matchesCategory =
                selectedCategory === "all" ||
                transaction.category === selectedCategory;

            return matchesSearch && matchesType && matchesCategory;
        });

        if (allTransactions) {
            allTransactions.innerHTML = filteredTransactions
                .map(createRow)
                .join("");
        }

        updateEmptyStates(
            transactions.length,
            filteredTransactions.length
        );

        if (window.lucide) {
            window.lucide.createIcons();
        }

        return sortedTransactions;
    }


    /* =========================================
       13. EDIT TRANSACTION
    ========================================= */

    function edit(id) {
        const transaction = getById(id);

        if (!transaction) {
            notify("Transaction not found.", "error");
            return;
        }

        transactionIdInput.value = transaction.id;
        titleInput.value = transaction.title;
        amountInput.value = transaction.amount;
        dateInput.value = transaction.date;
        descriptionInput.value = transaction.description || "";

        const typeInput = document.querySelector(
            `input[name="transactionType"][value="${transaction.type}"]`
        );

        if (typeInput) {
            typeInput.checked = true;
        }

        // Populate categories before selecting the saved category.
        updateCategoryOptions(
            transaction.type,
            transaction.category
        );

        const modalTitle = document.getElementById("modalTitle");

        if (modalTitle) {
            modalTitle.textContent = "Edit Transaction";
        }

        if (modal) {
            modal.classList.add("show");
            document.body.classList.add("modal-open");
        }

        titleInput.focus();
    }


    /* =========================================
       14. TRANSACTION FORM CATEGORIES
    ========================================= */

    function updateCategoryOptions(type, selectedCategory = "") {
        if (!categoryInput) return;

        const availableCategories =
            categories[type] || categories.expense;

        categoryInput.innerHTML = `
            <option value="">Select category</option>

            ${availableCategories.map(category => `
                <option value="${category}">
                    ${category}
                </option>
            `).join("")}
        `;

        if (selectedCategory &&
            availableCategories.includes(selectedCategory)) {
            categoryInput.value = selectedCategory;
        }
    }

    function initializeCategoryOptions() {
        updateCategoryOptions(getSelectedType());
    }


    /* =========================================
       15. FORM SUBMISSION
    ========================================= */

    function handleFormSubmit(event) {
        event.preventDefault();

        const data = getFormData();

        if (!data) return;

        const id = transactionIdInput.value;

        const result = id
            ? update(id, data)
            : add(data);

        if (!result) return;

        form.reset();

        transactionIdInput.value = "";

        dateInput.value = getLocalDate();

        initializeCategoryOptions();

        if (modal) {
            modal.classList.remove("show");
        }

        document.body.classList.remove("modal-open");

        const modalTitle = document.getElementById("modalTitle");

        if (modalTitle) {
            modalTitle.textContent = "Add Transaction";
        }
    }


    /* =========================================
       16. EVENT LISTENERS
    ========================================= */

    function bindEvents() {

        if (form) {
            form.addEventListener("submit", handleFormSubmit);
        }

        // Change form categories when transaction type changes.
        document.querySelectorAll(
            'input[name="transactionType"]'
        ).forEach(input => {
            input.addEventListener("change", () => {
                updateCategoryOptions(input.value);
            });
        });

        // Search.
        searchInput?.addEventListener("input", render);

        // Transaction type filter.
        typeFilter?.addEventListener("change", render);

        // Transaction category filter.
        categoryFilter?.addEventListener("change", render);

        // Edit and delete actions.
        document.addEventListener("click", event => {

            const editButton = event.target.closest(".edit-transaction");
            const deleteButton = event.target.closest(".delete-transaction");

            if (editButton) {
                edit(editButton.dataset.id);
            }

            if (deleteButton) {
                const id = deleteButton.dataset.id;

                const confirmed = window.confirm(
                    "Are you sure you want to delete this transaction?"
                );

                if (confirmed) {
                    remove(id);
                }
            }
        });
    }


    /* =========================================
       17. INITIALIZATION
    ========================================= */

    function init() {
        bindEvents();

        initializeCategoryOptions();

        if (dateInput && !dateInput.value) {
            dateInput.value = getLocalDate();
        }

        render();
    }


    /* =========================================
       18. PUBLIC METHODS
    ========================================= */

    return {
        init,
        getAll,
        getById,
        add,
        update,
        remove,
        edit,
        render,
        formatCurrency,
        formatDate,
        categories,
        updateCategoryOptions,
        updateCategoryFilterOptions
    };

})();
