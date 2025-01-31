import { useState } from "react";
import { Transaction } from "@/types/finance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Calendar } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useSettings } from "@/hooks/useSettings";
import { cn } from "@/lib/utils";

interface TransactionListProps {
  transactions: Transaction[];
  className?: string;
}

export function TransactionList({
  transactions,
  className,
}: TransactionListProps) {
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { settings, formatAmount, formatDate } = useSettings();

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesFilter = filter === "all" || transaction.type === filter;
    const matchesSearch =
      transaction.description
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="flex-none space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transactions</CardTitle>
            <p className="text-sm text-muted-foreground">
              {transactions.length} transactions
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex overflow-x-auto pb-2 -mx-6 px-6">
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
              >
                Tous
              </Button>
              <Button
                variant={filter === "income" ? "default" : "outline"}
                onClick={() => setFilter("income")}
              >
                Revenus
              </Button>
              <Button
                variant={filter === "expense" ? "default" : "outline"}
                onClick={() => setFilter("expense")}
              >
                Dépenses
              </Button>
            </div>
          </div>

          <div className="w-full">
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 overflow-auto">
        <div className="space-y-2">
          {filteredTransactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Aucune transaction trouvée
            </p>
          ) : (
            filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex flex-col gap-1 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium truncate max-w-[200px]">
                      {transaction.description}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.category}
                    </p>
                  </div>
                  <p
                    className={`font-medium ${
                      transaction.type === "income"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatAmount(transaction.amount)}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(transaction.date)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
