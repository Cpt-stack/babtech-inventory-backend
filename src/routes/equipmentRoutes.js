import { Router } from "express"; // allows you to create a separate group of routes ...instead of putting everthing in the server.js file
import equipmentController from "../controllers/equipmentController.js"; // contains to functions  getAll() and create()

const router = Router();  // create an expreaa Router object


// map endpoints to controller methods

router.get('/get', (request, response) => equipmentController.getAll(request, response))
// when a GET request comes to / , it calls equipmentController.getAll() ---- the router.get("/") -- means  --- /api/equipmewnt( declared in the server) 

router.delete("/delete/:id", (req, res) => { equipmentController.deleteEquipment(req, res) })

router.post('/Add', (req, res) => equipmentController.create(req, res));
// or 
// router.post('/',equipmentController.create);  --- since the container methods on the class instance's this


export default router;