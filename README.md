# Dune 2d20 - Assistant de Création de Personnage

Assistant complet de création et gestion de fiches de personnages pour le jeu de rôle **Dune: Aventures dans l'Imperium** (système 2d20 de Modiphius).

Entièrement autonome, côté client (aucun serveur ou clé API requis), optimisé pour le web statique, Netlify et **GitHub Pages**.

## Déploiement sur GitHub Pages

### Méthode 1 : GitHub Actions (Recommandé & Automatique)
Le workflow GitHub Actions `.github/workflows/deploy.yml` est déjà inclus dans le dépôt.

1. Poussez votre code sur votre dépôt GitHub (branche `main`).
2. Rendez-vous sur votre dépôt dans **Settings** > **Pages**.
3. Dans **Build and deployment** > **Source**, sélectionnez **GitHub Actions**.
4. Le workflow va se déclencher automatiquement à chaque commit sur `main` et déployer le site.

### Méthode 2 : Déploiement manuel via gh-pages
Si vous préférez déployer manuellement la branche `gh-pages` :
```bash
npm install
npm run build
# Le dossier généré dist/ est autonome avec des chemins relatifs et prêt à être servi.
```

## Fonctionnalités
- Assistant pas-à-pas de création (Maison, Concept, Rôle, Compétences, Principes, Talents, Atouts, Détails)
- Fiche de personnage interactive avec modification directe de chaque élément
- Générateur d'historique et de concept immersif (sans dépendance IA)
- Simulateur de lancers de dés 2d20 avec calcul automatique des succès, complications et momentum
- Export PDF de la fiche de personnage
- Sauvegarde et chargement de pré-tirés
- Aide-mémoire complet des règles du système 2d20
