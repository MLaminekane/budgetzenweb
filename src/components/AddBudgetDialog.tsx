import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Transaction } from "@/types/finance";
import { useSettings } from "@/hooks/useSettings";

interface AddBudgetDialogProps {
  onAddBudget: (data: {
    category: string;
    amount: number;
    period: "monthly" | "yearly";
  }) => void;
  className?: string;
  transactions?: Transaction[];
}

export function AddBudgetDialog({
  onAddBudget,
  className,
  transactions = [],
}: AddBudgetDialogProps) {
  const { formatAmount } = useSettings();
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");
  const [suggestions, setSuggestions] = useState<{ category: string; amount: number }[]>([]);

  useEffect(() => {
    // Calculer les dépenses moyennes par catégorie
    const categoryExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, transaction) => {
        const month = new Date(transaction.date).getMonth();
        const year = new Date(transaction.date).getFullYear();
        const key = `${transaction.category}`;
        if (!acc[key]) {
          acc[key] = {
            total: 0,
            months: new Set(),
          };
        }
        acc[key].total += transaction.amount;
        acc[key].months.add(`${year}-${month}`);
        return acc;
      }, {} as Record<string, { total: number; months: Set<string> }>);

    // Créer les suggestions de budget
    const newSuggestions = Object.entries(categoryExpenses).map(([category, data]) => ({
      category,
      amount: Math.ceil(data.total / data.months.size), // Moyenne mensuelle arrondie
    }));

    setSuggestions(newSuggestions);
  }, [transactions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddBudget({
      category,
      amount: parseFloat(amount),
      period,
    });
    setCategory("");
    setAmount("");
    setPeriod("monthly");
  };

  const handleCategorySelect = (selectedCategory: string) => {
    setCategory(selectedCategory);
    const suggestion = suggestions.find((s) => s.category === selectedCategory);
    if (suggestion) {
      setAmount(suggestion.amount.toString());
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un budget
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter un Budget</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="category">Catégorie</Label>
            <div className="space-y-2">
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-12"
                required
                list="categories"
              />
              <datalist id="categories">
                {suggestions.map((suggestion) => (
                  <option key={suggestion.category} value={suggestion.category}>
                    {suggestion.category} (Moy. {formatAmount(suggestion.amount)}/mois)
                  </option>
                ))}
              </datalist>
              {suggestions.length > 0 && (
                <div className="mt-2 space-y-1">
                  <Label className="text-sm text-muted-foreground">Suggestions basées sur vos dépenses :</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {suggestions.map((suggestion) => (
                      <Button
                        key={suggestion.category}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs justify-start overflow-hidden"
                        onClick={() => handleCategorySelect(suggestion.category)}
                      >
                        {suggestion.category}
                        <span className="ml-1 text-muted-foreground">
                          ({formatAmount(suggestion.amount)})
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Montant</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-12"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant={period === "monthly" ? "default" : "outline"}
              className="h-12 text-base"
              onClick={() => setPeriod("monthly")}
            >
              Mensuel
            </Button>
            <Button
              type="button"
              variant={period === "yearly" ? "default" : "outline"}
              className="h-12 text-base"
              onClick={() => setPeriod("yearly")}
            >
              Annuel
            </Button>
          </div>
          <Button type="submit" className="w-full h-12 text-base">
            Ajouter
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
