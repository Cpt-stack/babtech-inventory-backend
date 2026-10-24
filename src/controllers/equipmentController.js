import Equipment from "../models/Equipment.js";  



class EquipmentController {


    // GET / api/equipment
    async getAll(request, response) { 
        

        
        try {

            const equipmentList = await Equipment.findAll();
            return response.status(200).json({
                success: true,
                count: equipmentList.length,
                data: equipmentList
            });
        }

        catch (error) {
            console.error("Error in getAll:", error.message)
            return response.status(500).json({ 
                success: false,
                error: "Server error retrieving equipment."
            });
        }
    }


    // POST /api /equipment
    async create(request, response) {


        try {
            const { asset_id, name, category, condition, status } = request.body;

            // basic vaildation

            if (!asset_id || !name || !category) {
                return response.status(400).json({ 
                    success: false,
                    error: "Please provide asset_id , name , category."
                })
            }
            //  checks if asset_id exists
            const existing = await Equipment.findByAssetId(asset_id);
            if (existing) {
                return response.status(409).json({ 
                    success: false,
                    error: `Equipment with Asset_Id ${asset_id} already exists.`
                })
            }



            // create through Modal 
            const newId = await Equipment.create({ asset_id, name, category, condition, status });

            return response.status(201).json({ 
                success: true,
                message: "Equipment registered successfully",
                data: {
                    id: newId,
                    asset_id,
                    name,
                    category,
                    condition: condition || "Good",
                    status: status || "Available"
                }
            })
        }

        catch (error) {
            console.error("An Error occurred", error.message)
            return response.status(500).json({
                success: false,
                error: "Server error registering equipment"
            })
        }
    }

    // DELETE/api
    async deleteEquipment(req, res) {
        try {
            const { asset_id} = req.params;

            const affectedRows = await Equipment.delete(asset_id);
            if (affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    error: `Equipment with Asset ID ${asset_id} not found.`
                })
            }

            return res.status(200).json({
                success: true,
                message: `Equipment with Asset Id: ${asset_id} has been deleted`
            })

        } catch (error) {
            console.log("Error occurred:", error.message);
            res.status(500).json({
                success: false,
                error: "Error occurred at server"
            })
        }
    }
}

export default new EquipmentController();




