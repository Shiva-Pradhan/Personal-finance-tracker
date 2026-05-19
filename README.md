# FinMatrix – Personal Finance Dashboard

FinMatrix is a Frontend-only personal finance tracker built using HTML, CSS, and Vanilla JavaScript. It helps users manage income, expenses, budgets, and savings goals with real-time analytics using Chart.js and LocalStorage.

## Features

### Dashboard
- Total Income, Expenses, Net Balance
- Real-time updates

### Transactions
- Add / Delete income & expenses
- Search & filter transactions
- Persistent storage (LocalStorage)

### Budget & Goals
- Category-wise budget limits with progress tracking
- Savings goals with progress visualization

### Analytics
- Doughnut chart (expense breakdown)
- Monthly expense trend bar chart

### Utilities
- CSV export/import
- Dark/Light mode
- Multi-currency support

## Tech Stack

### Frontend
- HTML5 (Structure & layout)
- CSS3 (Responsive UI + Dark/Light theme)
- Vanilla JavaScript (ES6+) (Core logic & state management)

## Folder Structure
FinMatrix/
│── index.html
│── style.css
│── script.js
│── README.md

## How to Run
1. Open index.html in browser  
2. Add income and transactions  
3. View analytics and reports

## Future Improvements

### Frontend Enhancements
- Recurring transactions automation
- Advanced filtering & search
- PDF report generation
- PWA support (installable app)

### Backend Expansion (Full-Stack Upgrade)
- Django / Node.js backend API
- Database integration (PostgreSQL / MongoDB)
- User authentication (JWT/OAuth)
- Multi-device sync
- Cloud storage for financial data
- Secure encrypted financial records
- AI-based expense prediction

## Data Storage
Currently uses browser LocalStorage for:
- Transactions
- Income
- Budgets & Goals
- Theme & Currency settings
