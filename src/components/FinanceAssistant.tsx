import { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { Send, Bot } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Transaction } from "@/types/finance";
import { useUser } from "@supabase/auth-helpers-react";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSettings } from "@/hooks/useSettings";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface FinanceAssistantProps {
  transactions?: Transaction[];
  currentConversation: SavedConversation | null;
  onConversationSaved: (conversation: SavedConversation) => void;
}

interface SavedConversation {
  id: string;
  title: string;
  messages: Message[];
  timestamp: Date;
}

export function FinanceAssistant({ 
  transactions, 
  currentConversation,
  onConversationSaved 
}: FinanceAssistantProps) {
  const user = useUser();
  const { settings, formatAmount } = useSettings();
  const [userName, setUserName] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [savedConversations, setSavedConversations] = useState<SavedConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user) {
      const fullName = user.user_metadata?.full_name;
      setUserName(fullName ? ` de ${fullName}` : "");
    }
  }, [user]);

  const formatTransactionsContext = () => {
    if (!transactions?.length) return "Aucune transaction disponible.";
    
    // Organiser les transactions par mois
    const transactionsByMonth = transactions.reduce((acc, t) => {
      const date = new Date(t.date);
      const monthYear = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      acc[monthYear].push({
        ...t,
        formattedDate: date.toLocaleDateString('fr-FR', { 
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      });
      return acc;
    }, {} as Record<string, any[]>);

    // Formater le contexte
    return `Voici vos transactions organisées par mois :
      ${Object.entries(transactionsByMonth).map(([month, monthTransactions]) => `
      ${month}:
      ${monthTransactions.map(t => 
        `- Le ${t.formattedDate}: ${t.type === 'income' ? 'Revenu' : 'Dépense'} de ${formatAmount(t.amount)} pour "${t.description}" (${t.category})`
      ).join('\n      ')}`
      ).join('\n')}
    `;
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    try {
      setIsLoading(true);
      
      // Debug en production
      console.log('Checking API key...');
      const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
      console.log('API Key exists:', !!apiKey);

      if (!apiKey) {
        throw new Error("La clé API Google n'est pas configurée sur le serveur");
      }

      const userMessage = { role: "user" as const, content: input };
      setMessages(prev => [...prev, userMessage]);
      setInput("");

      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Tu es un assistant financier expert. Voici le contexte :

              1. Rôle : Tu dois aider à analyser les transactions, donner des conseils financiers personnalisés 
              et répondre aux questions sur la gestion d'argent.

              2. Transactions actuelles :
              ${formatTransactionsContext()}

              3. Directives :
              - Si tu vois une dépense d'alimentation, suggère des moyens d'optimiser ce type de dépense
              - Pour les dépenses régulières comme le loyer, aide à vérifier si les paiements sont faits
              - Donne des conseils pratiques basés sur les habitudes de dépenses visibles
              - Si tu ne vois pas certaines transactions, propose d'en garder trace pour le futur
              - Sois précis sur les dates et les montants quand tu les mentionnes

              4. Question de l'utilisateur : ${input}

              Réponds de manière utile et constructive, même si tu n'as pas toutes les informations.
              Si tu ne vois pas certaines transactions, suggère des moyens d'améliorer le suivi des dépenses.`
            }]
          }]
        }),
      });

      // Log des erreurs en production
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(`Erreur API (${response.status}): ${errorData.error?.message || 'Erreur inconnue'}`);
      }

      const data = await response.json();
      const assistantMessage = {
        role: "assistant" as const,
        content: data.candidates[0].content.parts[0].text,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Error details:', error);
      toast({
        title: "Erreur",
        description: "Erreur de connexion à l'API. Contactez l'administrateur.",
        variant: "destructive",
      });
      setInput(input);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les conversations sauvegardées
  useEffect(() => {
    if (user) {
      const loadSavedConversations = async () => {
        try {
          const { data, error } = await supabase
            .from('conversations')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10);
          
          if (error) {
            throw error;
          }
          
          if (data) {
            setSavedConversations(data);
          }
        } catch (error) {
          console.error('Erreur de chargement:', error);
          toast({
            title: "Erreur",
            description: "Impossible de charger les conversations",
            variant: "destructive",
          });
        }
      };
      
      loadSavedConversations();
    }
  }, [user]);

  // Charger la conversation courante quand elle change
  useEffect(() => {
    if (currentConversation) {
      setMessages(currentConversation.messages);
      setSelectedConversation(currentConversation.id);
    } else {
      setMessages([]); // Reset messages for new chat
    }
  }, [currentConversation]);

  // Modifier saveConversation pour utiliser onConversationSaved
  const saveConversation = async () => {
    if (!user || messages.length === 0) return;

    setIsSaving(true);
    try {
      const title = messages[0].content.slice(0, 30) + "...";
      const timestamp = new Date().toISOString();
      
      const newConversation = {
        id: Date.now().toString(),
        user_id: user.id,
        title,
        messages,
        timestamp,
        created_at: timestamp
      };

      const { data, error } = await supabase
        .from('conversations')
        .insert([newConversation])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
      }

      onConversationSaved(data); // Notifier le parent
      toast({
        title: "Succès",
        description: "Conversation sauvegardée",
      });
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder la conversation",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Charger une conversation
  const loadConversation = (conversation: SavedConversation) => {
    setMessages(conversation.messages);
    setSelectedConversation(conversation.id);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-full">
      {/* Chat principal */}
      <Card className="md:col-span-3 flex flex-col h-full bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60 overflow-hidden">
        <CardHeader className="flex-none border-b bg-background/95 sticky  md:top-0 z-20">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
              Assistant{userName}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={saveConversation}
              disabled={messages.length === 0 || isSaving}
              className="bg-background/95"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                  Sauvegarde...
                </>
              ) : (
                "Sauvegarder"
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-4 flex flex-col">
          <ScrollArea className="flex-1 -mr-4 pr-4">
            <div className="space-y-4 pb-4">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl p-4 shadow-sm break-words whitespace-pre-wrap",
                      message.role === "user" 
                        ? "bg-primary text-primary-foreground ml-12" 
                        : "bg-muted mr-12"
                    )}
                  >
                    {message.content}
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Zone de saisie fixe en bas */}
          <div className="flex gap-2 mt-4 pt-4 border-t bg-background/95">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Posez une question sur vos finances..."
              disabled={isLoading}
              className="flex-1 transition-all focus:scale-[1.02]"
            />
            <Button 
              onClick={sendMessage} 
              disabled={isLoading}
              className="flex-none bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 