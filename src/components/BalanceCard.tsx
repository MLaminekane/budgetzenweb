import { Card, CardContent } from "./ui/card";
import { cn } from "@/lib/utils";
import { ArrowDownIcon, ArrowUpIcon, Wallet } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";

interface BalanceCardProps {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
}

export function BalanceCard({
  totalBalance,
  monthlyIncome,
  monthlyExpenses,
}: BalanceCardProps) {
  const { formatAmount } = useSettings();

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background border-2 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full p-2 bg-primary/10">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Solde Total</p>
              <h2 className="text-3xl font-bold tracking-tight">{formatAmount(totalBalance)}</h2>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden bg-gradient-to-br from-green-500/10 via-green-500/5 to-background border-2 border-green-500/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full p-2 bg-green-500/10">
              <ArrowUpIcon className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Revenus du Mois</p>
              <h2 className={cn(
                "text-3xl font-bold tracking-tight",
                "text-green-500"
              )}>{formatAmount(monthlyIncome)}</h2>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden bg-gradient-to-br from-red-500/10 via-red-500/5 to-background border-2 border-red-500/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full p-2 bg-red-500/10">
              <ArrowDownIcon className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Dépenses du Mois</p>
              <h2 className={cn(
                "text-3xl font-bold tracking-tight",
                "text-red-500"
              )}>{formatAmount(monthlyExpenses)}</h2>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
