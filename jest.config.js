module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  setupFiles: ["<rootDir>/tests/setup-env.js"],
  collectCoverageFrom: ["src/**/*.js", "server.js"],
  coveragePathIgnorePatterns: ["/node_modules/"],
};
