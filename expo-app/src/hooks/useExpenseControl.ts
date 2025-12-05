import { useState, useEffect, useCallback } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { Expense, ExpensesByCategory, ExpenseCategory } from '../../@types/ExpenseControlTypes';

const EXPENSES_STORAGE_KEY = '@eztripai_userExpenses';
const BUDGET_LIMIT_STORAGE_KEY = '@eztripai_userBudgetLimit';

export function useExpenseControl() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgetLimit, setBudgetLimit] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadExpenses = useCallback(async () => {
    try {
      setIsLoading(true);
      const jsonValue = await AsyncStorage.getItem(EXPENSES_STORAGE_KEY);
      if (jsonValue) {
        const loadedExpenses = JSON.parse(jsonValue);
        setExpenses(loadedExpenses);
      }
      
      const budgetValue = await AsyncStorage.getItem(BUDGET_LIMIT_STORAGE_KEY);
      if (budgetValue) {
        setBudgetLimit(parseFloat(budgetValue));
      }
    } catch (error) {
      // DEBUG: console.error('Erro ao carregar gastos:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addExpense = useCallback(async (expense: Expense) => {
    try {
      const newExpenses = [...expenses, expense];
      setExpenses(newExpenses);
      await AsyncStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(newExpenses));
    } catch (error) {
      // DEBUG: console.error('Erro ao adicionar gasto:', error);
    }
  }, [expenses]);

  const removeExpense = useCallback(async (expenseId: string) => {
    try {
      const updatedExpenses = expenses.filter(expense => expense.id !== expenseId);
      setExpenses(updatedExpenses);
      await AsyncStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(updatedExpenses));
    } catch (error) {
      // DEBUG: console.error('Erro ao remover gasto:', error);
    }
  }, [expenses]);

  const updateExpense = useCallback(async (expenseId: string, updatedExpense: Partial<Expense>) => {
    try {
      const updatedExpenses = expenses.map(expense =>
        expense.id === expenseId ? { ...expense, ...updatedExpense } : expense
      );
      setExpenses(updatedExpenses);
      await AsyncStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(updatedExpenses));
    } catch (error) {
      // DEBUG: console.error('Erro ao atualizar gasto:', error);
    }
  }, [expenses]);

  const getTotalExpenses = useCallback(() => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  }, [expenses]);

  const getExpensesByCategory = useCallback((): ExpensesByCategory => {
    const categories: ExpensesByCategory = {
      "Transporte": 0,
      "Hospedagem": 0,
      "Alimentação": 0,
      "Atividades": 0,
      "Compras": 0,
      "Emergência": 0,
      "Outros": 0
    };

    expenses.forEach(expense => {
      categories[expense.category] += expense.amount;
    });

    return categories;
  }, [expenses]);

  const getExpensesByItinerary = useCallback((itineraryTitle: string) => {
    return expenses.filter(expense => expense.itineraryTitle === itineraryTitle);
  }, [expenses]);

  const clearAllExpenses = useCallback(async () => {
    try {
      setExpenses([]);
      await AsyncStorage.removeItem(EXPENSES_STORAGE_KEY);
    } catch (error) {
      // DEBUG: console.error('Erro ao limpar gastos:', error);
    }
  }, []);

  const setBudgetLimitValue = useCallback(async (limit: number | null) => {
    try {
      if (limit === null) {
        setBudgetLimit(null);
        await AsyncStorage.removeItem(BUDGET_LIMIT_STORAGE_KEY);
      } else {
        setBudgetLimit(limit);
        await AsyncStorage.setItem(BUDGET_LIMIT_STORAGE_KEY, limit.toString());
      }
    } catch (error) {
      // DEBUG: console.error('Erro ao definir limite de orçamento:', error);
    }
  }, []);

  const getBudgetProgress = useCallback(() => {
    if (!budgetLimit || budgetLimit === 0) return 0;
    const total = getTotalExpenses();
    return Math.min((total / budgetLimit) * 100, 100);
  }, [budgetLimit, getTotalExpenses]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  return {
    expenses,
    isLoading,
    budgetLimit,
    addExpense,
    removeExpense,
    updateExpense,
    getTotalExpenses,
    getExpensesByCategory,
    getExpensesByItinerary,
    clearAllExpenses,
    setBudgetLimitValue,
    getBudgetProgress,
    reloadExpenses: loadExpenses
  };
}