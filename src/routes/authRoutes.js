import { Router } from "express";
import authController from "../controllers/authController.js";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";

const router = Router();

// Auth Endpoints
router.post("/register", (req, res, next) => authController.register(req, res, next));
router.post("/login", (req, res, next) => authController.login(req, res, next));
router.post("/forget", (req, res, next) => authController.ForgetPassword(req, res, next))
router.post("/reset/:token", (req, res, next) => authController.reset(req, res, next))


// Admin-Only Role Authorization
router.patch("/:targetUserId/role", protect, restrictTo("admin"), (req, res, next) => authController.updateUserRole(req, res, next));

router.get("/users", protect, restrictTo("admin"), (req, res, next) => authController.getAllUsers(req, res, next));

export default router;