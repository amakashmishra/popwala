const express = require("express");
const adminAuth = require("../../middlewares/adminAuth.middleware");
const validate = require("../../middlewares/validate.middleware");
const adminAuthController = require("./admin-auth.controller");
const { adminUpdateUserStatusSchema } = require("../../validators/user.validator");
const {
  adminLoginSchema,
  adminForgotPasswordSchema,
  adminResetPasswordSchema,
  adminChangePasswordSchema,
} = require("../../validators/admin-auth.validator");
const {
  createContractorSchema,
  updateContractorSchema,
  listContractorsQuerySchema,
} = require("../../validators/contractor.validator");
const adminController = require("./admin.controller");
const contractorManagementController = require("./contractor-management.controller");

const router = express.Router();

/**
 * @swagger
 * /api/v1/admin/auth/login:
 *   post:
 *     tags: [Admin Auth]
 *     summary: Admin login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               email:
 *                 type: string
 *               identifier:
 *                 type: string
 *               password:
 *                 type: string
 *               rememberMe:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 */
router.post("/auth/login", validate(adminLoginSchema), adminAuthController.login);

/**
 * @swagger
 * /api/v1/admin/auth/forgot-password:
 *   post:
 *     tags: [Admin Auth]
 *     summary: Request admin password reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset instructions processed
 */
router.post("/auth/forgot-password", validate(adminForgotPasswordSchema), adminAuthController.forgotPassword);

/**
 * @swagger
 * /api/v1/admin/auth/reset-password:
 *   post:
 *     tags: [Admin Auth]
 *     summary: Reset admin password using token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, newPassword]
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid token or validation error
 */
router.post("/auth/reset-password", validate(adminResetPasswordSchema), adminAuthController.resetPassword);

/**
 * @swagger
 * /api/v1/admin/auth/profile:
 *   get:
 *     tags: [Admin Auth]
 *     summary: Get admin profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin profile fetched
 *       401:
 *         description: Unauthorized
 */
router.get("/auth/profile", adminAuth, adminAuthController.getProfile);

/**
 * @swagger
 * /api/v1/admin/auth/change-password:
 *   put:
 *     tags: [Admin Auth]
 *     summary: Change admin password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed
 *       400:
 *         description: Validation or credential error
 *       401:
 *         description: Unauthorized
 */
router.put("/auth/change-password", adminAuth, validate(adminChangePasswordSchema), adminAuthController.changePassword);

/**
 * @swagger
 * /api/v1/admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: List platform users for admin panel
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Users fetched
 *       401:
 *         description: Unauthorized
 */
router.get("/users", adminAuth, adminController.listUsers);

/**
 * @swagger
 * /api/v1/admin/users/{id}/status:
 *   patch:
 *     tags: [Admin]
 *     summary: Update user status (active/blocked/inactive)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, blocked, inactive]
 *     responses:
 *       200:
 *         description: User status updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.patch(
  "/users/:id/status",
  adminAuth,
  validate(adminUpdateUserStatusSchema),
  adminController.updateUserStatus
);

/**
 * @swagger
 * /api/v1/admin/contractors:
 *   get:
 *     tags: [Admin]
 *     summary: List contractors
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Contractors fetched
 */
router.get("/contractors", adminAuth, validate(listContractorsQuerySchema, "query"), contractorManagementController.listContractors);

/**
 * @swagger
 * /api/v1/admin/contractors:
 *   post:
 *     tags: [Admin]
 *     summary: Create contractor
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, phoneNumber, companyName, address, password]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               companyName:
 *                 type: string
 *               address:
 *                 type: string
 *               password:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       201:
 *         description: Contractor created
 */
router.post("/contractors", adminAuth, validate(createContractorSchema), contractorManagementController.createContractor);

/**
 * @swagger
 * /api/v1/admin/contractors/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Get contractor by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contractor fetched
 */
router.get("/contractors/:id", adminAuth, contractorManagementController.getContractorById);

/**
 * @swagger
 * /api/v1/admin/contractors/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Update contractor
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               companyName:
 *                 type: string
 *               address:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Contractor updated
 */
router.put("/contractors/:id", adminAuth, validate(updateContractorSchema), contractorManagementController.updateContractor);

/**
 * @swagger
 * /api/v1/admin/contractors/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete contractor
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contractor deleted
 */
router.delete("/contractors/:id", adminAuth, contractorManagementController.deleteContractor);

module.exports = router;
