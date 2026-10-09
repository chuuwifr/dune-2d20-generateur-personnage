# Dune 2d20 - Assistant de Création de Personnage

Assistant complet de création et gestion de fiches de personnages pour le jeu de rôle **Dune: Aventures dans l'Imperium** (système 2d20 de Modiphius).

Entièrement autonome, 100% côté client (aucun serveur ni clé API requis), optimisé pour le web statique, Netlify et **GitHub Pages**.

---

## Déploiement sur GitHub Pages (Résolution de la page blanche)

La page blanche sur GitHub Pages provient généralement de deux causes :
1. **Source mal configurée** : Si GitHub Pages est réglé sur `Deploy from a branch > main / (root)`, il tente de servir le code source non compilé (`/src/main.tsx`), ce que les navigateurs ne peuvent pas interpréter.
2. **Chemins d'accès (Base URL)** : Sur GitHub Pages, le site est servi sous `https://<pseudo>.github.io/<nom-du-repo>/`. Sans configuration appropriée du sous-dossier, le navigateur cherche les scripts à la racine du domaine (`https://<pseudo>.github.io/assets/...`) au lieu de `.../<nom-du-repo>/assets/...`, provoquant des erreurs 404.

Tout a été corrigé pour fonctionner automatiquement selon la méthode de votre choix :

### Méthode 1 : Via GitHub Actions (Recommandé & 100% Automatique)
Le workflow `.github/workflows/static.yml` compile automatiquement le projet avec Node/Vite et déploie le dossier `dist/` à chaque push.

1. Rendez-vous sur votre dépôt GitHub.
2. Allez dans **Settings** > **Pages**.
3. Dans **Build and deployment** > **Source**, choisissez **GitHub Actions** (au lieu de "Deploy from a branch").
4. Faites un `git push` sur la branche `main` (ou lancez le workflow manuellement dans l'onglet **Actions**).
5. GitHub Actions compile le projet et publie le site sans page blanche !

### Méthode 2 : En 1 seule commande avec `npm run deploy`
Si vous préférez utiliser la méthode par branche `gh-pages` :

1. Dans votre terminal :
   ```bash
   npm run deploy
   ```
   *(Cette commande compile le projet et pousse automatiquement le dossier `dist` sur la branche `gh-pages`)*
2. Allez dans **Settings** > **Pages**.
3. Dans **Build and deployment** > **Source**, choisissez **Deploy from a branch**.
4. Sélectionnez la branche **`gh-pages`** et le dossier **`/(root)`**, puis cliquez sur **Save**.

---

## Fonctionnalités de l'application
- **Assistant pas-à-pas de création** (Maison, Concept, Rôle, Compétences, Principes, Talents, Atouts, Détails)
- **Fiche de personnage interactive** avec modification directe de chaque élément
- **Générateur d'historique et de concept immersif** (100% autonome, sans dépendance externe)
- **Simulateur de lancers de dés 2d20** avec calcul automatique des succès, complications et momentum
- **Export PDF** de la fiche de personnage
- **Sauvegarde et chargement de pré-tirés** (Kara Molay, Paul, etc.)
- **Aide-mémoire complet** des règles officielles du système 2d20
