export interface DashboardDto {
  totalBalance: number;
  currency: string;
  currentMonthIncome: number;
  currentMonthExpense: number;
  currentMonthNet: number;
  lastMonthIncome: number;
  lastMonthExpense: number;
  incomeChangePercentage: number;
  expenseChangePercentage: number;
  totalAccounts: number;
  activeAccounts: number;
  totalGoals: number;
  activeGoals: number;
  completedGoalsThisMonth: number;
  budgetAlerts: BudgetAlertDto[];
  recentTransactions: RecentTransactionDto[];
}

export interface BudgetAlertDto {
  budgetId: string;
  budgetName: string;
  categoryName: string;
  budgetAmount: number;
  spentAmount: number;
  spentPercentage: number;
  alertLevel: "Warning" | "Danger";
}

export interface RecentTransactionDto {
  id: string;
  type: string; // "Income" veya "Expense"
  categoryName: string;
  categoryIcon: string;
  amount: number;
  description: string;
  transactionDate: string;
}
