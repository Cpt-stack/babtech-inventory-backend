import pool from "../config/db.js";
import getReturnPolicy from "../utils/statusResolver.js";

class Transaction {

    // Helper method to safely parse MySQL dates and return times into valid JS Date objects
    static parseDeadline(checkoutDate, returnTime) {
        if (!checkoutDate || !returnTime) return null;

        let datePart = "";
        if (checkoutDate instanceof Date) {
            datePart = checkoutDate.toISOString().split("T")[0];
        } else if (typeof checkoutDate === "string") {
            datePart = checkoutDate.includes("T")
                ? checkoutDate.split("T")[0]
                : checkoutDate.split(" ")[0];
        }

        const timePart = returnTime.trim();
        const deadline = new Date(`${datePart}T${timePart.length === 5 ? timePart + ":00" : timePart}`);

        return isNaN(deadline.getTime()) ? null : deadline;
    }

    static async checkout(data) {
        const { equipment_id, borrower, purpose, checkout_date, checkout_time, expected_return_time, condition_out } = data;

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const checkSQL = `SELECT id, name, status FROM equipment WHERE id = ? FOR UPDATE`;
            const [rows] = await connection.query(checkSQL, [equipment_id]);
            if (rows.length === 0) {
                const error = new Error("Equipment not Found");
                error.statusCode = 404;
                throw error;
            }

            const item = rows[0];

            if (item.status !== "Available") {
                const error = new Error(
                    `Cannot checkout "${item.name}". Current status is "${item.status}".`
                );
                error.statusCode = 409;
                throw error;
            }

            const insertSQL = `INSERT INTO transactions(equipment_id, borrower, purpose, checkout_date, checkout_time, expected_return_time, condition_out, status) VALUES(?,?,?,?,?,?,?, "Active")`;
            const [transResult] = await connection.query(insertSQL, [equipment_id, borrower, purpose, checkout_date, checkout_time, expected_return_time, condition_out]);
            
            const updateSQL = `UPDATE equipment SET status = "Checked Out" WHERE id = ?`;
            await connection.query(updateSQL, [equipment_id]);

            await connection.commit();
            return transResult.insertId;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async findAll() {
        const sql = `SELECT t.*, e.asset_id, e.name AS equipment_name
                     FROM transactions t
                     JOIN equipment e ON t.equipment_id = e.id
                     ORDER BY t.id desc`;

        const [rows] = await pool.query(sql);
        const now = new Date();

        return rows.map(row => {
            const deadline = Transaction.parseDeadline(row.checkout_date, row.expected_return_time);
            const isOverdue = row.status === 'Active' && deadline !== null && now > deadline;

            return {
                ...row,
                is_Overdue: isOverdue
            };
        });
    }

    static async findOverDue() {
        try {
            const sql = `SELECT t.*, e.asset_id, e.name AS equipment_name 
                         FROM transactions t 
                         JOIN equipment e ON t.equipment_id = e.id
                         WHERE t.status = 'Active'
                         ORDER BY t.id desc`;

            const [rows] = await pool.query(sql);
            const now = new Date();

            return rows.filter(row => {
                const deadline = Transaction.parseDeadline(row.checkout_date, row.expected_return_time);
                return deadline !== null && now > deadline;
            });
        } catch (error) {
            console.error("Error finding overdue transactions:", error.message);
            return [];
        }
    }

    static async returnItem(data) {
        const {
            transaction_id,
            asset_id,
            return_date,
            return_time,
            condition_in,
            damage_description,
            remarks
        } = data;

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const whatCategorySQL = "SELECT id, category FROM equipment WHERE asset_id = ? FOR UPDATE";
            const [rows] = await connection.query(whatCategorySQL, [asset_id]);

            if (rows.length === 0) {
                const error = new Error(`Equipment with Asset ID "${asset_id}" not found.`);
                error.statusCode = 404;
                throw error;
            }

            const item = rows[0];

            const policy = getReturnPolicy(item.category);
            const targetStatus = policy.resolveStatus(condition_in);

            const updateTransactionSQL = `
                UPDATE transactions 
                SET 
                    return_date = ?, 
                    return_time = ?, 
                    condition_in = ?, 
                    damage_description = ?, 
                    remarks = ?, 
                    status = 'Completed' 
                WHERE id = ? AND status = 'Active'
            `;

            const [transResult] = await connection.query(updateTransactionSQL, [
                return_date,
                return_time,
                condition_in,
                damage_description || null,
                remarks || null,
                transaction_id
            ]);

            if (transResult.affectedRows === 0) {
                const error = new Error(
                    `Transaction #${transaction_id} could not be updated. It may already be completed or does not exist.`
                );
                error.statusCode = 400;
                throw error;
            }

            const updateEquipmentSQL = "UPDATE equipment SET status = ?, `condition` = ? WHERE id = ?";
            await connection.query(updateEquipmentSQL, [targetStatus, condition_in, item.id]);

            await connection.commit();
            return transaction_id;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async findEquipment(equipment_id) {
        try {
            const sql = `SELECT t.*, e.asset_id, e.name AS equipment_name 
                         FROM transactions t
                         JOIN equipment e ON t.equipment_id = e.id
                         WHERE t.equipment_id = ?
                         ORDER BY t.checkout_date DESC, t.id DESC`;

            const [rows] = await pool.query(sql, [equipment_id]);
            const now = new Date();

            return rows.map(row => {
                const deadline = Transaction.parseDeadline(row.checkout_date, row.expected_return_time);
                const isOverdue = row.status === "Active" && deadline !== null && now > deadline;

                return {
                    ...row,
                    is_Overdue: isOverdue
                };
            });
        } catch (error) {
            console.error("Error finding equipment transactions:", error.message);
            throw error;
        }
    }

    static async findByBorrower(borrower) {
        try {
            const sql = `SELECT t.*, e.asset_id, e.name AS equipment_name
                         FROM transactions t
                         JOIN equipment e ON t.equipment_id = e.id
                         WHERE t.borrower LIKE ? 
                         ORDER BY return_date DESC`;

            const [rows] = await pool.query(sql, [`%${borrower}%`]);
            return rows;
        } catch (error) {
            console.error("Error finding borrower transactions:", error.message);
            throw error;
        }
    }
}

export default Transaction;