import pool from "../config/db.js";
import getReturnPolicy from "../utils/statusResolver.js";

class Transaction {

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

            const item = rows[0]

            if (item.status !== "Available") {
                const error = new Error(
                    `Cannot checkout "${item.name}". Current status is "${item.status}".`
                );
                error.statusCode = 409; // 409 Conflict
                throw error;
            }


            const insertSQL = `insert into transactions(equipment_id, borrower, purpose, checkout_date, checkout_time, expected_return_time, condition_out , status) values( ?,?,?,?,?,?,?, "Active")`;
            const [transResult] = await connection.query(insertSQL, [equipment_id, borrower, purpose, checkout_date, checkout_time, expected_return_time, condition_out]);
            const updateSQL = `UPDATE equipment set status = "Checked Out" where id = ?`

            await connection.query(updateSQL, [equipment_id]);


            
            await connection.commit();
            return transResult.insertId;

        }
        catch (error) {
            await connection.rollback();
            throw error;
        }
        finally {
            // release the connection back to the pool
            connection.release()
        }
    }

    static async findAll() {
        const sql = `SELECT t.*, e.asset_id, e.name AS equipment_name
      FROM transactions t
      JOIN equipment e ON t.equipment_id = e.id
      ORDER BY t.id asc `;


        const [rows] = await pool.query(sql);

        // map through rows and attach is_overdue toflag each trabaction

        const now = new Date();
        return rows.map(row => {

            const deadline = new Date(`${row.checkout_date} ${row.expected_return_time}`);
            const isOverdue = row.status === 'Active' && now > deadline

            return {
                ...row, is_Overdue: isOverdue
            }
        })

    }


    static async findOverDue() {


        try {
            //  selects all the Active in the tranactions
            const sql = `SELECT t.* , e.asset_id , e.name AS equipment_name 
        FROM transactions t 
        JOIN equipment e ON t.equipment_id = e.id
        WHERE t.status = 'Active'
        ORDER BY t.id ASC `

            const [rows] = await pool.query(sql);


            const now = new Date()
            return rows.filter(row => {

                const deadline = new Date(`${row.checkout_date} ${row.expected_return_time}`)

                return !isNaN(deadline.getTime() && now > deadline)
            })
        }
        catch (error) {
            console.error(error.message)
        }


    }

    static async returnItem(data) {
        const { transaction_id, asset_id, return_date, return_time, condition_in, damage_description, remarks } = data;
        const connection = await pool.getConnection()
        try {
            await connection.beginTransaction();

            // handles the status when an equipment is returned
            const whatCategorySQL = `SELECT category FROM equipment where asset_id = ?`
            const [rows] = await connection.query(whatCategorySQL, [asset_id]);

            const item = rows[0]

            const category = rows.length > 0 ? item.category : null;
            const policy = getReturnPolicy(category);
            const targetStatus = policy.resolveStatus(condition_in)


            //  first part ---updates the transaction table to show the it has been returned
            const updateTransactionSQL = "update transactions set  return_date = ? , return_time = ? , condition_in =? , damage_description =? ,remarks =?, status = 'Completed' where id= ?";
            await connection.query(updateTransactionSQL, [return_date, return_time, condition_in, damage_description, remarks, transaction_id]);


            // second part---- update the equipment to show the status and condition
            const updateEquipmentSQL = `UPDATE equipment set status = ? , \`condition\` = ? where id =?`


            await connection.query(updateEquipmentSQL, [targetStatus, condition_in, item.id])



            await connection.commit();
            return transaction_id;


        }

        catch (error) {
            await connection.rollback();
            throw error;
        }

        finally {
            connection.release()
        }
    };

    static async findEquipment(equipment_id) {

        try {
            const sql = `SELECT t.*, e.asset_id , e.name AS equipment_name 
        FROM transactions t
        JOIN equipment e ON equipment_id = e.id
        WHERE t.equipment_id = ?
        ORDER BY t.checkout_date DESC , t.id DESC`;

            const [rows] = await pool.query(sql, [equipment_id]);

            const now = new Date();
            return rows.filter(row => {
                const deadline = `${row.checkout_date} ${row.expected_return_time}`;
                const isOverdue = row.status === "Active" && now > deadline;

                return {
                    ...row, is_Overdue: isOverdue
                };
            });

        }
        catch (error) {
            console.log(error.message)
        };


    };

    static async findByBorrower(borrower) {
        try {
            const sql = `SELECT t.* , e.asset_id ,e.name AS equipment_name
            FROM transactions t
            JOIN equipment e ON t.equipment_id = e.id
            WHERE t.borrower LIKE ? 
            ORDER BY return_date DESC`

            const [rows] = await pool.query(sql, [`${borrower}`]);

            return rows;
        }
        catch (error) {
            console.log(error.message)
        }
    }


}

export default Transaction;