const request = require("supertest");
const app = require("../src/app");

describe("Health endpoint", () => {
  it("should return app health", async () => {
    const response = await request(app).get("/api/v1/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.body).toHaveProperty("uptime");
  });
});
