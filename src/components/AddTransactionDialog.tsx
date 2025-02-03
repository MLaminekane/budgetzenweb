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
import { TransactionType, SubscriptionPeriod } from "@/types/finance";
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
    subscription?: {
      period: SubscriptionPeriod;
      service: string;
    };
  }) => void;
  defaultDate?: Date;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

const SUBSCRIPTION_SERVICES = [
  "Spotify",
  "Apple Music",
  "Netflix",
  "Disney+",
  "Amazon Prime",
  "YouTube Premium",
  "Clash Royale",
  "PlayStation Plus",
  "Xbox Game Pass",
  "Nintendo Switch Online",
  "Autre",
];

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
  const [subscriptionPeriod, setSubscriptionPeriod] = useState<SubscriptionPeriod>("monthly");
  const [subscriptionService, setSubscriptionService] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation des champs
    if (!amount || parseFloat(amount) <= 0) {
      return;
    }

    if (!category) {
      return;
    }

    if (type === "subscription" && !subscriptionService) {
      return;
    }

    if (type !== "subscription" && !description) {
      return;
    }
    
    const transactionData = {
      type,
      amount: parseFloat(amount),
      description: type === "subscription" ? `Abonnement ${subscriptionService}` : description,
      category,
      ...(type === "subscription" && {
        subscription: {
          period: subscriptionPeriod,
          service: subscriptionService,
        },
      }),
    };

    onAddTransaction(transactionData);
    setAmount("");
    setDescription("");
    setCategory("");
    setSubscriptionService("");
    setSubscriptionPeriod("monthly");
    onOpenChange?.(false);
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
          <div className="grid grid-cols-3 gap-2">
            <Button
              type="button"
              variant={type === "income" ? "default" : "outline"}
              onClick={() => setType("income")}
              className="text-sm"
              aria-label="Revenu"
            >
              Revenu
            </Button>
            <Button
              type="button"
              variant={type === "expense" ? "default" : "outline"}
              onClick={() => setType("expense")}
              className="text-sm"
              aria-label="Dépense"
            >
              Dépense
            </Button>
            <Button
              type="button"
              variant={type === "subscription" ? "default" : "outline"}
              onClick={() => setType("subscription")}
              className="text-sm"
              aria-label="Abonnement"
            >
              Abonnement
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
              aria-label="Montant de la transaction"
              min="0"
            />
          </div>

          {type === "subscription" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="subscription-service">Service</Label>
                <Select 
                  value={subscriptionService} 
                  onValueChange={setSubscriptionService} 
                  required
                  name="subscription-service"
                >
                  <SelectTrigger id="subscription-service" aria-label="Sélectionner un service d'abonnement">
                    <SelectValue placeholder="Sélectionner un service" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBSCRIPTION_SERVICES.map((service) => (
                      <SelectItem key={service} value={service}>
                        {service}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subscription-period">Période</Label>
                <Select 
                  value={subscriptionPeriod} 
                  onValueChange={setSubscriptionPeriod} 
                  required
                  name="subscription-period"
                >
                  <SelectTrigger id="subscription-period" aria-label="Sélectionner une période d'abonnement">
                    <SelectValue placeholder="Sélectionner une période" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free_trial">Essai gratuit</SelectItem>
                    <SelectItem value="monthly">Mensuel</SelectItem>
                    <SelectItem value="yearly">Annuel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required={type !== "subscription"}
                aria-label="Description de la transaction"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="category">Catégorie</Label>
            <Select 
              value={category} 
              onValueChange={setCategory} 
              required
              name="category"
            >
              <SelectTrigger id="category" aria-label="Sélectionner une catégorie">
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

          <Button 
            type="submit" 
            className="w-full"
            aria-label="Ajouter la transaction"
          >
            Ajouter
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
