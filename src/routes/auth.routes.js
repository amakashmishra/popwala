const express = require("express");
const passport = require("../config/passport");
const authController = require("../controllers/auth.controller");
const validate = require("../middlewares/validate.middleware");
const env = require("../config/env");
const {
  registerSchema,
  loginSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailOtpSchema,
  resendEmailOtpSchema,
} = require("../validators/auth.validator");

const router = express.Router();
const isGoogleAuthConfigured =
  Boolean(env.GOOGLE_CLIENT_ID) &&
  Boolean(env.GOOGLE_CLIENT_SECRET) &&
  Boolean(env.GOOGLE_CALLBACK_URL);

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */
/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
/**
 * @swagger
 * /api/v1/auth/refresh-token:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Token refreshed
 *       401:
 *         description: Invalid refresh token
 */
/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout current user
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
/**
 * @swagger
 * /api/v1/auth/google:
 *   get:
 *     tags: [Auth]
 *     summary: Start Google OAuth flow
 *     responses:
 *       302:
 *         description: Redirects to Google authentication
 */
/**
 * @swagger
 * /api/v1/auth/google/callback:
 *   get:
 *     tags: [Auth]
 *     summary: Google OAuth callback
 *     responses:
 *       200:
 *         description: Google authentication successful
 *       302:
 *         description: Redirect response from OAuth flow
 */
router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh-token", validate(refreshSchema), authController.refresh);
router.post("/logout", authController.logout);
router.post("/forgot-password", validate(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), authController.resetPassword);
router.post("/verify-email-otp", validate(verifyEmailOtpSchema), authController.verifyEmailOtp);
router.post("/resend-email-otp", validate(resendEmailOtpSchema), authController.resendEmailOtp);

if (isGoogleAuthConfigured) {
  router.get("/google", (req, res, next) => {
    const redirect = req.query.redirect || `${env.FRONTEND_URL}/auth?google=success`;
    const state = Buffer.from(JSON.stringify({ redirect }), "utf8").toString("base64url");

    return passport.authenticate("google", {
      scope: ["profile", "email"],
      session: false,
      state,
    })(req, res, next);
  });

  router.get(
    "/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: `${env.FRONTEND_URL}/auth?google=error` }),
    authController.googleCallback
  );
} else {
  const handler = (req, res) =>
    res.status(503).json({
      success: false,
      message: "Google login is not configured on the server",
      errorCode: "GOOGLE_AUTH_NOT_CONFIGURED",
    });

  router.get("/google", handler);
  router.get("/google/callback", handler);
}

module.exports = router;
