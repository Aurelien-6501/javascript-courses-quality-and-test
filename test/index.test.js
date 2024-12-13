const request = require("supertest");
const app = require("../index");
jest.setTimeout(1000);
jest.useFakeTimers("legacy");

describe("GET /", () => {
  it("devrait rendre la page d'accueil avec les données du jeu", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain("nameSubmitted");
    jest.runOnlyPendingTimers();
  }, 1000);
});

describe("POST /", () => {
  it("devrait accepter une lettre valide et mettre à jour l'état du jeu", async () => {
    const res = await request(app)
      .post("/")
      .send({ word: "e" })
      .set("Content-Type", "application/x-www-form-urlencoded");
    expect(res.statusCode).toBe(302);
    jest.runOnlyPendingTimers();
  }, 1000);

  it("devrait rejeter une lettre invalide", async () => {
    const res = await request(app)
      .post("/")
      .send({ word: "1" })
      .set("Content-Type", "application/x-www-form-urlencoded");
    expect(res.statusCode).toBe(400);
    expect(res.text).toContain(
      "Entrée invalide. Veuillez entrer une lettre, un espace ou un tiret."
    );
    jest.runOnlyPendingTimers();
  }, 1000);
});

describe("POST /save-score", () => {
  it("devrait enregistrer un score valide", async () => {
    const res = await request(app)
      .post("/save-score")
      .send({ name: "TestUser", score: 100 })
      .set("Content-Type", "application/json");
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("Score enregistré !");
    jest.runOnlyPendingTimers();
  }, 1000);
});

describe("Session et jeu global", () => {
  it("devrait initialiser une nouvelle session pour un joueur", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain("score");
    jest.runOnlyPendingTimers();
  }, 1000);
});
