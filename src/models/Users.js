import bcrypt from "bcryptjs";
import pool from "../config/db.js";


class Users {
    static async create({ full_name, email, password, role }) {
        const hashedPassword = await bcrypt.hash(password, 10);

        const InsertUser = `insert into users (full_name,email,password,role)values(?,?,?,?)`
        const [records] = await pool.query(InsertUser, [full_name, email, hashedPassword, role])

        return records.insertId;

    }

    static async findByEmail(email) {
        const sql = `SELECT id , full_name , email , password , role,created_at from users where email  = ? `;

        const [rows] = await pool.query(sql, [email]);

        return rows.length > 0 ? rows[0] : null;
    }

    static async findById(id) {
        const sql = `SELECT id , full_name , email, password , role , created_at from users where id = ?`;

        const [rows] = await pool.query(sql, [id]);
        return rows.length > 0 ? rows[0] : null;
    }


    static async setPasswordResetToken(userId, hashedToken, expiresAt) {

        const sql = 'UPDATE users set reset_token= ?, reset_token_expires =? where id =?'

        const [rows] = await pool.query(sql, [hashedToken, expiresAt, userId])
        if (rows.affectedRows === 0) {
            throw new Error("User not found or No rows were affetced ")
        }

        return true;
    }

    static async findByResetToken(hashedToken) {
        const sql = `SELECT id, email FROM users WHERE reset_token = ? AND reset_token_expires > NOW()`
        const [results] = await pool.query(sql, [hashedToken])

        return results.length > 0 ? results[0] : null;

    }

    static async updatePassword(userId, newPassword) {
        const newHashedPasword = await bcrypt.hash(newPassword, 10)
        const sql = 'UPDATE users set password = ? , reset_token =NULL ,reset_token_expires =NULL where id =?';

        const [rows] = await pool.query(sql, [newHashedPasword, userId])
        return rows.affectedRows>0 ;
    }


}

export default Users;