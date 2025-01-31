import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useAnimations } from "@/hooks/useAnimations";
import { useSettings } from "@/hooks/useSettings";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Filter, Plus, ArrowUpRight, ArrowDownRight, CreditCard } from "lucide-react";
import { DateRangePicker } from "@/components/DateRangePicker";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { TransactionCard } from "@/components/TransactionCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import type { Transaction, Budget } from "@/types/finance";

const periods = [
  { value: "7d", label: "7 derniers jours" },
  { value: "30d", label: "30 derniers jours" },
  { value: "90d", label: "90 derniers jours" },
  { value: "custom", label: "Personnalisé" },
];

// Fonction utilitaire pour calculer la date de début selon la période
const getStartDate = (period: string): Date | null => {
  const today = new Date();
  switch (period) {
    case "7d":
      return new Date(today.setDate(today.getDate() - 7));
    case "30d":
      return new Date(today.setDate(today.getDate() - 30));
    case "90d":
      return new Date(today.setDate(today.getDate() - 90));
    case "custom":
      return null;
    default:
      return null;
  }
};

export default function Transactions() {
  const { fadeIn } = useAnimations();
  const { formatAmount } = useSettings();
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [selectedType, setSelectedType] = useState<"all" | "income" | "expense">("all");

  // Requêtes des données
  const { data: transactions = [], isLoading } = useQuery({
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

  const { data: budgets = [] } = useQuery({
    queryKey: ["budgets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Budget[];
    },
  });

  // Filtrage des transactions
  const filteredTransactions = transactions.filter(transaction => {
    // Filtre par type
    if (selectedType !== "all" && transaction.type !== selectedType) return false;

    // Filtre par date
    const transactionDate = new Date(transaction.date);
    if (selectedPeriod === "custom" && dateRange[0] && dateRange[1]) {
      return (
        transactionDate >= dateRange[0] &&
        transactionDate <= new Date(dateRange[1].setHours(23, 59, 59))
      );
    } else if (selectedPeriod !== "custom") {
      const startDate = getStartDate(selectedPeriod);
      if (startDate) {
        return transactionDate >= startDate;
      }
    }
    return true;
  });

  // Calculs des totaux pour la période filtrée
  const totals = filteredTransactions.reduce(
    (acc, curr) => {
      if (curr.type === "income") {
        acc.income += curr.amount;
      } else {
        acc.expenses += curr.amount;
      }
      return acc;
    },
    { income: 0, expenses: 0 }
  );

  // Gestionnaire pour le changement de période
  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
    if (value !== "custom") {
      setDateRange([null, null]);
    }
  };

  return (
    <motion.div {...fadeIn} className="space-y-6 p-6">
      {/* En-tête avec statistiques */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Solde Total</span>
              <ArrowUpRight className="h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(totals.income - totals.expenses)}</div>
            <p className="text-blue-100 mt-2">Période sélectionnée</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Revenus</span>
              <ArrowUpRight className="h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(totals.income)}</div>
            <p className="text-green-100 mt-2">Total des entrées</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Dépenses</span>
              <ArrowDownRight className="h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(totals.expenses)}</div>
            <p className="text-red-100 mt-2">Total des sorties</p>
          </CardContent>
        </Card>
          </div>

      {/* Filtres et actions */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
        <div className="flex flex-wrap gap-2">
              <Button
            variant={selectedType === "all" ? "default" : "outline"}
            onClick={() => setSelectedType("all")}
                className="rounded-full"
              >
            Toutes
              </Button>
              <Button
            variant={selectedType === "income" ? "default" : "outline"}
            onClick={() => setSelectedType("income")}
                className="rounded-full"
              >
                Revenus
              </Button>
              <Button
            variant={selectedType === "expense" ? "default" : "outline"}
            onClick={() => setSelectedType("expense")}
                className="rounded-full"
              >
                Dépenses
              </Button>
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[180px] rounded-full">
              <SelectValue placeholder="Sélectionner une période" />
                </SelectTrigger>
                <SelectContent>
                  {periods.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
          {selectedPeriod === "custom" && (
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              className="w-auto"
            />
          )}
        </div>
        <AddTransactionDialog />
          </div>

      {/* Liste des transactions avec compteur */}
          <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} trouvée{filteredTransactions.length !== 1 ? 's' : ''}
                  </div>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center p-8 bg-card rounded-lg border">
            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune transaction</h3>
            <p className="text-muted-foreground">
              {selectedType !== "all" || selectedPeriod !== "all" 
                ? "Aucune transaction ne correspond aux filtres sélectionnés"
                : "Commencez par ajouter votre première transaction"}
            </p>
          </div>
        ) : (
          filteredTransactions.map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))
        )}
      </div>
    </motion.div>
  );
}
