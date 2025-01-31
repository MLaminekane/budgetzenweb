import { create } from "zustand";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useEffect } from "react";
import { formatCurrency } from "@/lib/currency";

interface Settings {
  currency: string;
  categories: string[];
  notifications: {
    expenses: boolean;
    subscriptions: boolean;
    budgets: boolean;
  };
  avatar_url: string | null;
}

interface SettingsStore {
  settings: Settings;
  isLoading: boolean;
  setSettings: (settings: Partial<Settings>) => void;
  initializeSettings: () => Promise<void>;
  saveSettings: (settings: Partial<Settings>) => Promise<void>;
  resetSettings: () => Promise<void>;
}

const defaultSettings: Settings = {
  currency: "EUR",
  categories: [],
  notifications: {
    expenses: true,
    subscriptions: true,
    budgets: true,
  },
  avatar_url: null,
};

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: defaultSettings,
  isLoading: true,
  setSettings: (newSettings) =>
    set((state) => ({
      settings: {
        ...state.settings,
        ...newSettings,
        ...(newSettings.categories && { categories: newSettings.categories }),
      },
    })),
  initializeSettings: async () => {},
  saveSettings: async () => {},
  resetSettings: async () => {},
}));

export const useSettings = () => {
  const supabase = useSupabaseClient();
  const user = useUser();
  const { settings, setSettings, isLoading } = useSettingsStore();

  const initializeSettings = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      // Créer les paramètres par défaut si ils n'existent pas
      await supabase.from("user_settings").insert({
        user_id: user.id,
        ...defaultSettings,
      });
      setSettings(defaultSettings);
    } else {
      setSettings(data);
    }
  };

  const saveSettings = async (newSettings: Partial<Settings>) => {
    if (!user) return;

    try {
      // Mettre à jour l'état local d'abord pour une meilleure UX
      const updatedSettings = {
        ...settings,
        ...newSettings,
        ...(newSettings.categories && { categories: newSettings.categories }),
      };

      setSettings(updatedSettings);

      const { error } = await supabase
        .from("user_settings")
        .update({
          ...newSettings,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) {
        // En cas d'erreur, revenir à l'état précédent
        throw error;
      }
    } catch (error) {
      // Recharger les données depuis la base en cas d'erreur
      const { data } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setSettings(data);
      }
      throw error;
    }
  };

  const resetSettings = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("user_settings")
      .update(defaultSettings)
      .eq("user_id", user.id);

    if (!error) {
      setSettings(defaultSettings);
    }
    return error;
  };

  const formatAmount = (amount: number) => {
    return formatCurrency(amount, settings.currency);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  useEffect(() => {
    if (user) {
      initializeSettings();
    }
  }, [user]);

  return {
    settings,
    isLoading,
    saveSettings,
    resetSettings,
    formatAmount,
    formatDate,
  };
};
