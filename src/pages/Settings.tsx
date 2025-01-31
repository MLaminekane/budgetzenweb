import { useState, useEffect } from "react";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { motion } from "framer-motion";
import { useAnimations } from "@/hooks/useAnimations";
import { useSettings } from "@/hooks/useSettings";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useToast } from "@/components/ui/use-toast";
import {
  User,
  Bell,
  Moon,
  Sun,
  Palette,
  Shield,
  Tags,
  Users,
  LogOut,
  Trash2,
} from "lucide-react";
import { UserProfile } from "@/types/user";

const currencies = [
  { value: "XOF", label: "Franc CFA (XOF)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "USD", label: "Dollar américain (USD)" },
  { value: "CAD", label: "Dollar canadien (CAD)" },
];

const themes = [
  { value: "light", label: "Clair" },
  { value: "dark", label: "Sombre" },
  { value: "system", label: "Système" },
];

export default function Settings() {
  const { fadeIn } = useAnimations();
  const { toast } = useToast();
  const user = useUser();
  const supabase = useSupabaseClient();
  const { theme, setTheme } = useTheme();
  const { settings, saveSettings, resetSettings } = useSettings();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  // Charger le profil et l'avatar au démarrage
  useEffect(() => {
    if (user) {
      const loadProfile = async () => {
        // Récupérer les metadata de l'utilisateur qui contient le full_name
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (!error && data) {
          setProfile({
            ...data,
            // Utiliser le full_name des metadata d'authentification
            full_name: authUser?.user_metadata?.full_name || "",
          });
          setAvatarUrl(data.avatar_url);
        }
      };

      loadProfile();
    }
  }, [user, supabase]);

  // Fonction pour gérer les changements des paramètres
  const handleSettingChange = async (changes: Partial<Settings>) => {
    try {
      await saveSettings({
        ...settings,
        ...changes,
      });
      toast({
        title: "Succès",
        description: "Paramètres mis à jour",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les paramètres",
        variant: "destructive",
      });
    }
  };

  // Fonction pour mettre à jour le profil
  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;

    setIsLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update(data)
      .eq("id", user.id);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Succès",
        description: "Profil mis à jour avec succès",
      });
      setProfile((prev) => (prev ? { ...prev, ...data } : null));
    }
    setIsLoading(false);
  };

  // Fonction pour gérer l'upload d'avatar
  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      const file = event.target.files?.[0];
      if (!file || !user) return;

      setIsLoading(true);

      // 1. Vérifier la taille et le type du fichier
      if (file.size > 2 * 1024 * 1024) {
        // 2MB max
        throw new Error("L'image est trop volumineuse. Taille maximum: 2MB");
      }

      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        throw new Error("Type de fichier non supporté. Utilisez JPG ou PNG");
      }

      // 2. Upload du fichier dans le bucket storage
      const fileExt = file.type.split("/")[1];
      const fileName = `avatar-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${user.id}/${fileName}`;

      // 3. Supprimer l'ancien avatar si existe
      if (avatarUrl) {
        const oldFilePath = avatarUrl.split("/").pop();
        if (oldFilePath) {
          await supabase.storage
            .from("avatars")
            .remove([`${user.id}/${oldFilePath}`]);
        }
      }

      // 4. Upload du nouveau fichier
      const { error: uploadError, data } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      // 5. Obtenir l'URL publique
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // 6. Mettre à jour le profil
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // 7. Mettre à jour l'état local
      setAvatarUrl(publicUrl);
      setProfile((prev) => (prev ? { ...prev, avatar_url: publicUrl } : null));

      toast({
        title: "Succès",
        description: "Avatar mis à jour avec succès",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour l'avatar",
        variant: "destructive",
      });
      console.error("Erreur lors de l'upload de l'avatar:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour supprimer le compte
  const handleDeleteAccount = async () => {
    if (!user) return;

    setIsLoading(true);
    const { error } = await supabase.rpc("delete_user_account");

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le compte",
        variant: "destructive",
      });
    } else {
      await supabase.auth.signOut();
    }
    setIsLoading(false);
  };

  // Fonction pour ajouter une catégorie
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;

    const updatedCategories = [
      ...(settings.categories || []),
      newCategory.trim(),
    ];

    await handleSettingChange({ categories: updatedCategories });
    setNewCategory("");
  };

  // Fonction pour supprimer une catégorie
  const handleDeleteCategory = async (categoryToDelete: string) => {
    const updatedCategories = settings.categories.filter(
      (category) => category !== categoryToDelete
    );
    await handleSettingChange({ categories: updatedCategories });
  };

  // Fonction pour gérer la touche Entrée dans l'input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddCategory();
    }
  };

  // Fonction pour réinitialiser les paramètres
  const handleResetSettings = async () => {
    await resetSettings();
    toast({
      title: "Succès",
      description: "Paramètres réinitialisés avec succès",
    });
  };

  // Fonction pour gérer les changements du profil
  const handleProfileChange = (changes: Partial<UserProfile>) => {
    updateProfile(changes);
  };

  // Ajouter cette fonction dans le composant Settings
  const handleResetData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // Supprimer toutes les transactions
      const { error: transactionError } = await supabase
        .from("transactions")
        .delete()
        .eq("user_id", user.id);

      // Supprimer tous les budgets
      const { error: budgetError } = await supabase
        .from("budgets")
        .delete()
        .eq("user_id", user.id);

      if (transactionError || budgetError)
        throw new Error("Erreur lors de la réinitialisation");

      toast({
        title: "Succès",
        description: "Toutes vos transactions et budgets ont été réinitialisés",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de réinitialiser les données",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div {...fadeIn} className="max-w-full h-[calc(100vh-4rem)] overflow-hidden">
      <div className="container mx-auto p-4 h-full">
        <h1 className="text-2xl font-bold mb-4">Paramètres</h1>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[calc(100%-3rem)] overflow-y-auto">
          {/* Première ligne : Profil et Préférences */}
          <div className="md:col-span-4">
            <Card className="h-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={avatarUrl || undefined} />
                    <AvatarFallback>
                      {profile?.full_name?.charAt(0) || user?.email?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <Label htmlFor="avatar-upload">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        disabled={isLoading}
                      >
                        <span>
                          {isLoading ? "Chargement..." : "Changer l'avatar"}
                        </span>
                      </Button>
                    </Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={profile?.email || ""}
                    disabled={true}
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nom complet</Label>
                  <Input
                    value={user?.user_metadata?.full_name || ""}
                    disabled={true}
                    className="bg-muted"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-4">
            <Card className="h-auto lg:h-[calc(100%-4rem)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Préférences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Devise</Label>
                  <Select
                    value={settings.currency}
                    onValueChange={(value) =>
                      handleSettingChange({ currency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une devise" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Mode Thème</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un thème" />
                    </SelectTrigger>
                    <SelectContent>
                      {themes.map((theme) => (
                        <SelectItem key={theme.value} value={theme.value}>
                          {theme.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Deuxième ligne : Compte et Notifications */}
          <div className="md:col-span-4 md:col-start-1">
            <Card className="border-red-200 dark:border-red-800 h-auto">
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400">
                  Compte
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full border-yellow-600 text-foreground hover:bg-secondary"
                    >
                      Réinitialiser les données
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Réinitialiser toutes vos données ?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action supprimera toutes vos transactions et
                        budgets. Cette action est irréversible.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleResetData}
                        className="bg-black hover:bg-slate-600"
                      >
                        Réinitialiser
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                    >
                      Supprimer le compte
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Êtes-vous sûr de vouloir supprimer votre compte ?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action est irréversible. Toutes vos données seront
                        définitivement supprimées.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                      >
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-4">
            <Card className="h-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Alertes de dépenses</Label>
                  <Switch
                    checked={settings.notifications.expenses}
                    onCheckedChange={(checked) =>
                      handleSettingChange({
                        notifications: {
                          ...settings.notifications,
                          expenses: checked,
                        },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Rappels d'abonnements</Label>
                  <Switch
                    checked={settings.notifications.subscriptions}
                    onCheckedChange={(checked) =>
                      handleSettingChange({
                        notifications: {
                          ...settings.notifications,
                          subscriptions: checked,
                        },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Alertes de budget</Label>
                  <Switch
                    checked={settings.notifications.budgets}
                    onCheckedChange={(checked) =>
                      handleSettingChange({
                        notifications: {
                          ...settings.notifications,
                          budgets: checked,
                        },
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Catégories */}
          <div className="md:col-span-12 md:col-start-9 md:row-start-1 md:row-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tags className="h-5 w-5" />
                  Catégories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Nouvelle catégorie"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleAddCategory}
                    className="w-full sm:w-auto"
                    disabled={!newCategory.trim() || isLoading}
                  >
                    {isLoading ? "Ajout..." : "Ajouter"}
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-2 h-[calc(100vh-22rem)] overflow-y-auto">
                  {settings.categories?.map((category) => (
                    <div
                      key={category}
                      className="flex items-center justify-between p-2 rounded-lg border"
                    >
                      <span>{category}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteCategory(category)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
