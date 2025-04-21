import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/hooks/useSettings";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get("mode") === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { settings, formatAmount, formatDate } = useSettings();

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate("/");
      }
    });
  }, [navigate]);

  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "signup") {
      setIsSignUp(true);
    }
  }, [searchParams]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName) {
      setError("Le nom complet est requis");
      return;
    }
    //l'authentification
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
    } else if (data.user) {
      // Le trigger handle_new_user s'occupera de créer le profil
      navigate("/");
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    //la connexion
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
    }
  };

  // Formater un montant
  const amount = formatAmount(1234.56);

  // Formater une date
  const date = formatDate(new Date());

  // Accéder aux paramètres

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">BudgetZen</h2>
          <p className="mt-2 text-sm text-gray-600">
            Gérez vos finances en toute simplicité
          </p>
        </div>

        <div className="mt-8">
          <div className="flex justify-center space-x-4 mb-8">
            <Button
              variant={isSignUp ? "outline" : "default"}
              onClick={() => setIsSignUp(false)}
            >
              Se connecter
            </Button>
            <Button
              variant={isSignUp ? "default" : "outline"}
              onClick={() => setIsSignUp(true)}
            >
              S'inscrire
            </Button>
          </div>

          <form onSubmit={isSignUp ? handleSignUp : handleSignIn}>
            <div className="space-y-6">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-black">Nom complet</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Lamine xxxx"
                    className="bg-white text-black placeholder:text-gray-400"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-black">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white text-black placeholder:text-gray-400"
                  placeholder="exemple@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-black">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white text-black placeholder:text-gray-400"
                  placeholder="Votre mot de passe"
                  required
                />
              </div>

              {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

              <Button type="submit" className="w-full">
                {isSignUp ? "S'inscrire" : "Se connecter"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
