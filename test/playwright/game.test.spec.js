// @ts-check
const { test, expect } = require("@playwright/test");

test.describe("Jeu du pendu E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3030/");
  });

  test("a un titre", async ({ page }) => {
    await expect(page).toHaveTitle(/The Hangman game/);
  });

  test("affiche le mot masqué au chargement", async ({ page }) => {
    const maskedWord = page.locator(".word-display");
    await expect(maskedWord).toContainText("#");
  });

  test("affiche le score et le temps", async ({ page }) => {
    const scoreElement = page.locator("#score");
    const timerElement = page.locator("#timer");

    await expect(scoreElement).toHaveText(/\d+/);
    await expect(timerElement).toHaveText(/\d+/);
  });

  test("l'utilisateur peut deviner une lettre valide", async ({ page }) => {
    const input = page.locator("#wordInput");
    await input.fill("a");

    const form = page.locator("#guessForm");
    await form.press("Enter");

    const triesElement = page.locator(".legend-style");
    await expect(triesElement).toContainText("Nombre d'essais restants :");
  });

  test("l'utilisateur ne peut pas entrer de caractères invalides", async ({
    page,
  }) => {
    const input = page.locator("#wordInput");
    await input.fill("@");

    const form = page.locator("#guessForm");
    await form.press("Enter");

    const errorPopup = page.locator("#errorPopup");
    await expect(errorPopup).toBeVisible();

    const closeErrorButton = page.locator("#closeErrorPopup");
    await closeErrorButton.click();
    await expect(errorPopup).toBeHidden();
  });

  test("l'utilisateur voit le nombre d'essais restants initialement", async ({
    page,
  }) => {
    const triesElement = page.locator(".legend-style");
    await expect(triesElement).toContainText("Nombre d'essais restants :");
    await expect(triesElement).toContainText("5");
  });

  test("un essai incorrect réduit le nombre d'essais restants et le score", async ({
    page,
  }) => {
    const initialScore = await page.locator("#score").innerText();
    const initialScoreValue = parseInt(initialScore, 10);

    const triesElement = page.locator(".legend-style");
    const input = page.locator("#wordInput");
    await input.fill("z");
    await page.press("#guessForm", "Enter");
    await expect(triesElement).not.toContainText("5");

    const newScore = await page.locator("#score").innerText();
    const newScoreValue = parseInt(newScore, 10);
    expect(newScoreValue).toBeLessThan(initialScoreValue);
  });

  test("le temps écoulé augmente avec le temps tant que la partie n'est pas terminée", async ({
    page,
  }) => {
    const initialTime = await page.locator("#timer").innerText();
    const initialTimeValue = parseInt(initialTime, 10);
    await page.waitForTimeout(3000);

    const laterTime = await page.locator("#timer").innerText();
    const laterTimeValue = parseInt(laterTime, 10);
    expect(laterTimeValue).toBeGreaterThan(initialTimeValue);
  });

  test("après une victoire, l'utilisateur ne peut plus entrer de lettres", async ({
    page,
  }) => {
    const word = "damien";
    for (const letter of word) {
      await page.fill("#wordInput", letter);
      await page.press("#guessForm", "Enter");
      await page.waitForTimeout(200);
    }

    const winnerPopup = page.locator("#winnerPopup");
    await expect(winnerPopup).toBeVisible();

    const input = page.locator("#wordInput");
    if ((await input.count()) > 0) {
      await input.fill("a");
      await page.press("#guessForm", "Enter");
      const triesElement = page.locator(".legend-style");
      const triesBefore = await triesElement.innerText();
      await page.waitForTimeout(200);
      const triesAfter = await triesElement.innerText();
      expect(triesAfter).toBe(triesBefore);
    }
  });
});
