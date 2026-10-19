import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Users from "../models/Users.js";
import AppError from "../utils/AppError.js";
import dotenv from "dotenv";
import crypto from "crypto";
import { sendPasswordResetEmail } from "../services/emailService.js";



dotenv.config();

class authController {
    // POST /api/ register

    async register(req, res, next) {

        try {
            const { full_name, email, password, role } = req.body;
            if (!full_name || !email || !password || !role) {
                throw new AppError("Please provide full name, email, and password.", 400);
            }


            const existingUser = await Users.findByEmail(email);

            if (existingUser) {
                throw new AppError("An account with this email already exists.", 409);
            }

            // Create new user (User model hashes password internally)
            const userId = await Users.create({
                full_name,
                email,
                password,
                role: role || "Student"
            })

            return res.status(201).json({
                success: true,
                message: "User registered successfully.",
                userId
            });
        }
        catch (error) {
            next(error)
        }
    }

    async getAllUsers(req, res, next) {
        try {
            const users = await Users.findAll();
            return res.status(200).json({
                success: true,
                users
            });
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {

        try {
            const { email, password } = req.body;

            if (!email || !password) {
                throw new AppError("Please provide both email and password.", 400)
            }

            //  Check if user exists
            const user = await Users.findByEmail(email);
            if (!user) {
                throw new AppError("Invalid email or password.", 401)
            }

            //  Verify hashed password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                throw new AppError("Invalid email or password.", 401);
            }

            // 3. Generate signed JWT token
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
            );

            return res.status(200).json({
                success: true,
                message: "Login successful.",
                token,
                user: {
                    id: user.id,
                    full_name: user.full_name,
                    email: user.email,
                    role: user.role
                }
            })

        }
        catch (error) {
            next(error)
        }
    }

    
    async updateUserRole(req, res, next) {
        try {
            const { targetUserId } = req.params;
            const { role } = req.body;

            const allowedRoles = ["admin", "technician", "student"];

            if (!role || !allowedRoles.includes(role.toLowerCase())) {
                return next(new AppError("Invalid role specified. Must be admin, technician, or a Student.", 400));
            }

            // Prevent self-demotion or self-modification if needed
            if (parseInt(targetUserId, 10) === req.user.id && role.toLowerCase() !== "admin") {
                return next(new AppError("You cannot revoke your own admin rights.", 400));
            }

            const userToUpdate = await Users.findById(targetUserId);
            if (!userToUpdate) {
                return next(new AppError("User not found.", 404));
            }

            const formattedRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();

            await Users.updateRole(targetUserId, formattedRole);

            return res.status(200).json({
                success: true,
                message: `User role successfully updated to ${role}.`
            });
        } catch (error) {
            next(error);
        }
    };



}

export default new authController();