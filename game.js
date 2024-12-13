const tools = require("./tools.js");
const csv = require("csv-parser");
const fs = require("fs");

class Game {
  constructor() {
    this.listOfWords = [];
    this.numberOfTry = 5;
    this.score = 1000; // Score initial
    this.startTime = null; // Pour suivre le temps écoulé
    this.word = null; // Mot actuel
    this.unknowWord = null; // Mot caché
  }

  loadWords() {
    return new Promise((resolve, reject) => {
      fs.createReadStream("words_fr.txt")
        .pipe(csv())
        .on("data", (row) => {
          if (row.word) {
            this.listOfWords.push(row.word.toLowerCase());
          }
        })
        .on("end", () => {
          console.log("CSV file successfully processed");
          if (this.listOfWords.length === 0) {
            return reject(new Error("No words loaded from the file."));
          }
          this.chooseWord();
          this.startTime = Date.now(); // Enregistre l'heure de début
          resolve();
        })
        .on("error", reject);
    });
  }

  chooseWord() {
    if (!this.listOfWords || this.listOfWords.length === 0) {
      throw new Error(
        "No words available to choose from. Ensure words are loaded first."
      );
    }
    const randomIndex = tools.getRandomInt(this.listOfWords.length);
    this.word = this.listOfWords[randomIndex];
    if (!this.word) {
      throw new Error("Chosen word is undefined.");
    }
    this.unknowWord = this.word.replace(/./g, "#");
  }

  guess(oneLetter) {
    if (!this.word) {
      throw new Error(
        "The word has not been set. Please ensure that the game has been initialized properly."
      );
    }
    if (!this.unknowWord) {
      throw new Error("unknowWord is not initialized.");
    }

    const elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
    this.score -= elapsedTime;

    let found = false;
    let updatedWord = this.unknowWord.split("");

    for (let i = 0; i < this.word.length; i++) {
      if (this.word[i] === oneLetter) {
        updatedWord[i] = oneLetter;
        found = true;
      }
    }

    if (found) {
      this.unknowWord = updatedWord.join("");
    } else {
      this.numberOfTry--;
      this.score -= 50; // Retirer 50 points par essai raté
    }

    if (this.score < 0) {
      this.score = 0;
    }

    return found;
  }

  getScore() {
    return this.score;
  }

  print() {
    return this.unknowWord;
  }

  getNumberOfTries() {
    return this.numberOfTry;
  }
}

module.exports = Game;
