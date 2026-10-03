import AppError from "../utils/AppError.js";

const validateCheck = (req, res, next) => {
    console.log("--> 1. Inside validateReturn middleware");

    const errors = []
    const { equipment_id, borrower, purpose, checkout_date, checkout_time, expected_return_time } = req.body;


    if (!equipment_id) errors.push("equipment_id is required");
    if (!borrower || !borrower.trim()) errors.push("borrower name is required");
    if (!purpose || !purpose.trim()) errors.push("purpose is required");
    if (!checkout_date) errors.push("checkout_date is required");
    if (!checkout_time) errors.push("checkout_time is required");
    if (!expected_return_time) errors.push("expected_return_time is required");


    // Validate positive integer for ID
    if (equipment_id && (!Number.isInteger(Number(equipment_id)) || Number(equipment_id) <= 0)) {
        errors.push("equipment_id must be a valid positive number");
    }

    console.log("--> 2. Errors found:", errors)
    if (errors.length > 0) {
        return next(new AppError(errors.join(", "), 400));
    }

    next(); // Pass control to controller


}

export const validateReturn = (req, res, next) => {
    const { transaction_id, equipment_id, condition_in, return_date, return_time } = req.body;
    const errors = []

    if (!transaction_id) errors.push("transaction_id is required");
    if (!equipment_id) errors.push("equipment_id is required");
    if (!condition_in) errors.push("condition_in is required");
    if (!return_date) errors.push("return_date is required");
    if (!return_time) errors.push("return_time is required");


    const allowedConditions = ["Good", "Fair", "Damaged"];
    if (!allowedConditions.includes(condition_in)) {
        errors.push('Condition must be "Good", "Fair", or "Damaged".');
    }

    if (errors.length > 0) {
        return next(new AppError(errors.join(", "), 400));
    }

    next(); // Pass control to controller
}

export default validateCheck 
