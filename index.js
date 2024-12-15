require("dotenv").config();
const express = require("express");
const session = require("express-session");
const path = require("path");
const Game = require("./game.js");
const db = require("./database.js");

const PORT = process.env.PORT || 3030;
const app = express();

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");

const globalGame = new Game();

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

function calculateElapsedTime(startTime) {
  return Math.floor((Date.now() - startTime) / 1000);
}

app.get("/", (req, res) => {
  if (!req.session.playerGame) {
    req.session.playerGame = {
      word: globalGame.word,
      unknowWord: globalGame.unknowWord,
      score: 1000,
      numberOfTries: 5,
      startTime: Date.now(),
      nameSubmitted: false,
    };
  }

  const playerGame = req.session.playerGame;

  const ended =
    playerGame.numberOfTries <= 0 ||
    (playerGame.unknowWord && playerGame.unknowWord.indexOf("#") === -1);

  let elapsedTime;
  if (ended) {
    if (typeof playerGame.finalElapsedTime === "number") {
      elapsedTime = playerGame.finalElapsedTime;
    } else {
      elapsedTime = calculateElapsedTime(playerGame.startTime);
      playerGame.finalElapsedTime = elapsedTime;
    }
  } else {
    elapsedTime = calculateElapsedTime(playerGame.startTime);
  }

  db.all(
    "SELECT name, score FROM scores ORDER BY score DESC LIMIT 1000",
    [],
    (err, rows) => {
      const scores = rows || [];

      res.render("pages/index", {
        game: playerGame.unknowWord,
        word: playerGame.word,
        numberOfTries: playerGame.numberOfTries,
        score: playerGame.score,
        elapsedTime: elapsedTime,
        scores,
        nameSubmitted: playerGame.nameSubmitted,
      });
    }
  );
});

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
      scores: [],
      nameSubmitted: false,
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
      scores: [],
      nameSubmitted: playerGame.nameSubmitted,
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
  playerGame.startTime = Date.now();
  if (found) {
    playerGame.unknowWord = updatedWord.join("");
  } else {
    playerGame.numberOfTries--;
    playerGame.score -= 50;
  }

  const ended =
    playerGame.numberOfTries <= 0 ||
    (playerGame.unknowWord && playerGame.unknowWord.indexOf("#") === -1);
  if (ended && typeof playerGame.finalElapsedTime !== "number") {
    playerGame.finalElapsedTime = calculateElapsedTime(playerGame.startTime);
  }

  res.redirect("/");
});

app.post("/save-score", (req, res) => {
  const { name, score } = req.body;

  if (req.session.playerGame.nameSubmitted) {
    return res.status(400).send("Nom déjà enregistré pour cette partie.");
  }

  const date = new Date().toISOString();

  db.run(
    "INSERT INTO scores (name, score, date) VALUES (?, ?, ?)",
    [name, score, date],
    (err) => {
      if (err) {
        console.error("Erreur lors de l'enregistrement du score :", err);
        return res
          .status(500)
          .send("Erreur lors de l'enregistrement du score.");
      }

      req.session.playerGame.nameSubmitted = true;
      res.status(200).send("Score enregistré !");
    }
  );
});

module.exports = app;
