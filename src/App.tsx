import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import { Layout } from "@/components/Layout";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Settings from "@/pages/Settings";
import Transactions from "@/pages/Transactions";
import Calendar from "@/pages/Calendar";
import Statistics from "@/pages/Statistics";
import { Suspense, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useToast } from "@/components/ui/use-toast";
import Welcome from "@/pages/Welcome";
import Assistant from "@/pages/Assistant";
import { ThemeProvider } from "next-themes";

// Configuration de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ErrorFallback({ error }: { error: Error }) {
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: "Erreur",
      description: error.message,
      variant: "destructive",
    });
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Une erreur est survenue</h1>
        <p className="text-muted-foreground">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md"
        >
          Recharger la page
        </button>
      </div>
    </div>
  );
}

// Composant racine qui utilise le hook useUser
function AppContent() {
  const user = useUser();

  return (
    <BrowserRouter>
      <TooltipProvider>
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                <Layout>
                  <Dashboard />
                </Layout>
              ) : (
                <Welcome />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              user ? (
                <Layout>
                  <Dashboard />
                </Layout>
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />
          <Route
            path="/settings"
            element={
              user ? (
                <Layout>
                  <Settings />
                </Layout>
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />
          <Route
            path="/auth"
            element={!user ? <Auth /> : <Navigate to="/dashboard" replace />}
          />
          <Route
            path="/transactions"
            element={
              user ? (
                <Layout>
                  <Transactions />
                </Layout>
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />
          <Route
            path="/calendar"
            element={
              user ? (
                <Layout>
                  <Calendar />
                </Layout>
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />
          <Route
            path="/stats"
            element={
              user ? (
                <Layout>
                  <Statistics />
                </Layout>
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />
          <Route
            path="/assistant"
            element={
              user ? (
                <Layout>
                  <Assistant />
                </Layout>
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />
        </Routes>
        <Toaster />
      </TooltipProvider>
    </BrowserRouter>
  );
}

// Composant App qui fournit les contextes
function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        }
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <QueryClientProvider client={queryClient}>
            <SessionContextProvider supabaseClient={supabase}>
              <AppContent />
            </SessionContextProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
