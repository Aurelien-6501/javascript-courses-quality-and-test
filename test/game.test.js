const Game = require("../game.js");
const fs = require("fs");
const tools = require("../tools");

jest.mock("fs");
jest.mock("../tools");

describe("Game test", () => {
  let game;

  beforeAll(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterAll(() => {
    jest.spyOn(console, "log").mockRestore();
  });

  beforeEach(() => {
    game = new Game();
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

    // Vérifiez que chooseWord fonctionne correctement
    game.chooseWord();
    expect(game.word).toBe("damien");
    expect(game.unknowWord).toBe("######");
  });

  test("should throw an error if no words are loaded", async () => {
    fs.createReadStream.mockImplementation(() => {
      const readableStream = {
        pipe: jest.fn().mockReturnThis(),
        on: jest.fn((event, callback) => {
          if (event === "end") callback(); // Pas de données simulées
          return readableStream;
        }),
      };
      return readableStream;
    });

    await expect(game.loadWords()).rejects.toThrow(
      "No words loaded from the file."
    );
  });

  test("should choose a valid word", () => {
    game.listOfWords = ["damien", "test"];
    tools.getRandomInt.mockReturnValue(0); // Retourne toujours le premier mot
    game.chooseWord();

    expect(game.word).toBe("damien");
    expect(game.unknowWord).toBe("######");
  });

  test("should throw error if no words available in list", () => {
    game.listOfWords = [];
    expect(() => game.chooseWord()).toThrow(
      "No words available to choose from."
    );
  });

  test("should handle a correct guess and decrease score", () => {
    game.word = "damien";
    game.unknowWord = "######";
    game.startTime = Date.now() - 5000; // Simule un temps écoulé de 5 secondes

    const found = game.guess("d");
    expect(found).toBe(true);
    expect(game.print()).toBe("d#####");
    expect(game.getScore()).toBeLessThan(1000); // Score doit diminuer en fonction du temps
  });

  test("should handle an incorrect guess and decrease score", () => {
    game.word = "damien";
    game.unknowWord = "######";
    game.startTime = Date.now() - 2000;

    const found = game.guess("z");
    expect(found).toBe(false);
    expect(game.getNumberOfTries()).toBe(4);
    expect(game.getScore()).toBeLessThan(1000); // Score doit diminuer
  });

  test("should handle a guess when score is already zero", () => {
    game.word = "damien";
    game.unknowWord = "######";
    game.startTime = Date.now();
    game.score = 0;

    const found = game.guess("z");
    expect(found).toBe(false);
    expect(game.getScore()).toBe(0); // Score ne doit pas devenir négatif
  });

  test("should throw error if unknowWord is not initialized when guessing", () => {
    game.word = "damien";
    game.unknowWord = null; // unknowWord non initialisée
    expect(() => game.guess("a")).toThrow("unknowWord is not initialized.");
  });

  test("should throw error if guessing without initializing the word", () => {
    game.word = null;
    expect(() => game.guess("a")).toThrow(
      "The word has not been set. Please ensure that the game has been initialized properly."
    );
  });
});
