jest.mock("../src/services/user.service", () => ({
  getMyProfile: jest.fn(),
  updateMyProfile: jest.fn(),
  listUsers: jest.fn(),
}));

jest.mock("../src/services/file.service", () => ({
  uploadImageBuffer: jest.fn(),
}));

jest.mock("../src/repositories/file.repository", () => ({
  create: jest.fn(),
}));

const jwt = require("jsonwebtoken");
const request = require("supertest");
const app = require("../src/app");
const userService = require("../src/services/user.service");

const token = jwt.sign({ sub: "u1", role: "user", email: "john@example.com" }, process.env.JWT_SECRET);

describe("User APIs", () => {
  it("gets current user profile", async () => {
    userService.getMyProfile.mockResolvedValue({ id: "u1", email: "john@example.com" });

    const response = await request(app)
      .get("/api/v1/users/me")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
