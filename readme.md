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
