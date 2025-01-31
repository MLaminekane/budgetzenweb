import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChartBar, CreditCard, LineChart, Lock, Wallet } from "lucide-react";

const Welcome = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section avec animation */}
      <motion.header 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-4 pt-24 pb-16 text-center"
      >
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl h-20 font-bold mb-12 bg-gradient-to-r from-blue-600 to-teal-600 text-transparent bg-clip-text">
            BudgetZen
          </h1>
          <p className="text-2xl mb-12 text-gray-600 font-light " >
            Une solution moderne et intuitive pour prendre le contrôle de vos finances personnelles
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth?mode=signup">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                Créer un compte gratuitement
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 hover:bg-gray-50 transition-all duration-300">
                Se connecter
              </Button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Features Section avec animation */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="py-24 bg-white"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16 text-gray-800">
            Fonctionnalités principales
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={<Wallet className="w-10 h-10 text-blue-500" />}
              title="Gestion des budgets"
              description="Créez et gérez facilement vos budgets mensuels par catégorie"
            />
            <FeatureCard
              icon={<LineChart className="w-10 h-10 text-teal-500" />}
              title="Analyses détaillées"
              description="Visualisez vos dépenses avec des graphiques clairs et intuitifs"
            />
            <FeatureCard
              icon={<CreditCard className="w-10 h-10 text-indigo-500" />}
              title="Suivi des transactions"
              description="Suivez vos dépenses et revenus en temps réel"
            />
          </div>
        </div>
      </motion.section>

      {/* Security Section avec animation */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="py-24 bg-gradient-to-br from-gray-50 to-blue-50"
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto">
            <div className="md:w-1/2 mb-12 md:mb-0 md:pr-12">
              <h2 className="text-3xl font-bold mb-6 text-gray-800">
                Sécurité et confidentialité
              </h2>
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                Vos données financières sont protégées avec les plus hauts standards de sécurité.
                Nous utilisons Supabase pour garantir la confidentialité de vos informations.
              </p>
              <div className="flex items-center space-x-4 text-gray-600">
                <Lock className="w-6 h-6 text-blue-500" />
                <span>Chiffrement de bout en bout</span>
              </div>
            </div>
            <div className="md:w-1/2">
              <img
                src="https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                alt="Sécurité"
                className="rounded-2xl shadow-2xl hover:shadow-3xl transition-shadow duration-300"
              />
            </div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section avec animation */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="py-24 bg-gradient-to-r from-blue-600 to-teal-600 text-white"
      >
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-4xl font-bold mb-8">
            Prêt à prendre le contrôle de vos finances ?
          </h2>
          <p className="text-xl mb-12 text-blue-50">
            Rejoignez BudgetZen et commencez à gérer votre argent intelligemment
          </p>
          <Link to="/auth?mode=signup">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-300">
              Créer un compte gratuitement
            </Button>
          </Link>
        </div>
      </motion.section>
    </div>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
    >
      <div className="mb-6 flex justify-center">{icon}</div>
      <h3 className="text-xl font-semibold mb-4 text-gray-800">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </motion.div>
  );
};

export default Welcome; 