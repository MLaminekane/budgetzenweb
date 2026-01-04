import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ChartBar, CreditCard, LineChart, Lock, PiggyBank, Shield, Sparkles, TrendingUp, Wallet, Zap } from "lucide-react";

const Welcome = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Navigation Bar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100"
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 text-transparent bg-clip-text">BudgetZen</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                Se connecter
              </Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white shadow-lg shadow-blue-500/25">
                Commencer
              </Button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.header 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative container mx-auto px-6 pt-32 pb-20 text-center"
      >
        <div className="max-w-5xl mx-auto">
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-blue-600 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            <span>Gérez vos finances en toute simplicité</span>
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold mb-8 leading-tight"
          >
            <span className="text-gray-900">Prenez le contrôle de </span>
            <span className="bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500 text-transparent bg-clip-text">vos finances</span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-xl md:text-2xl mb-12 text-gray-600 font-light max-w-3xl mx-auto leading-relaxed"
          >
            Une application intuitive et élégante pour suivre vos dépenses, gérer vos budgets et atteindre vos objectifs financiers
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/auth?mode=signup">
              <Button size="lg" className="group w-full sm:w-auto bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 px-8 py-6 text-lg rounded-2xl">
                Créer un compte gratuitement
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 px-8 py-6 text-lg rounded-2xl">
                Se connecter
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div 
            variants={itemVariants}
            className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gray-900">100%</div>
              <div className="text-sm text-gray-500 mt-1">Gratuit</div>
            </div>
            <div className="text-center border-x border-gray-200">
              <div className="text-3xl md:text-4xl font-bold text-gray-900">Sécurisé</div>
              <div className="text-sm text-gray-500 mt-1">Données chiffrées</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gray-900">Simple</div>
              <div className="text-sm text-gray-500 mt-1">Interface intuitive</div>
            </div>
          </motion.div>
        </div>
      </motion.header>

      {/* Features Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative py-32 bg-white"
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-2 bg-teal-50 text-teal-600 rounded-full text-sm font-medium mb-4"
            >
              Fonctionnalités
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
            >
              Tout ce dont vous avez besoin
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 max-w-2xl mx-auto"
            >
              Des outils puissants et simples pour maîtriser vos finances au quotidien
            </motion.p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={<Wallet className="w-7 h-7" />}
              title="Gestion des budgets"
              description="Créez et gérez facilement vos budgets mensuels par catégorie avec des alertes intelligentes"
              color="blue"
              delay={0}
            />
            <FeatureCard
              icon={<LineChart className="w-7 h-7" />}
              title="Analyses détaillées"
              description="Visualisez vos dépenses avec des graphiques interactifs et des rapports personnalisés"
              color="teal"
              delay={0.1}
            />
            <FeatureCard
              icon={<CreditCard className="w-7 h-7" />}
              title="Suivi des transactions"
              description="Suivez vos dépenses et revenus en temps réel avec catégorisation automatique"
              color="indigo"
              delay={0.2}
            />
            <FeatureCard
              icon={<PiggyBank className="w-7 h-7" />}
              title="Objectifs d'épargne"
              description="Définissez des objectifs et suivez votre progression vers vos rêves"
              color="emerald"
              delay={0.3}
            />
            <FeatureCard
              icon={<TrendingUp className="w-7 h-7" />}
              title="Prévisions financières"
              description="Anticipez vos finances avec des projections basées sur vos habitudes"
              color="orange"
              delay={0.4}
            />
            <FeatureCard
              icon={<Zap className="w-7 h-7" />}
              title="Actions rapides"
              description="Ajoutez des transactions en quelques secondes grâce à une interface optimisée"
              color="purple"
              delay={0.5}
            />
          </div>
        </div>
      </motion.section>

      {/* Security Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative py-32 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.15),transparent_50%)]" />
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_50%,rgba(20,184,166,0.15),transparent_50%)]" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16 max-w-6xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2"
            >
              <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm text-blue-300 rounded-full text-sm font-medium mb-6">
                <Shield className="w-4 h-4 inline mr-2" />
                Sécurité maximale
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
                Vos données sont <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">protégées</span>
              </h2>
              <p className="text-lg text-gray-300 mb-10 leading-relaxed">
                Nous prenons la sécurité de vos données très au sérieux. Avec un chiffrement de bout en bout et une infrastructure sécurisée par Supabase, vos informations financières restent confidentielles.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Lock className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Chiffrement SSL</h4>
                    <p className="text-sm text-gray-400">Toutes les communications sont chiffrées</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-teal-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Données privées</h4>
                    <p className="text-sm text-gray-400">Vos données ne sont jamais partagées</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:w-1/2"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-teal-500 rounded-3xl blur-2xl opacity-30" />
                <img
                  src="https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                  alt="Sécurité"
                  className="relative rounded-3xl shadow-2xl w-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative py-32 bg-white overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-teal-50" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-6 text-center max-w-4xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-gray-900">
              Prêt à transformer votre <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600">gestion financière</span> ?
            </h2>
            <p className="text-xl mb-12 text-gray-600 max-w-2xl mx-auto">
              Rejoignez des milliers d'utilisateurs qui ont déjà pris le contrôle de leurs finances avec BudgetZen
            </p>
            <Link to="/auth?mode=signup">
              <Button size="lg" className="group bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 px-10 py-7 text-lg rounded-2xl">
                Commencer gratuitement
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <p className="mt-6 text-sm text-gray-500">
              Aucune carte de crédit requise • Inscription en 30 secondes
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">BudgetZen</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2026 BudgetZen. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
  color,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "blue" | "teal" | "indigo" | "emerald" | "orange" | "purple";
  delay: number;
}) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
    teal: "bg-teal-50 text-teal-600 group-hover:bg-teal-100",
    indigo: "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100",
    orange: "bg-orange-50 text-orange-600 group-hover:bg-orange-100",
    purple: "bg-purple-50 text-purple-600 group-hover:bg-purple-100",
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 cursor-pointer"
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300 ${colorClasses[color]}`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </motion.div>
  );
};

export default Welcome; 