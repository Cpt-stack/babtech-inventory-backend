import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";
import Users from "../models/Users.js";
import dotenv from "dotenv"

dotenv.config();

// Guard 1: Verify token and identify user
export const protect = async (req, res, next) => {
    try {
        let token;

        // 1. Check if token exists in the Authorization header
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer ")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return next(
                new AppError("You are not logged in. Please log in to get access.", 401)
            );
        }

        // 2. Verify token signature and expiration
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Verify user still exists in database
        const currentUser = await Users.findById(decoded.id);
        if (!currentUser) {
            return next(
                new AppError("The user belonging to this token no longer exists.", 401)
            );
        }

        // 4. Attach verified user to request object
        req.Users = currentUser;
        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return next(new AppError("Invalid token. Please log in again.", 401));
        }
        if (error.name === "TokenExpiredError") {
            return next(new AppError("Your token has expired. Please log in again.", 401));
        }
        next(error);
    }
};

// Guard 2: Restrict route to specific roles (RBAC)
export const restrictTo = (...roles) => {
    return (req, res, next) => {
        // req.user was set by protect middleware right before this
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError("You do not have permission to perform this action.", 403)
            );
        }
        next();
    };
};