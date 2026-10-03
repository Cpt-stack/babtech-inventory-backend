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
}

export default Users;