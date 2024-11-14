const index = require("../index.js");

describe("index.js", () => {
  test("should render the page correctly", () => {
    const locals = {
      score: 100,
      elapsedTime: 60,
      numberOfTries: 3,
      word: "hello",
      unknowWord: "######",
    };
  });
});
test("devrait calculer correctement le temps écoulé", () => {
  const startTime = Date.now() - 5000; // 5 secondes dans le passé
  const elapsedTime = index.calculateElapsedTime(startTime);
  expect(elapsedTime).toBe(5);
});

test("devrait gérer correctement une entrée invalide", () => {
  const req = {
    session: {
      playerGame: {
        unknowWord: "######",
        word: "bonjour",
        numberOfTries: 5,
        score: 1000,
        startTime: Date.now(),
      },
    },
    body: {
      word: "123", // Entrée invalide
    },
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    render: jest.fn(),
  };

  index.handleGuess(req, res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.render).toHaveBeenCalledWith(
    "pages/index",
    expect.objectContaining({
      error:
        "Entrée invalide. Veuillez entrer une lettre, un espace ou un tiret.",
    })
  );
});

test("devrait mettre à jour correctement le mot inconnu lors d'une devinette correcte", () => {
  const req = {
    session: {
      playerGame: {
        unknowWord: "######",
        word: "bonjour",
        numberOfTries: 5,
        score: 1000,
        startTime: Date.now(),
      },
    },
    body: {
      word: "o",
    },
  };
  const res = {
    render: jest.fn(),
  };

  index.handleGuess(req, res);

  expect(req.session.playerGame.unknowWord).toBe("#o##o##");
  expect(res.render).toHaveBeenCalledWith(
    "pages/index",
    expect.objectContaining({
      game: "#o##o##",
    })
  );
});
