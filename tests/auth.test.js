jest.mock("../src/services/auth.service", () => ({
  register: jest.fn(),
  login: jest.fn(),
  refresh: jest.fn(),
  logout: jest.fn(),
  issueTokensForOAuthUser: jest.fn(),
  getClientMeta: jest.fn(() => ({ ip: "127.0.0.1", userAgent: "jest" })),
}));

const request = require("supertest");
const app = require("../src/app");
const authService = require("../src/services/auth.service");

describe("Auth APIs", () => {
  it("registers user", async () => {
    authService.register.mockResolvedValue({ user: { id: "u1", email: "john@example.com" }, otp: "123456" });

    const response = await request(app)
      .post("/api/v1/auth/register")
      .send({ name: "John", email: "john@example.com", mobile: "9876543210", password: "password123" });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });

  it("logs in user", async () => {
    authService.login.mockResolvedValue({
      user: { id: "u1", email: "john@example.com" },
      accessToken: "access-token",
      refreshToken: "refresh-token",
    });

    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({ identifier: "john@example.com", password: "password123" });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
