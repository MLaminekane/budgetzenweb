export type TransactionType = "income" | "expense" | "subscription";
export type SubscriptionPeriod = "free_trial" | "monthly" | "yearly";

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  date: string;
  created_at: string;
  note?: string;
  subscription?: {
    period: SubscriptionPeriod;
    service: string;
  };
}

export interface BalanceData {
  total: number;
  income: number;
  expenses: number;
}

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  period: "monthly" | "yearly";
  created_at: string;
}

export interface BudgetProgress {
  category: string;
  budgeted: number;
  spent: number;
  remaining: number;
  percentage: number;
}
