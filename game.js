const tools = require("./tools.js");
const csv = require("csv-parser");
const fs = require("fs");

class Game {
  constructor() {
    this.listOfWords = [];
    this.numberOfTry = 5;
    this.score = 1000; // Score initial
    this.startTime = null; // Pour suivre le temps écoulé
  }

  loadWords() {
    return new Promise((resolve, reject) => {
      fs.createReadStream("words_fr.txt")
        .pipe(csv())
        .on("data", (row) => {
          this.listOfWords.push(row.word.toLowerCase());
        })
        .on("end", () => {
          console.log("CSV file successfully processed");
          this.chooseWord();
          this.startTime = Date.now(); // Enregistre l'heure de début
          resolve();
        })
        .on("error", reject);
    });
  }

  chooseWord() {
    if (this.listOfWords.length > 0) {
      this.word = this.listOfWords[tools.getRandomInt(this.listOfWords.length)];
      this.unknowWord = this.word.replace(/./g, "#");
    } else {
      throw new Error("No words available to choose from.");
    }
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

    // Calculer le temps écoulé et ajuster le score
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

    // S'assurer que le score ne descend jamais en dessous de 0
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
