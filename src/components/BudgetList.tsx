import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Budget, Transaction } from "@/types/finance";
import { cn } from "@/lib/utils";
import { useSettings } from "@/hooks/useSettings";

interface BudgetListProps {
  budgets: Budget[];
  transactions: Transaction[];
}

// Fonction  pour vérifier si une date est dans le mois courant
function isWithinCurrentMonth(date: Date) {
  const now = new Date();
  return (
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

export function BudgetList({ budgets, transactions }: BudgetListProps) {
  const { formatAmount } = useSettings();

  return budgets.map((budget) => {
    const spent = transactions
      .filter(
        (t) =>
          t.category === budget.category &&
          t.type === "expense" &&
          isWithinCurrentMonth(new Date(t.date))
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const remaining = budget.amount - spent;
    const progress = (spent / budget.amount) * 100;

    return (
      <Card key={budget.id} className="flex flex-col">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">
              {budget.category}
            </CardTitle>
            <p className="text-xs text-muted-foreground">Budget mensuel</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Dépensé: {formatAmount(spent)}</span>
              <span>Budget: {formatAmount(budget.amount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Restant</span>
              <span
                className={cn(
                  "text-sm font-bold",
                  remaining >= 0 ? "text-green-600" : "text-red-600"
                )}
              >
                {formatAmount(remaining)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  });
}
