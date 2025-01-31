import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useAnimations } from "@/hooks/useAnimations";
import { useSettings } from "@/hooks/useSettings";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import {
  subDays,
  subMonths,
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfYear,
  format,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
} from "date-fns";
import { fr } from "date-fns/locale";
import type { Transaction } from "@/types/finance";
import { DateRange } from "react-day-picker";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRangePicker } from "@/components/DateRangePicker";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type Period = "day" | "week" | "month" | "year";
type ChartType = "bar" | "line" | "area";

export default function Statistics() {
  const { fadeIn } = useAnimations();
  const { formatAmount } = useSettings();
  const [period, setPeriod] = useState<Period>("month");
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minAmount, setMinAmount] = useState<string>("");
  const [maxAmount, setMaxAmount] = useState<string>("");

  // 1. Récupérer les transactions
  const {
    data: transactions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: true });
      if (error) throw error;
      return data as Transaction[];
    },
  });

  // 2. Filtrer les transactions
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesDateRange =
      !dateRange ||
      (new Date(transaction.date) >= dateRange.from! &&
        new Date(transaction.date) <= dateRange.to!);
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(transaction.category);
    const matchesAmount =
      (!minAmount || transaction.amount >= parseFloat(minAmount)) &&
      (!maxAmount || transaction.amount <= parseFloat(maxAmount));
    return matchesDateRange && matchesCategory && matchesAmount;
  });

  // 3. Calculer les statistiques
  const categories = Array.from(new Set(transactions.map((t) => t.category)));

  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyAverage = totalExpenses / 12;

  const maxExpense = Math.max(
    ...filteredTransactions
      .filter((t) => t.type === "expense")
      .map((t) => t.amount),
    0
  );

  // Fonction pour obtenir la date de début selon la période
  const getStartDate = (period: Period) => {
    const now = new Date();
    switch (period) {
      case "day":
        return subDays(now, 30);
      case "week":
        return subMonths(now, 3);
      case "month":
        return subMonths(now, 12);
      case "year":
        return subMonths(now, 36);
    }
  };

  // Fonction pour formater les données selon la période
  const formatChartData = () => {
    const startDate = getStartDate(period);
    const endDate = new Date();

    let intervals;
    let formatStr;

    switch (period) {
      case "day":
        intervals = eachDayOfInterval({ start: startDate, end: endDate });
        formatStr = "d MMM";
        break;
      case "week":
        intervals = eachWeekOfInterval({ start: startDate, end: endDate });
        formatStr = "'S'w MMM";
        break;
      case "month":
        intervals = eachMonthOfInterval({ start: startDate, end: endDate });
        formatStr = "MMM yyyy";
        break;
      case "year":
        intervals = eachMonthOfInterval({ start: startDate, end: endDate });
        formatStr = "yyyy";
        break;
    }

    return intervals.map((date) => {
      const periodTransactions = transactions.filter((t) => {
        const tDate = new Date(t.date);
        switch (period) {
          case "day":
            return startOfDay(tDate).getTime() === startOfDay(date).getTime();
          case "week":
            return startOfWeek(tDate).getTime() === date.getTime();
          case "month":
            return (
              startOfMonth(tDate).getTime() === startOfMonth(date).getTime()
            );
          case "year":
            return startOfYear(tDate).getTime() === startOfYear(date).getTime();
        }
      });

      const incomes = periodTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
      const expenses = periodTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        date: format(date, formatStr, { locale: fr }),
        revenus: incomes,
        dépenses: expenses,
        solde: incomes - expenses,
      };
    });
  };

  // Données pour le graphique par catégorie
  const categoryData = Array.from(
    transactions.reduce((acc, transaction) => {
      const current = acc.get(transaction.category) || {
        revenus: 0,
        dépenses: 0,
      };
      if (transaction.type === "income") {
        current.revenus += transaction.amount;
      } else {
        current.dépenses += transaction.amount;
      }
      acc.set(transaction.category, current);
      return acc;
    }, new Map())
  ).map(([category, data]) => ({
    category,
    ...data,
  }));

  const chartData = formatChartData();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-2 shadow-lg">
          {payload.map((item: any) => (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span>
                {item.name}: {formatAmount(item.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const ChartComponent =
      chartType === "bar"
        ? BarChart
        : chartType === "line"
        ? LineChart
        : AreaChart;

    return (
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {chartType === "bar" ? (
            <>
              <Bar dataKey="revenus" fill="#22c55e" />
              <Bar dataKey="dépenses" fill="#ef4444" />
            </>
          ) : chartType === "line" ? (
            <>
              <Line
                type="monotone"
                dataKey="revenus"
                stroke="#22c55e"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="dépenses"
                stroke="#ef4444"
                strokeWidth={2}
              />
            </>
          ) : (
            <>
              <Area
                type="monotone"
                dataKey="revenus"
                fill="#22c55e"
                stroke="#22c55e"
                fillOpacity={0.3}
              />
              <Area
                type="monotone"
                dataKey="dépenses"
                fill="#ef4444"
                stroke="#ef4444"
                fillOpacity={0.3}
              />
            </>
          )}
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <p>Chargement des données...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <p className="text-red-500">
          Erreur: Impossible de charger les données
        </p>
      </div>
    );
  }

  return (
    <motion.div 
      {...fadeIn} 
      className="min-h-[calc(100vh-theme(spacing.16))] max-w-full overflow-x-hidden"
    >
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-4 w-full max-w-[100vw] overflow-x-hidden">
          {/* En-tête et filtres */}
          <div className="col-span-12 flex flex-wrap items-center justify-between gap-4 bg-card rounded-xl shadow-sm">
            <h1 className="text-3xl font-bold tracking-tight">Statistiques</h1>
            <div className="flex flex-wrap items-center gap-4">
              <DateRangePicker date={dateRange} onSelect={setDateRange} />
              <Select
                value={period}
                onValueChange={(value) => setPeriod(value as Period)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Jour</SelectItem>
                  <SelectItem value="week">Semaine</SelectItem>
                  <SelectItem value="month">Mois</SelectItem>
                  <SelectItem value="year">Année</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={chartType}
                onValueChange={(value) => setChartType(value as ChartType)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Barres</SelectItem>
                  <SelectItem value="line">Ligne</SelectItem>
                  <SelectItem value="area">Aires</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Cartes de résumé */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <Card className="bg-gradient-to-br from-green-500/10 via-green-500/5 to-background border-2 border-green-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Revenus Totaux
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  {formatAmount(totalIncome)}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-red-500/10 via-red-500/5 to-background border-2 border-red-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Dépenses Totales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">
                  {formatAmount(totalExpenses)}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-2 border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {formatAmount(totalIncome - totalExpenses)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Graphiques */}
          <div className="col-span-12 lg:col-span-9 grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Card className="col-span-1 xl:col-span-2">
              <CardHeader>
                <CardTitle>
                  Évolution{" "}
                  {period === "day"
                    ? "journalière"
                    : period === "week"
                    ? "hebdomadaire"
                    : period === "month"
                    ? "mensuelle"
                    : "annuelle"}
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">{renderChart()}</CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Répartition des Dépenses</CardTitle>
              </CardHeader>
              <CardContent className="h-[250px]">
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart data={categoryData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="category" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="dépenses" name="Montant" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Répartition Revenus/Dépenses</CardTitle>
              </CardHeader>
              <CardContent className="h-[250px]">
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart 
                    data={categoryData}
                    layout="vertical"
                    margin={{ left: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      dataKey="category" 
                      type="category" 
                      width={100}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar 
                      dataKey="revenus" 
                      name="Revenus" 
                      stackId="a" 
                      fill="#22c55e" 
                    />
                    <Bar 
                      dataKey="dépenses" 
                      name="Dépenses" 
                      stackId="a" 
                      fill="#ef4444" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
