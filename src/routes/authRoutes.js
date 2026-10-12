import { Router } from "express";
import authController from "../controllers/authController.js";


const router = Router()

// POST
router.post("/register", (req, res, next) => authController.register(req, res, next))
router.post("/login", (req, res, next) => authController.login(req, res, next))
router.post("/forgotPassword", (req, res, next) => { authController.forgotPassword(req, res, next) })
router.post("/reset/:token", (req, res, next) => authController.resetPassword(req, res, next))

export default router;