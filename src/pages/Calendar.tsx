import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useAnimations } from "@/hooks/useAnimations";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Transaction } from "@/types/finance";
import { fr } from "date-fns/locale";
import {
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";
import { useSettings } from "@/hooks/useSettings";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Bell, CalendarIcon, List, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { TransactionDetails } from "@/components/TransactionDetails";

export default function Calendar() {
  const { fadeIn } = useAnimations();
  const { formatAmount } = useSettings();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Récupérer les transactions
  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return data as Transaction[];
    },
  });

  // Récupérer les budgets
  const { data: budgets = [] } = useQuery({
    queryKey: ["budgets"],
    queryFn: async () => {
      const { data, error } = await supabase.from("budgets").select("*");
      if (error) throw error;
      return data;
    },
  });

  // Calculs des statistiques mensuelles
  const monthlyStats = useMemo(() => {
    if (!selectedDate) return null;

    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    const monthTransactions = transactions.filter((t) => {
      const date = new Date(t.date);
      return date >= start && date <= end;
    });

    const totalIncome = monthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const expensesByCategory = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      expensesByCategory,
    };
  }, [transactions, selectedDate]);

  // Transactions du jour sélectionné
  const selectedDayTransactions = transactions.filter(
    (t) => selectedDate && isSameDay(new Date(t.date), selectedDate)
  );

  // Calcul du solde quotidien
  const dailyBalance = selectedDayTransactions.reduce(
    (sum, t) => sum + (t.type === "income" ? t.amount : -t.amount),
    0
  );

  // Calcul des rappels et paiements récurrents
  const reminders = useMemo(() => {
    if (!selectedDate) return [];

    const currentMonth = isSameMonth(new Date(), selectedDate);
    const budgetAlerts = budgets.map((budget) => {
      const spent = monthlyStats?.expensesByCategory[budget.category] || 0;
      const percentage = (spent / budget.amount) * 100;
      return {
        type: "budget" as const,
        category: budget.category,
        amount: budget.amount,
        spent,
        percentage,
        warning: percentage > 80,
        exceeded: percentage > 100,
      };
    });

    return budgetAlerts;
  }, [budgets, monthlyStats, selectedDate]);

  // Gestionnaire d'ajout de transaction
  const handleAddTransaction = async (data: {
    type: TransactionType;
    amount: number;
    description: string;
    category: string;
    subscription?: {
      period: SubscriptionPeriod;
      service: string;
    };
  }) => {
    try {
      const { error } = await supabase.from("transactions").insert([
        {
          ...data,
          date: selectedDate?.toISOString() || new Date().toISOString(),
          created_at: new Date().toISOString(),
          subscription: data.type === "subscription" ? data.subscription : null,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Transaction ajoutée",
        description: "La transaction a été ajoutée avec succès",
      });

      // Rafraîchir les données
      queryClient.invalidateQueries(["transactions"]);
    } catch (error) {
      console.error("Erreur lors de l'ajout de la transaction:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la transaction",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div {...fadeIn}>
      <div className="min-h-[calc(100vh-theme(spacing.16))] max-w-full overflow-x-hidden">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex flex-col sm:flex-row gap-4 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full">
              <h1 className="text-xl font-semibold">Calendrier</h1>

              

              <div className="sm:ml-auto">
                <AddTransactionDialog 
                  defaultDate={selectedDate} 
                  onAddTransaction={handleAddTransaction}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr,350px] overflow-hidden">
          {/* Calendrier */}
          <div className="p-4 min-h-[500px] overflow-y-auto">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={fr}
              className="w-full border-none"
              classNames={{
                months: "space-y-4",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                nav_button:
                  "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell:
                  "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] flex-1",
                row: "flex w-full mt-2",
                cell: "text-center text-sm p-0 relative flex-1 focus-within:relative focus-within:z-20",
                day: "h-9 w-full p-0 font-normal aria-selected:opacity-100",
                day_selected: "bg-primary text-primary-foreground",
                day_today: "bg-accent text-accent-foreground",
                day_outside: "opacity-50",
                day_disabled: "opacity-50",
                day_hidden: "invisible",
              }}
              components={{
                DayContent: (props) => {
                  const dayTransactions = transactions.filter((t) =>
                    isSameDay(new Date(t.date), props.date)
                  );
                  const hasIncome = dayTransactions.some(
                    (t) => t.type === "income"
                  );
                  const hasExpense = dayTransactions.some(
                    (t) => t.type === "expense"
                  );

                  return (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <span className="text-sm">{props.date.getDate()}</span>
                      <div className="absolute bottom-1 flex gap-1">
                        {hasIncome && (
                          <div className="w-1 h-1 bg-green-500 rounded-full" />
                        )}
                        {hasExpense && (
                          <div className="w-1 h-1 bg-red-500 rounded-full" />
                        )}
                      </div>
                    </div>
                  );
                },
              }}
            />
          </div>

          {/* Panneau latéral */}
          <div className="border-t lg:border-t-0 lg:border-l flex flex-col h-[calc(100vh-12rem)] lg:h-full overflow-hidden">
            {/* En-tête du jour */}
            <div className="p-4 sticky top-0 bg-background border-b">
              <div className="flex items-center justify-between">
                <h2 className="font-medium">
                  {selectedDate
                    ? format(selectedDate, "d MMMM yyyy", { locale: fr })
                    : "Aujourd'hui"}
                </h2>
                <div
                  className={cn(
                    "font-medium",
                    dailyBalance >= 0 ? "text-green-500" : "text-red-500"
                  )}
                >
                  {formatAmount(dailyBalance)}
                </div>
              </div>
            </div>

            {/* Contenu du panneau */}
            <div className="divide-y flex-1 overflow-y-auto">
              {/* Rappels et alertes */}
              {reminders.length > 0 && (
                <div className="p-4 space-y-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Rappels et alertes
                  </h3>
                  <div className="space-y-2">
                    {reminders.map((reminder) => (
                      <div key={reminder.category} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {reminder.category}
                          </span>
                          <Badge
                            variant={
                              reminder.exceeded
                                ? "destructive"
                                : reminder.warning
                                ? "warning"
                                : "secondary"
                            }
                          >
                            {Math.round(reminder.percentage)}%
                          </Badge>
                        </div>
                        <Progress value={reminder.percentage} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{formatAmount(reminder.spent)}</span>
                          <span>{formatAmount(reminder.amount)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transactions du jour */}
              <div className="p-4 space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <List className="h-4 w-4" />
                  Transactions
                </h3>
                <div className="space-y-2">
                  {selectedDayTransactions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Aucune transaction
                    </p>
                  ) : (
                    selectedDayTransactions.map((transaction) => {
                      const handleDelete = async () => {
                        try {
                          const { error } = await supabase
                            .from("transactions")
                            .delete()
                            .eq("id", transaction.id);

                          if (error) throw error;

                          toast({
                            title: "Transaction supprimée",
                            description: "La transaction a été supprimée avec succès",
                          });

                          // Rafraîchir les données
                          queryClient.invalidateQueries(["transactions"]);
                        } catch (error) {
                          toast({
                            title: "Erreur",
                            description: "Impossible de supprimer la transaction",
                            variant: "destructive",
                          });
                        }
                      };

                      return (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                          onClick={() => setSelectedTransaction(transaction)}
                        >
                          <div className="min-w-0 flex-1 mr-4">
                            <p className="font-medium truncate">
                              {transaction.description}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">
                              {transaction.category}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <p
                              className={cn(
                                "font-medium whitespace-nowrap",
                                transaction.type === "income"
                                  ? "text-green-600"
                                  : "text-red-600"
                              )}
                            >
                              {formatAmount(transaction.amount)}
                            </p>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Supprimer la transaction ?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Cette action est irréversible. La transaction sera définitivement supprimée.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={handleDelete}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Supprimer
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <TransactionDetails
        transaction={selectedTransaction}
        open={!!selectedTransaction}
        onOpenChange={(open) => !open && setSelectedTransaction(null)}
      />
    </motion.div>
  );
}
