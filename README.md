# SpendWise — Personal Finance Dashboard

SpendWise is a modern, responsive personal finance dashboard that helps users track income, monitor expenses, manage budgets, and understand their spending habits through interactive charts.

## Features

- **Dashboard:** View your financial overview, including balance, income, expenses, and budget.
- **Transaction Management:** Add, edit, delete, and filter income and expense transactions.
- **Budget Tracking:** Set a monthly budget and monitor spending and remaining balance.
- **Interactive Analytics:** Visualize spending trends and category breakdowns using Chart.js.
- **Dark & Light Themes:** Switch between dark and light appearance.
- **Responsive Design:** Optimized for desktop, tablet, and mobile screens.
- **Local Data Persistence:** Save transactions, budget settings, and theme preferences using browser LocalStorage.
- **Toast Notifications:** Receive feedback when performing actions.

## Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Application structure |
| CSS3 | Styling and responsive design |
| JavaScript | Application logic and interactivity |
| Chart.js | Financial charts |
| Lucide Icons | Interface icons |
| LocalStorage | Browser-based data persistence |

## Project Structure

```text
SpendWise/
├── assets/
│   └── images/
├── css/
│   ├── style.css
│   └── responsive.css
├── js/
│   ├── analytics.js
│   ├── app.js
│   ├── budget.js
│   ├── dashboard.js
│   ├── storage.js
│   └── transactions.js
├── index.html
├── README.md
└── .gitignore
```

## Getting Started

1. Clone the repository:

   ```bash
   git clone YOUR_REPOSITORY_URL
   ```

2. Open the project folder:

   ```bash
   cd SpendWise
   ```

3. Open `index.html` in your browser.

   Alternatively, use the **Live Server** extension in Visual Studio Code.

## Data Storage

SpendWise currently uses browser LocalStorage to persist financial data.

- Data stays in the browser where it was created.
- Clearing browser storage can remove saved application data.
- Data is not synchronized between devices.
- No backend or user authentication is currently required.

## Future Improvements

- Backend API integration
- User authentication and secure accounts
- Cloud-based data synchronization
- Export transactions to CSV or PDF
- Advanced financial reports
- Recurring transactions

## Author

**Chera Wondimu**

Software Engineering Student | Backend-Focused Full-Stack Developer

- GitHub: [Chera-Wondimu](https://github.com/Chera-Wondimu)
- LinkedIn: [Chera Wondimu](https://www.linkedin.com/in/codedbychera/)
- Portfolio: [chera-wondimu.vercel.app](https://chera-wondimu.vercel.app/)

---

Built with HTML, CSS, and JavaScript.
