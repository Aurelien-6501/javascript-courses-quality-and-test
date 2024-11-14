require("dotenv").config();
const express = require("express");
const session = require("express-session");
const path = require("path");
const Game = require("./game.js");

const PORT = process.env.PORT || 3030;
const app = express();

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }, // Session valable pour 24 heures
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration du répertoire des fichiers statiques
app.use(express.static(path.join(__dirname, "public")));

// Définir EJS comme moteur de rendu
app.set("view engine", "ejs");

const globalGame = new Game(); // Initialisation du jeu global

// Charger les mots et choisir un mot globalement pour tous les joueurs
(async () => {
  try {
    await globalGame.loadWords();
    app.listen(PORT, () =>
      console.log(`Listening on http://localhost:${PORT}`)
    );
  } catch (error) {
    console.error("Failed to load words and start the server:", error);
  }
})();

// Fonction pour calculer le temps écoulé
function calculateElapsedTime(startTime) {
  return Math.floor((Date.now() - startTime) / 1000);
}

// Fonction pour vérifier si un joueur peut jouer
function canPlayToday(lastPlayedDate) {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD format
  return !lastPlayedDate || lastPlayedDate !== today;
}

// Route principale pour rendre l'interface de jeu
app.get("/", (req, res) => {
  if (!req.session.playerGame) {
    req.session.playerGame = {
      word: globalGame.word,
      unknowWord: globalGame.unknowWord,
      score: 1000,
      numberOfTries: 5,
      startTime: Date.now(),
    };
    req.session.lastPlayedDate = new Date().toISOString().slice(0, 10); // Enregistrer la date de la dernière partie
  }

  const playerGame = req.session.playerGame;

  // Calculer le temps écoulé
  const elapsedTime = calculateElapsedTime(playerGame.startTime);

  // Si le jeu est terminé, on garde le score final, sinon on le met à jour
  const currentScore =
    playerGame.numberOfTries <= 0 || playerGame.unknowWord.indexOf("#") === -1
      ? playerGame.score
      : playerGame.score - elapsedTime;

  // Mettre à jour le score dans la session pour qu'il soit persisté
  playerGame.score = currentScore;

  res.render("pages/index", {
    game: playerGame.unknowWord,
    word: playerGame.word,
    numberOfTries: playerGame.numberOfTries,
    score: currentScore,
    elapsedTime: elapsedTime,
    error: null,
  });
});

// Route pour traiter la soumission d'une lettre
app.post("/", (req, res) => {
  if (!req.session.playerGame) {
    return res.status(400).render("pages/index", {
      game: req.session.playerGame?.unknowWord || "",
      word: req.session.playerGame?.word || "",
      numberOfTries: req.session.playerGame?.numberOfTries || 0,
      score: req.session.playerGame?.score || 1000,
      elapsedTime: calculateElapsedTime(
        req.session.playerGame?.startTime || Date.now()
      ),
      error: "Erreur de session. Veuillez réessayer.",
    });
  }

  const playerGame = req.session.playerGame;
  const wordInput = req.body.word;
  const validRegex = /^[a-zA-ZÀ-ÿ\s-]$/;

  if (!wordInput || !validRegex.test(wordInput)) {
    return res.status(400).render("pages/index", {
      game: playerGame.unknowWord,
      word: playerGame.word,
      numberOfTries: playerGame.numberOfTries,
      score: playerGame.score,
      elapsedTime: calculateElapsedTime(playerGame.startTime),
      error:
        "Entrée invalide. Veuillez entrer une lettre, un espace ou un tiret.",
    });
  }

  let found = false;
  let updatedWord = playerGame.unknowWord.split("");

  for (let i = 0; i < playerGame.word.length; i++) {
    if (playerGame.word[i] === wordInput) {
      updatedWord[i] = wordInput;
      found = true;
    }
  }

  const elapsedTime = calculateElapsedTime(playerGame.startTime);
  playerGame.score -= elapsedTime;
  playerGame.startTime = Date.now(); // Réinitialiser le temps de départ après un essai

  if (found) {
    playerGame.unknowWord = updatedWord.join("");
  } else {
    playerGame.numberOfTries--;
    playerGame.score -= 50; // Retirer 50 points par essai raté
  }

  res.render("pages/index", {
    game: playerGame.unknowWord,
    word: playerGame.word,
    numberOfTries: playerGame.numberOfTries,
    score: playerGame.score,
    elapsedTime: calculateElapsedTime(playerGame.startTime),
    error: null,
  });
});
