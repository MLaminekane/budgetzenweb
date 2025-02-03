import { Transaction } from "@/types";
import { useSettings } from "@/hooks/useSettings";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionDetailsProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransactionDetails({
  transaction,
  open,
  onOpenChange,
}: TransactionDetailsProps) {
  const { formatAmount } = useSettings();
  if (!transaction) return null;

  const isIncome = transaction.type === "income";
  const isSubscription = transaction.type === "subscription";

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case "free_trial":
        return "Essai gratuit";
      case "monthly":
        return "Mensuel";
      case "yearly":
        return "Annuel";
      default:
        return period;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-[425px] mx-auto rounded-xl bg-card">
        <DialogHeader className="space-y-6">
          <DialogTitle className="text-lg font-medium text-center">
            Détails de la transaction
          </DialogTitle>
          
          <div className="flex items-center justify-center gap-4">
            <div
              className={cn(
                "p-2 rounded-full",
                isIncome ? "bg-success/20" : isSubscription ? "bg-blue-500/20" : "bg-danger/20"
              )}
            >
              {isIncome ? (
                <ArrowUpIcon className="h-5 w-5 text-success" />
              ) : isSubscription ? (
                <ArrowDownIcon className="h-5 w-5 text-blue-500" />
              ) : (
                <ArrowDownIcon className="h-5 w-5 text-danger" />
              )}
            </div>
            <span
              className={cn(
                "text-xl font-medium",
                isIncome ? "text-success" : isSubscription ? "text-blue-500" : "text-danger"
              )}
            >
              {(isIncome ? "+" : "-") + formatAmount(transaction.amount)}
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          <div>
            <h3 className="text-sm text-muted-foreground">
              Description
            </h3>
            <p className="mt-1">{transaction.description}</p>
          </div>

          {isSubscription && transaction.subscription && (
            <div>
              <h3 className="text-sm text-muted-foreground">
                Service
              </h3>
              <p className="mt-1">{transaction.subscription.service}</p>
              <h3 className="text-sm text-muted-foreground mt-4">
                Période
              </h3>
              <p className="mt-1">{getPeriodLabel(transaction.subscription.period)}</p>
            </div>
          )}

          <div>
            <h3 className="text-sm text-muted-foreground">
              Catégorie
            </h3>
            <p className="mt-1">{transaction.category}</p>
          </div>

          <div>
            <h3 className="text-sm text-muted-foreground">
              Date
            </h3>
            <p className="mt-1">
              {new Date(transaction.date).toLocaleDateString("fr-FR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {transaction.note && (
            <div>
              <h3 className="text-sm text-muted-foreground">
                Note
              </h3>
              <p className="mt-1">{transaction.note}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
