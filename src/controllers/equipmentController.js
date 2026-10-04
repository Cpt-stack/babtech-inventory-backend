import Equipment from "../models/Equipment.js";  // imports the equipment class from the model file so methods...like findAll() , findByasset() and create() are made available
//Equipment controller decides what should happen


class EquipmentController {


    // GET / api/equipment
    async getAll(request, response) {  // intended to handle a request
    //  .... request --  contains information  coming from the client ---- response --- what the server uses to send something back to the client

    // we are use async and await because the dadtabse opeartions take time , so you wait for MYsql to respond.
        try {

            const equipmentList = await Equipment.findAll();
            return response.status(200).json({ // 200--- the request was successful
                success: true,
                count: equipmentList.length,
                data: equipmentList
            });
        }

        catch (error) {
            console.error("Error in getAll:", error.message)
            return response.status(500).json({ // 500 ---something went wrong in the server
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
                return response.status(400).json({ // 400 -- bad request
                    success: false,
                    error: "Please provide asset_id , name , category."
                })
            }
            //  checks if asset_id exists
            const existing = await Equipment.findByAssetId(asset_id);
            if (existing) {
                return response.status(409).json({ // 409 --- conflict
                    success: false,
                    error: `Equipment with Asset_Id ${asset_id} already exists.`
                })
            }



            // create through Modal 
            const newId = await Equipment.create({asset_id , name , category , condition,status});

            return  response.status(201).json({ // 201 -- a new resource was successfully created
                success: true,
                message: "Equipment registered successfully",
                data: {id: newId , asset_id , category }
            })
        }

        catch(error){
            console.error("An Error occurred", error.message)
            return response.status(500).json({// 500 ---something went wrong in the server
                success: false,
                error: "Server error registering equipment"
            })
        }
    }
}

export default new EquipmentController();




