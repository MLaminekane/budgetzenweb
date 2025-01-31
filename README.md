# BudgetZen

Application de gestion de budget personnelle construite avec React, Vite et Supabase.

## Configuration du Projet

### Prérequis

- Node.js
- npm ou yarn
- Compte Supabase
- Compte Vercel (pour le déploiement)

### Installation

1. Cloner le repository :

```bash
git clone https://github.com/MLaminekane/budgetzenweb.git
```

2. Installer les dépendances :

```bash
cd budgetzenweb
npm install
```

3. Créer un fichier `.env` à la racine du projet :

```bash
VITE_SUPABASE_URL="votre_url_supabase"
VITE_SUPABASE_ANON_KEY="votre_clé_supabase"
```

## Développement local

1. Démarrer le serveur de développement :

```bash
npm run dev
```

2. Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur

## Déploiement sur Vercel

1. Créer un compte sur [Vercel](https://vercel.com) si ce n'est pas déjà fait

2. Installer Vercel CLI :

```bash
npm i -g vercel
```

3. Configurer les variables d'environnement sur Vercel :

   - Aller dans les paramètres du projet sur Vercel
   - Ajouter les variables suivantes :
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

4. Déployer :

```bash
vercel
```

5. Pour les déploiements suivants en production :

```bash
vercel --prod
```

## Scripts disponibles

- `npm run dev` - Lance le serveur de développement
- `npm run build` - Crée une version de production
- `npm run preview` - Teste la version de production localement
- `npm run lint` - Vérifie le code avec ESLint

## Technologies utilisées

- React
- Vite
- TypeScript
- Supabase
- TailwindCSS
- Shadcn/ui

## Lien de l'application

[budgetzen.me](https://budgetzen.me)
