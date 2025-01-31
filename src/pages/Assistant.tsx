import { motion } from "framer-motion";
import { useAnimations } from "@/hooks/useAnimations";
import { FinanceAssistant } from "@/components/FinanceAssistant";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Transaction } from "@/types/finance";
import { Trash2, Plus, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface SavedConversation {
  id: string;
  title: string;
  messages: any[];
  timestamp: string;
}

export default function Assistant() {
  const { fadeIn } = useAnimations();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [savedConversations, setSavedConversations] = useState<SavedConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [currentConversation, setCurrentConversation] = useState<SavedConversation | null>(null);
  const { toast } = useToast();

  // Charger les conversations
  const loadConversations = async () => {
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (data) {
      setSavedConversations(data);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const { data: transactions } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return data as Transaction[];
    },
  });

  const handleLoadConversation = (conversation: SavedConversation) => {
    setCurrentConversation(conversation);
    setSelectedConversation(conversation.id);
    setSidebarOpen(false); // Ferme le drawer sur mobile
  };

  const handleDeleteConversation = async (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation(); // Empêche le chargement de la conversation lors du clic sur la corbeille
    
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;

      // Mettre à jour l'état local
      setSavedConversations(prev => prev.filter(conv => conv.id !== conversationId));
      
      // Si la conversation supprimée est la conversation courante, réinitialiser
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
        setSelectedConversation(null);
      }

      toast({
        title: "Succès",
        description: "Conversation supprimée",
      });
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer la conversation",
        variant: "destructive",
      });
    }
  };

  const handleNewChat = () => {
    setCurrentConversation(null);
    setSelectedConversation(null);
    setSidebarOpen(false);
  };

  // Gérer la sauvegarde d'une nouvelle conversation
  const handleConversationSaved = (conversation: SavedConversation) => {
    setSavedConversations(prev => [conversation, ...prev.slice(0, 7)]);
    setCurrentConversation(conversation);
    setSelectedConversation(conversation.id);
  };

  return (
    <motion.div {...fadeIn} className="h-[calc(100vh-5rem)] overflow-hidden bg-gradient-to-b from-background to-background/80">
      {/* Header mobile */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-background/95 fixed top-[4rem] left-0 right-0 z-30">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Assistant AI</h1>
        <Button variant="ghost" size="icon" onClick={handleNewChat}>
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex h-full relative pt-[4rem] md:pt-0">
        {/* Sidebar - sur mobile, devient un drawer qui slide depuis la gauche */}
        <div 
          className={cn(
            "fixed md:relative left-0 top-[8rem] md:top-0 h-[calc(100vh-8rem)] md:h-full w-full md:w-80 border-r bg-background/95 backdrop-blur transition-all duration-300 z-20",
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}
        >
          <div className="hidden md:flex items-center justify-between p-4 pt-32 border-b">
            <h2 className="font-semibold">Conversations récentes</h2>
            <Button variant="ghost" size="icon" onClick={handleNewChat}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="h-[calc(100%-5rem)]">
            <div className="px-4 py-2 space-y-2">
              {savedConversations.map((conv) => (
                <div key={conv.id} className="group">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      className={cn(
                        "flex-1 text-left text-sm p-3 rounded-lg transition-colors",
                        currentConversation?.id === conv.id 
                          ? "bg-primary/10 hover:bg-primary/15" 
                          : "hover:bg-muted"
                      )}
                      onClick={() => handleLoadConversation(conv)}
                    >
                      <div className="flex flex-col gap-1 w-full overflow-hidden">
                        <div className="font-medium truncate">
                          {conv.title}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <span>{new Date(conv.timestamp).toLocaleDateString('fr-FR')}</span>
                          <span>•</span>
                          <span>{new Date(conv.timestamp).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                        </div>
                      </div>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handleDeleteConversation(e, conv.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <Separator className="my-2" />
                </div>
              ))}
              {savedConversations.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Aucune conversation sauvegardée
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Overlay sombre quand le sidebar est ouvert sur mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-10 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Zone principale */}
        <div className="flex-1 w-full md:w-auto">
          <div className="h-full p-4 md:p-6 md:pt-24">
            <FinanceAssistant 
              transactions={transactions}
              currentConversation={currentConversation}
              onConversationSaved={handleConversationSaved}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
} 