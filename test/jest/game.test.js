const Game = require("../../game.js");
const fs = require("fs");
const tools = require("../../tools.js");

jest.mock("fs");
jest.mock("../../tools");

describe("Game test", () => {
  let game;

  beforeAll(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterAll(() => {
    console.log.mockRestore();
  });

  beforeEach(() => {
    game = new Game();
    tools.getRandomInt.mockReturnValue(0);
  });

  test("should initialize game properties correctly", () => {
    expect(game.listOfWords).toEqual([]);
    expect(game.numberOfTry).toBe(5);
    expect(game.score).toBe(1000);
    expect(game.startTime).toBeNull();
    expect(game.word).toBeNull();
    expect(game.unknowWord).toBeNull();
  });

  test("should load words from file", async () => {
    fs.createReadStream.mockImplementation(() => {
      const readableStream = {
        pipe: jest.fn().mockReturnThis(),
        on: jest.fn((event, callback) => {
          if (event === "data") callback({ word: "damien" });
          if (event === "end") callback();
          return readableStream;
        }),
      };
      return readableStream;
    });

    await game.loadWords();
    expect(game.listOfWords).toContain("damien");
    expect(game.listOfWords.length).toBeGreaterThan(0);

    game.chooseWord();
    expect(game.word).toBe("damien");
    expect(game.unknowWord).toBe("######");
  });

  test("should throw an error if no words are loaded", async () => {
    fs.createReadStream.mockImplementation(() => {
      const readableStream = {
        pipe: jest.fn().mockReturnThis(),
        on: jest.fn((event, callback) => {
          if (event === "end") callback();
          return readableStream;
        }),
      };
      return readableStream;
    });

    await expect(game.loadWords()).rejects.toThrow(
      "No words loaded from the file."
    );
  });

  test("should reject if file reading fails", async () => {
    fs.createReadStream.mockImplementation(() => {
      const readableStream = {
        pipe: jest.fn().mockReturnThis(),
        on: jest.fn((event, callback) => {
          if (event === "error") callback(new Error("File reading error"));
          return readableStream;
        }),
      };
      return readableStream;
    });

    await expect(game.loadWords()).rejects.toThrow("File reading error");
  });

  test("should choose a valid word", () => {
    game.listOfWords = ["damien", "test"];
    tools.getRandomInt.mockReturnValue(0);
    game.chooseWord();

    expect(game.word).toBe("damien");
    expect(game.unknowWord).toBe("######");
  });

  test("should throw error if no words available in list", () => {
    game.listOfWords = [];
    expect(() => game.chooseWord()).toThrow(
      "No words available to choose from. Ensure words are loaded first."
    );
  });

  test("should throw error if chosen word is undefined", () => {
    game.listOfWords = [null];
    tools.getRandomInt.mockReturnValue(0);
    expect(() => game.chooseWord()).toThrow("Chosen word is undefined.");
  });

  test("should handle a correct guess and decrease score due to time", () => {
    game.word = "damien";
    game.unknowWord = "######";
    game.startTime = Date.now() - 5000;

    const oldScore = game.getScore();
    const found = game.guess("d");
    expect(found).toBe(true);
    expect(game.print()).toBe("d#####");
    expect(game.getScore()).toBeLessThan(oldScore);
  });

  test("should handle an incorrect guess and decrease score", () => {
    game.word = "damien";
    game.unknowWord = "######";
    game.startTime = Date.now() - 2000;

    const oldScore = game.getScore();
    const found = game.guess("z");
    expect(found).toBe(false);
    expect(game.getNumberOfTries()).toBe(4);
    expect(game.getScore()).toBeLessThan(oldScore);
  });

  test("should handle a guess when score is already zero", () => {
    game.word = "damien";
    game.unknowWord = "######";
    game.startTime = Date.now();
    game.score = 0;

    const found = game.guess("z");
    expect(found).toBe(false);
    expect(game.getScore()).toBe(0);
  });

  test("should throw error if unknowWord is not initialized when guessing", () => {
    game.word = "damien";
    game.unknowWord = null;
    expect(() => game.guess("a")).toThrow("unknowWord is not initialized.");
  });

  test("should throw error if guessing without initializing the word", () => {
    game.word = null;
    expect(() => game.guess("a")).toThrow(
      "The word has not been set. Please ensure that the game has been initialized properly."
    );
  });

  test("should not decrement score below zero even after many wrong guesses", () => {
    game.word = "abc";
    game.unknowWord = "###";
    game.startTime = Date.now() - 100000;
    for (let i = 0; i < 50; i++) {
      game.guess("z");
    }
    expect(game.getScore()).toBe(0);
    expect(game.getNumberOfTries()).toBeLessThanOrEqual(0);
  });

  test("should return correct score, print and number of tries", () => {
    game.word = "test";
    game.unknowWord = "####";
    expect(game.getScore()).toBe(1000);
    expect(game.print()).toBe("####");
    expect(game.getNumberOfTries()).toBe(5);
  });

  test("should skip rows with no word property", async () => {
    fs.createReadStream.mockImplementation(() => {
      const readableStream = {
        pipe: jest.fn().mockReturnThis(),
        on: jest.fn((event, callback) => {
          if (event === "data") {
            callback({});
            callback({ word: "validword" });
          }
          if (event === "end") callback();
          return readableStream;
        }),
      };
      return readableStream;
    });

    await game.loadWords();
    expect(game.listOfWords).toEqual(["validword"]);
  });
});
