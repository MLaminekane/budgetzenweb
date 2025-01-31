import { useState } from "react";
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
import { PlusIcon } from "lucide-react";
import { TransactionType } from "@/types/finance";
import { useSettings } from "@/hooks/useSettings";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddTransactionDialogProps {
  onAddTransaction: (data: {
    type: TransactionType;
    amount: number;
    description: string;
    category: string;
  }) => void;
  defaultDate?: Date;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export function AddTransactionDialog({
  onAddTransaction,
  defaultDate,
  open,
  onOpenChange,
  className,
}: AddTransactionDialogProps) {
  const { settings } = useSettings();
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return; // Empêcher la soumission si aucune catégorie n'est sélectionnée
    onAddTransaction({
      type,
      amount: parseFloat(amount),
      description,
      category,
    });
    setAmount("");
    setDescription("");
    setCategory("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className={className}>
        {!open && (
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </DialogTrigger>
        )}
      </div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter une Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant={type === "income" ? "default" : "outline"}
              onClick={() => setType("income")}
            >
              Revenu
            </Button>
            <Button
              type="button"
              variant={type === "expense" ? "default" : "outline"}
              onClick={() => setType("expense")}
            >
              Dépense
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Montant</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Catégorie</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {settings.categories?.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full">
            Ajouter
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
