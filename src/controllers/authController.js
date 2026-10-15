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

    // post
    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body

            if (!email || "") {
                throw new Error("Enter an Email")
            }
            const user = await Users.findByEmail(email)

            if (!user) {
                return res.status(200).json({
                    success: true,
                    message: "If an account exists with that email, a password reset link has been sent."
                });
            }

            const resetToken = crypto.randomBytes(32).toString("hex");

            const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex")

            const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

            await Users.setPasswordResetToken(user.id, hashedToken, expiresAt)

            const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
            const resetUrl = `${clientUrl}/reset/${resetToken}`;

console.log(resetToken)
            try {
                await sendPasswordResetEmail(user.email, resetUrl);
            } catch (mailError) {

                // clear the token from the database so the user isn't stuck with an unreceived token.
                await Users.setPasswordResetToken(user.id, null, null);


                return next(new AppError("Failed to deliver reset email. Please try again later.", 500));
            }

            return res.status(200).json({
                success: true,
                message: "If an account exists with that email, a password reset link has been sent."
            });

        } catch (error) {
            next(error)
        }
    }

    // POST resetPassword

    async resetPassword(req, res, next) {
        try {
            const { token } = req.params;
            const { password } = req.body;

            if (!password || password.length < 6) {
                throw new AppError("Password must be at least 6 characters long.", 400);
            }


            const hashedToken = crypto.createHash("sha256").update(token).digest("hex")
            const user = await Users.findByResetToken(hashedToken);
            if (!user) {
                throw new AppError("Password reset link is invlaid or has expired.", 400)
            }

            await Users.updatePassword(user.id, password)

            return res.status(200).json({
                success: true,
                message: "Passowrd has been Resent"
            })

        } catch (error) {
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