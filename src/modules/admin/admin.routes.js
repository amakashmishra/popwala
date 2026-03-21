const express = require("express");
const adminAuth = require("../../middlewares/adminAuth.middleware");
const upload = require("../../middlewares/upload.middleware");
const validate = require("../../middlewares/validate.middleware");
const adminAuthController = require("./admin-auth.controller");
const { adminUpdateUserStatusSchema } = require("../../validators/user.validator");
const {
  adminLoginSchema,
  adminRefreshSchema,
  adminForgotPasswordSchema,
  adminResetPasswordSchema,
  adminChangePasswordSchema,
} = require("../../validators/admin-auth.validator");
const {
  createContractorSchema,
  updateContractorSchema,
  listContractorsQuerySchema,
} = require("../../validators/contractor.validator");
const {
  createArchitectSchema,
  updateArchitectSchema,
  listArchitectsQuerySchema,
} = require("../../validators/architect.validator");
const {
  createBannerSchema,
  updateBannerSchema,
  updateBannerStatusSchema,
  listBannersQuerySchema,
} = require("../../validators/banner.validator");
const {
  createCatalogSchema,
  updateCatalogSchema,
  updateCatalogStatusSchema,
  listCatalogQuerySchema,
} = require("../../validators/catalog.validator");
const adminController = require("./admin.controller");
const contractorManagementController = require("./contractor-management.controller");
const architectManagementController = require("./architect-management.controller");
const bannerManagementController = require("./banner-management.controller");
const stylesController = require("../catalog/styles.controller");
const typesController = require("../catalog/types.controller");
const categoriesController = require("../catalog/categories.controller");
const leadsController = require("./leads.controller");

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
 * /api/v1/admin/auth/refresh-token:
 *   post:
 *     tags: [Admin Auth]
 *     summary: Refresh admin access token
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed
 *       401:
 *         description: Invalid refresh token
 */
router.post("/auth/refresh-token", validate(adminRefreshSchema), adminAuthController.refresh);

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
 * /api/v1/admin/dashboard/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Fetch dashboard statistics
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
           format: date
 *         description: Start of date range (inclusive)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End of date range (inclusive)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats fetched
 *       401:
 *         description: Unauthorized
 */
router.get("/dashboard/stats", adminAuth, adminController.getDashboardStats);

/**
 * @swagger
 * /api/v1/admin/contractors:
 *   get:
 *     tags: [Admin Contractors]
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
 *     tags: [Admin Contractors]
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
 *     tags: [Admin Contractors]
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
 *     tags: [Admin Contractors]
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
 *     tags: [Admin Contractors]
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

/**
 * @swagger
 * /api/v1/admin/architects:
 *   get:
 *     tags: [Admin Architects]
 *     summary: List architects
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
 *         description: Architects fetched
 */
router.get("/architects", adminAuth, validate(listArchitectsQuerySchema, "query"), architectManagementController.listArchitects);

/**
 * @swagger
 * /api/v1/admin/architects:
 *   post:
 *     tags: [Admin Architects]
 *     summary: Create architect
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
 *         description: Architect created
 */
router.post("/architects", adminAuth, validate(createArchitectSchema), architectManagementController.createArchitect);

/**
 * @swagger
 * /api/v1/admin/architects/{id}:
 *   get:
 *     tags: [Admin Architects]
 *     summary: Get architect by id
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
 *         description: Architect fetched
 */
router.get("/architects/:id", adminAuth, architectManagementController.getArchitectById);

/**
 * @swagger
 * /api/v1/admin/architects/{id}:
 *   put:
 *     tags: [Admin Architects]
 *     summary: Update architect
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
 *         description: Architect updated
 */
router.put("/architects/:id", adminAuth, validate(updateArchitectSchema), architectManagementController.updateArchitect);

/**
 * @swagger
 * /api/v1/admin/architects/{id}:
 *   delete:
 *     tags: [Admin Architects]
 *     summary: Delete architect
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
 *         description: Architect deleted
 */
router.delete("/architects/:id", adminAuth, architectManagementController.deleteArchitect);

/**
 * @swagger
 * /api/v1/admin/banners:
 *   get:
 *     tags: [Website Banners]
 *     summary: List website banners for admin
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
 *         description: Banners fetched
 */
router.get("/banners", adminAuth, validate(listBannersQuerySchema, "query"), bannerManagementController.listBanners);

/**
 * @swagger
 * /api/v1/admin/banners:
 *   post:
 *     tags: [Website Banners]
 *     summary: Create website banner
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image, titleEn, titleHi, titleMr, descriptionEn, descriptionHi, descriptionMr]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               titleEn:
 *                 type: string
 *               titleHi:
 *                 type: string
 *               titleMr:
 *                 type: string
 *               descriptionEn:
 *                 type: string
 *               descriptionHi:
 *                 type: string
 *               descriptionMr:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       201:
 *         description: Banner created
 */
router.post(
  "/banners",
  adminAuth,
  upload.single("image"),
  validate(createBannerSchema),
  bannerManagementController.createBanner
);

/**
 * @swagger
 * /api/v1/admin/banners/{id}:
 *   get:
 *     tags: [Website Banners]
 *     summary: Get banner by id
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
 *         description: Banner fetched
 */
router.get("/banners/:id", adminAuth, bannerManagementController.getBannerById);

/**
 * @swagger
 * /api/v1/admin/banners/{id}:
 *   put:
 *     tags: [Website Banners]
 *     summary: Update banner
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               titleEn:
 *                 type: string
 *               titleHi:
 *                 type: string
 *               titleMr:
 *                 type: string
 *               descriptionEn:
 *                 type: string
 *               descriptionHi:
 *                 type: string
 *               descriptionMr:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Banner updated
 */
router.put(
  "/banners/:id",
  adminAuth,
  upload.single("image"),
  validate(updateBannerSchema),
  bannerManagementController.updateBanner
);

/**
 * @swagger
 * /api/v1/admin/banners/{id}/status:
 *   patch:
 *     tags: [Website Banners]
 *     summary: Activate or deactivate banner
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
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Banner status updated
 */
router.patch(
  "/banners/:id/status",
  adminAuth,
  validate(updateBannerStatusSchema),
  bannerManagementController.updateBannerStatus
);

/**
 * @swagger
 * /api/v1/admin/banners/{id}:
 *   delete:
 *     tags: [Website Banners]
 *     summary: Delete banner
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
 *         description: Banner deleted
 */
router.delete("/banners/:id", adminAuth, bannerManagementController.deleteBanner);

router.get("/leads/recent", adminAuth, leadsController.listRecentLeads);

router.get(
  "/product-types",
  adminAuth,
  validate(listCatalogQuerySchema, "query"),
  typesController.listTypes
);
router.post("/product-types", adminAuth, validate(createCatalogSchema), typesController.createType);
router.get("/product-types/:id", adminAuth, typesController.getType);
router.put("/product-types/:id", adminAuth, validate(updateCatalogSchema), typesController.updateType);
router.patch(
  "/product-types/:id/status",
  adminAuth,
  validate(updateCatalogStatusSchema),
  typesController.updateTypeStatus
);
router.delete("/product-types/:id", adminAuth, typesController.deleteType);

router.get(
  "/categories",
  adminAuth,
  validate(listCatalogQuerySchema, "query"),
  categoriesController.listCategories
);
router.post("/categories", adminAuth, validate(createCatalogSchema), categoriesController.createCategory);
router.get("/categories/:id", adminAuth, categoriesController.getCategory);
router.put("/categories/:id", adminAuth, validate(updateCatalogSchema), categoriesController.updateCategory);
router.patch(
  "/categories/:id/status",
  adminAuth,
  validate(updateCatalogStatusSchema),
  categoriesController.updateCategoryStatus
);
router.delete("/categories/:id", adminAuth, categoriesController.deleteCategory);

router.get(
  "/styles",
  adminAuth,
  validate(listCatalogQuerySchema, "query"),
  stylesController.listStyles
);
router.post(
  "/styles",
  adminAuth,
  upload.single("image"),
  validate(createCatalogSchema),
  stylesController.createStyle
);
router.get("/styles/:id", adminAuth, stylesController.getStyle);
router.put(
  "/styles/:id",
  adminAuth,
  upload.single("image"),
  validate(updateCatalogSchema),
  stylesController.updateStyle
);
router.patch(
  "/styles/:id/status",
  adminAuth,
  validate(updateCatalogStatusSchema),
  stylesController.updateStyleStatus
);
router.delete("/styles/:id", adminAuth, stylesController.deleteStyle);

module.exports = router;
