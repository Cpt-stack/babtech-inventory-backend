import pool from "../config/db.js";

// handles how equipment data is obtained and stored in the database

class Equipment {
    constructor(id, asset_id, name, category, condition, status, register_at) {
        this.id = id;
        this.asset_id = asset_id;
        this.name = name;
        this.category = category;
        this.condition = condition;
        this.status = status;
        this.registered_at = register_at;
    }

    static async findAll() {
        const query = "select * from equipment order by id asc";
        const [rows] = await pool.query(query);


        return rows.map((row) => new Equipment(
            row.id,
            row.asset_id,
            row.name,
            row.category,
            row.condition,
            row.status,
            row.registered_at
        )

        )
    };
    //  to find equipment by asset_id 
    static async findByAssetId(asset_id) {
        const query = "select * from equipment where asset_id = ?";
        const [rows] = await pool.query(query, [asset_id]);


        if (rows.length === 0) {
            return null
        };

        const row = rows[0];

        return new Equipment(
            row.id,
            row.asset_id,
            row.name,
            row.category,
            row.condition,
            row.status,
            row.registered_at
        )
    }

    //  to enter an equipment into the database


    static async create(data) {
        const { asset_id, name, category, condition = "Good", status = "Available", registered_at } = data;

        // const query = "INSERT INTO equipment(asset_id, name, category, `condition`, status) VALUES (?, ?, ?, ?, ?)" ;

        const query = `
    INSERT INTO equipment (asset_id, name, category, \`condition\`, status)
    VALUES (?, ?, ?, ?, ?)
  `;

        const [result] = await pool.query(query, [asset_id, name, category, condition, status]);

        return result.insertId;
    }

}

export default Equipment;

