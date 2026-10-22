import bcrypt from "bcryptjs";
import pool from "../config/db.js";


class Users {
    static async create({ full_name, email, password, role }) {
        const hashedPassword = await bcrypt.hash(password, 10);

        const InsertUser = `insert into users (full_name,email,password,role)values(?,?,?,?)`
        const [records] = await pool.query(InsertUser, [full_name, email, hashedPassword, role])

        return records.insertId;

    }

    static async findAll() {
        const sql = `SELECT id, full_name, email, role, created_at FROM users ORDER BY created_at DESC`;
        const [rows] = await pool.query(sql);
        return rows;
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


    static async setToken(token, expires_At, user_id) {
        const sql = `UPDATE users SET reset_token = ? , reset_token_expires=? WHERE id =?`

      
        const [rows] = await pool.query(sql, [token, new Date(expires_At), user_id]);

        return rows.affectedRows;
    }

    static async findByToken(token) {
        const sql = `  SELECT id, reset_token_expires FROM users WHERE reset_token = ? `;

        const [rows] = await pool.query(sql, [token]);

        return rows.length > 0 ? rows[0] : null;
    }

    static async Reset(newHashedPassword, user_id) {
        const sql = `UPDATE users SET password =?, reset_token = NULL , reset_token_expires=NULL WHERE id =?`

        const [rows] = await pool.query(sql, [newHashedPassword, user_id]);

        return rows.affectedRows;
    }



    static async updateRole(userId, newRole) {
        const sql = 'UPDATE users SET role = ? WHERE id = ?';
        const [rows] = await pool.query(sql, [newRole, userId]);
        return rows.affectedRows > 0;
    }

}

export default Users;