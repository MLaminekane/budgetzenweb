import { useState, useEffect } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { BalanceCard } from "@/components/BalanceCard";
import { ExpenseChart } from "@/components/ExpenseChart";
import { TransactionList } from "@/components/TransactionList";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { BudgetList } from "@/components/BudgetList";
import { AddBudgetDialog } from "@/components/AddBudgetDialog";
import type { Transaction, TransactionType, Budget } from "@/types/finance";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useAnimations } from "@/hooks/useAnimations";
import { UserProfile } from "@/types/user";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useSettings } from "@/hooks/useSettings";

const Dashboard = () => {
  const { fadeIn } = useAnimations();
  const { toast } = useToast();
  const user = useUser();
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const { formatAmount } = useSettings();

  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false });

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les transactions",
          variant: "destructive",
        });
        return [];
      }

      return data as Transaction[];
    },
  });

  const { data: budgets = [] } = useQuery({
    queryKey: ["budgets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les budgets",
          variant: "destructive",
        });
        return [];
      }

      return data as Budget[];
    },
  });

  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
        .then(({ data, error }) => {
          if (!error && data) {
            setProfile(data as UserProfile);
          }
        });
    }
  }, [user]);

  const handleAddTransaction = async (transactionData: {
    type: TransactionType;
    amount: number;
    description: string;
    category: string;
  }) => {
    const { data, error } = await supabase
      .from("transactions")
      .insert([
        {
          user_id: user?.id,
          ...transactionData,
          date: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la transaction",
        variant: "destructive",
      });
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    toast({
      title: "Transaction ajoutée",
      description: `${transactionData.description} - ${formatAmount(
        transactionData.amount
      )}`,
    });
  };

  const handleAddBudget = async (budgetData: {
    category: string;
    amount: number;
    period: "monthly" | "yearly";
  }) => {
    const { data, error } = await supabase
      .from("budgets")
      .insert([
        {
          user_id: user?.id,
          ...budgetData,
        },
      ])
      .select()
      .single();

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le budget",
        variant: "destructive",
      });
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["budgets"] });
    toast({
      title: "Budget ajouté",
      description: `${budgetData.category} - ${formatAmount(
        budgetData.amount
      )}`,
    });
  };

  const balanceData = {
    total: transactions.reduce(
      (acc, curr) =>
        acc + (curr.type === "income" ? curr.amount : -curr.amount),
      0
    ),
    income: transactions
      .filter((t) => t.type === "income")
      .reduce((acc, curr) => acc + curr.amount, 0),
    expenses: transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, curr) => acc + curr.amount, 0),
  };

  const expensesByCategory = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => {
      const existing = acc.find((item) => item.name === curr.category);
      if (existing) {
        existing.value += curr.amount;
      } else {
        acc.push({ name: curr.category, value: curr.amount });
      }
      return acc;
    }, [] as Array<{ name: string; value: number }>);

  return (
    <motion.div {...fadeIn}>
      <div className="p-2 space-y-2">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">
              Tableau de Bord {profile?.full_name}
            </h1>
            <div className="flex items-center gap-2">
              <AddTransactionDialog
                onAddTransaction={handleAddTransaction}
                className="bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary"
              />

            </div>
          </div>

          <BalanceCard
            totalBalance={transactions.reduce(
              (acc, transaction) =>
                transaction.type === "income"
                  ? acc + transaction.amount
                  : acc - transaction.amount,
              0
            )}
            monthlyIncome={transactions
              .filter(
                (transaction) =>
                  transaction.type === "income" &&
                  new Date(transaction.date).getMonth() ===
                    new Date().getMonth()
              )
              .reduce((acc, transaction) => acc + transaction.amount, 0)}
            monthlyExpenses={transactions
              .filter(
                (transaction) =>
                  transaction.type === "expense" &&
                  new Date(transaction.date).getMonth() ===
                    new Date().getMonth()
              )
              .reduce((acc, transaction) => acc + transaction.amount, 0)}
          />
        </div>

        {/* Graphiques et transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Graphique des dépenses */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Répartition des Dépenses</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ExpenseChart data={expensesByCategory} />
              </CardContent>
            </Card>
          </div>

          {/* Liste des transactions */}
          <div className="lg:col-span-2">
            <TransactionList
              transactions={transactions}
              className="h-[400px]"
            />
          </div>
        </div>

        {/* Budgets déplacés et améliorés */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Budgets Mensuels</h2>
            <AddBudgetDialog
                onAddBudget={handleAddBudget}
                className="bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary"
                transactions={transactions}
              />          
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <BudgetList budgets={budgets} transactions={transactions} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
