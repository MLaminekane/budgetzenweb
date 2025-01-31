import { Transaction } from "@/types/finance";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon, Trash2 } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
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
import { Button } from "@/components/ui/button";

interface TransactionCardProps {
  transaction: Transaction;
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const { settings, formatAmount } = useSettings();
  const isIncome = transaction.type === "income";
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
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
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="mb-2 rounded-sm">
      <CardContent className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-full ${
              isIncome ? "bg-success/20" : "bg-danger/20"
            }`}
          >
            {isIncome ? (
              <ArrowUpIcon className="h-4 w-4 text-success" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 text-danger" />
            )}
          </div>
          <div>
            <p className="font-medium">{transaction.description}</p>
            <p className="text-sm text-gray-500">{transaction.category}</p>
          </div>
        </div>
        <div className="text-right">
          <p
            className={`font-medium ${
              isIncome ? "text-success" : "text-danger"
            }`}
          >
            {(isIncome ? "+" : "-") + formatAmount(transaction.amount)}
          </p>
          <p className="text-sm text-gray-500">
            {new Date(transaction.date).toLocaleDateString("fr-FR")}
          </p>
        </div>
      </CardContent>
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
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
