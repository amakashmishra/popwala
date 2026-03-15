const express = require("express");
const authRoutes = require("./auth.routes");
const userRoutes = require("../modules/user/user.routes");
const healthRoutes = require("./health.routes");
const adminRoutes = require("../modules/admin/admin.routes");
const architectRoutes = require("../modules/architect/architect.routes");
const contractorRoutes = require("../modules/contractor/contractor.routes");
const bannerRoutes = require("../modules/banner/banner.routes");

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/admin", adminRoutes);
router.use("/architect", architectRoutes);
router.use("/contractor", contractorRoutes);
router.use("/banners", bannerRoutes);

module.exports = router;
