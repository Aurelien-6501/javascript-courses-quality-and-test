const Game = require("../game.js");

let game;

beforeAll(async () => {
  game = new Game();
  await game.loadWords();
  game.word = "damien"; // Setting a known word for tests
  game.unknowWord = "######";
  jest.spyOn(console, "log").mockImplementation(() => {});
});

afterAll(() => {
  console.log.mockRestore();
});

describe("Game test", () => {
  // Activer les timers factices pour tous les tests
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("The word must be 'damien'", () => {
    expect(game.word).toBe("damien");
  });

  test("should be 5 tries at the beginning of the game", () => {
    expect(game.getNumberOfTries()).toBe(5);
  });

  test("test the try mechanic with a correct guess", () => {
    game.guess("a");
    expect(game.getNumberOfTries()).toBe(5);
  });

  test("test the try mechanic with an incorrect guess", () => {
    game.guess("kdjhgkfjhgdfkjhg");
    expect(game.getNumberOfTries()).toBe(4);
  });

  test("should show only 'a' letter", () => {
    game.word = "damien";
    game.unknowWord = "######";
    game.guess("a");
    console.log(game.word);
    console.log(game.unknowWord);
    expect(game.print()).toBe("#a####");
  });

  test("should throw an error if no words are available", () => {
    game.listOfWords = [];
    expect(() => game.chooseWord()).toThrow(
      "No words available to choose from."
    );
  });

  test("devrait initialiser le score à 1000 au début du jeu", () => {
    const newGame = new Game();
    expect(newGame.getScore()).toBe(1000);
  });

  test("devrait réduire le score de 50 points pour chaque essai incorrect", () => {
    const newGame = new Game();
    newGame.word = "test";
    const initialScore = newGame.getScore();
    newGame.guess("z");
    expect(newGame.getScore()).toBe(initialScore - 50);
  });

  test("devrait réduire le score en fonction du temps écoulé", async () => {
    const newGame = new Game();
    await newGame.loadWords();
    const initialScore = newGame.getScore();

    // Simuler un délai de 5 secondes
    jest.advanceTimersByTime(5000);

    newGame.guess("a");
    expect(newGame.getScore()).toBeLessThan(initialScore);
  });

  test("devrait réduire le score à zéro si le temps écoulé dépasse 1000 secondes", async () => {
    const newGame = new Game();
    await newGame.loadWords();

    // Simuler un délai de 1001 secondes
    jest.advanceTimersByTime(1001000);

    newGame.guess("a");
    expect(newGame.getScore()).toBe(0);
  });

  test("ne devrait pas réduire le score en dessous de zéro", async () => {
    const newGame = new Game();
    await newGame.loadWords();

    // Simuler un délai très long
    jest.advanceTimersByTime(2000000);

    newGame.guess("z");

    expect(newGame.getScore()).toBe(0);
  });

  test("devrait augmenter le score de 100 points pour chaque lettre correcte devinée", () => {
    const newGame = new Game();
    newGame.word = "test";
    newGame.unknownWord = "####";
    const scoreInitial = newGame.getScore();

    newGame.guess("t");

    expect(newGame.getScore()).toBe(scoreInitial + 100);
  });

  test("ne devrait pas augmenter le score au-delà de 5000 points", () => {
    const newGame = new Game();
    newGame.word = "abcdefghijklmnopqrstuvwxyz";
    newGame.unknownWord = "#".repeat(26);
    newGame.score = 4950;

    for (let i = 0; i < 10; i++) {
      newGame.guess("abcdefghij"[i]);
    }

    expect(newGame.getScore()).toBe(5000);
  });

  test("devrait charger correctement les mots depuis le fichier", async () => {
    const game = new Game();
    await game.loadWords();

    expect(game.words).toBeDefined();
    expect(game.words.length).toBeGreaterThan(0);
    expect(game.words[0]).toBe("AAA");
  });

  test("devrait sélectionner un mot aléatoire lors de l'initialisation", async () => {
    const game = new Game();
    await game.loadWords();

    expect(game.word).toBeDefined();
    expect(game.word.length).toBeGreaterThan(0);
    expect(game.words).toContain(game.word);
  });

  test("devrait initialiser correctement le mot inconnu", async () => {
    const game = new Game();
    await game.loadWords();

    expect(game.unknownWord).toBeDefined();
    expect(game.unknownWord.length).toBe(game.word.length);
    expect(game.unknownWord).toBe("#".repeat(game.word.length));
  });
});
