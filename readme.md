# Hangman Game

[![Tests](https://github.com/USERNAME/REPO/actions/workflows/test.yml/badge.svg)](https://github.com/USERNAME/REPO/actions/workflows/test.yml)

Bienvenue dans le jeu du pendu (_Hangman Game_) ! Ce projet est un exemple d’application Node.js utilisant Express, EJS et une base de données SQLite pour stocker les scores. Les tests unitaires sont réalisés avec Jest, et les tests de bout en bout (E2E) avec Playwright.

## Fonctionnalités

- **Logique du jeu du pendu** : Essayez de deviner le mot avant d’épuiser vos essais.
- **Enregistrement des scores** : Entrez votre nom et enregistrez votre score une fois la partie terminée.
- **Couverture de code** : Mesurez la qualité de votre code grâce à Jest (tests unitaires) et Playwright (tests E2E).
- **CI/CD avec GitHub Actions** : Un pipeline exécute automatiquement les tests à chaque push ou pull request, garantissant la qualité continue du code.

## Prérequis

- **Node.js** (version 20 recommandée)
- **npm** ou **yarn**
- **SQLite3** (fourni via `sqlite3` en dépendance)

## Installation

1. **Cloner le dépôt** :
   ```bash
   git clone https://github.com/USERNAME/REPO.git
   cd REPO
   ```
