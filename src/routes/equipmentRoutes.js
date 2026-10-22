import { Router } from "express"; 
import equipmentController from "../controllers/equipmentController.js"; 

const router = Router();  


// map endpoints to controller methods

router.get('/get', (request, response) => equipmentController.getAll(request, response))
 

router.delete("/delete/:asset_id", (req, res) => equipmentController.deleteEquipment(req, res))

router.post('/Add', (req, res) => equipmentController.create(req, res));



export default router;