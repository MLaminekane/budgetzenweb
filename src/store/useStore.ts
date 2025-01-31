import { create } from "zustand";
import { Transaction, Budget } from "@/types/finance";

interface AppState {
  transactions: Transaction[];
  budgets: Budget[];
  setTransactions: (transactions: Transaction[]) => void;
  setBudgets: (budgets: Budget[]) => void;
  addTransaction: (transaction: Transaction) => void;
  addBudget: (budget: Budget) => void;
}

export const useStore = create<AppState>((set) => ({
  transactions: [],
  budgets: [],
  setTransactions: (transactions) => set({ transactions }),
  setBudgets: (budgets) => set({ budgets }),
  addTransaction: (transaction) =>
    set((state) => ({
      transactions: [transaction, ...state.transactions],
    })),
  addBudget: (budget) =>
    set((state) => ({
      budgets: [budget, ...state.budgets],
    })),
}));
