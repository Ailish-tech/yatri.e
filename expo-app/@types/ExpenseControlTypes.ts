export type ExpenseCategory = 
  | "Transporte"
  | "Hospedagem"
  | "Alimentação"
  | "Atividades"
  | "Compras"
  | "Emergência"
  | "Outros";

export type Expense = {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  description?: string;
  date: string;
  itineraryTitle: string;
  activityTitle?: string;
  location?: string;
  createdAt: string;
};

export type ExpensesByCategory = {
  [key in ExpenseCategory]: number;
};

export type ExpenseControlContextType = {
  expenses: Expense[];
  addExpense: (expense: Expense) => Promise<void>;
  removeExpense: (expenseId: string) => Promise<void>;
  updateExpense: (expenseId: string, updatedExpense: Partial<Expense>) => Promise<void>;
  getTotalExpenses: () => number;
  getExpensesByCategory: () => ExpensesByCategory;
  getExpensesByItinerary: (itineraryTitle: string) => Expense[];
  clearAllExpenses: () => Promise<void>;
}