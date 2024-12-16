# Hangman Game

[![Tests](https://github.com/Aurelien-6501/javascript-courses-quality-and-test/actions/workflows/node.js.yml/badge.svg)](https://github.com/Aurelien-6501/javascript-courses-quality-and-test/actions/workflows/node.js.yml)

Bienvenue dans le jeu du pendu (_Hangman Game_) ! Ce projet est un exemple d’application Node.js utilisant Express, EJS et une base de données SQLite pour stocker les scores. Les tests unitaires sont réalisés avec Jest, et les tests de bout en bout (E2E) avec Playwright.

## Fonctionnalités

- **Logique du jeu du pendu** : Essayez de deviner le mot avant d’épuiser tous vos essais.
- **Enregistrement des scores** : Une fois la partie terminée, enregistrez votre nom et votre score.
- **Couverture de code** : Vérifiez la qualité de votre code avec les tests unitaires (Jest) et E2E (Playwright).
- **Intégration Continue (CI/CD)** : Un pipeline GitHub Actions exécute automatiquement les tests à chaque push ou pull request, assurant une qualité de code continue.

## Prérequis

- **Node.js** (version 20 recommandée)
- **npm** ou **yarn**
- **SQLite3** (fourni via `sqlite3` dans les dépendances)

## Installation

1. **Cloner le dépôt** :

   ```bash
   git clone https://github.com/USERNAME/REPO.git
   cd REPO
   ```

2. **Installer les dépendances** :

   ```bash
   npm ci
   ```

3. **Installer les navigateurs pour Playwright** :
   ```
   npx playwright install --with-deps
   ```

## Lancement de l’application

Pour lancer le serveur en mode développement (avec nodemon) :

```
npm run start
```

Par défaut, l’application sera accessible sur http://localhost:3030.

## Tests Unitaires (Jest)

Exécutez les tests unitaires avec couverture :

```
npm run test:unit
```

## Tests E2E (Playwright)

Exécutez les tests E2E :

```
npm run test:e2e
```

Les résultats sont placés dans playwright-report. Pour afficher le rapport localement :

```
npm run test:e2e:report
```

## Tous les tests (Jest + Playwright)

Pour exécuter les tests unitaires puis les tests E2E :

```
npm run test:all
```
