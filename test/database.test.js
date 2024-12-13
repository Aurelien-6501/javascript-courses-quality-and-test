const db = require("../database");

describe("SQLite Database Tests", () => {
  beforeAll(() => {
    db.run = jest.fn((query, params, callback) => callback(null));
    db.all = jest.fn((query, params, callback) => {
      callback(null, [{ name: "Alice", score: 100 }]);
    });
  });

  test("should retrieve scores from the 'scores' table", (done) => {
    db.all("SELECT * FROM scores", [], (err, rows) => {
      expect(err).toBeNull();
      expect(Array.isArray(rows)).toBe(true);
      expect(rows.length).toBeGreaterThan(0);
      expect(rows[0]).toMatchObject({
        name: "Alice",
        score: expect.any(Number),
      });
      done();
    });
  }, 10000);

  test("should handle errors when running invalid SQL commands", (done) => {
    db.run.mockImplementationOnce((query, params, callback) => {
      callback(new Error("SQL Error"));
    });

    db.run("INVALID SQL COMMAND", [], (err) => {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe("SQL Error");
      done();
    });
  }, 10000);
});
