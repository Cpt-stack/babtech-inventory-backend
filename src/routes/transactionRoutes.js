import transactionController from "../controllers/transactionController.js";

import { Router } from "express";
import validateCheck, { validateReturn } from "../middlewares/validators.js";
import { protect ,restrictTo } from "../middlewares/authMiddleware.js";

const router = Router();


//GET /api/transaction
router.get("/" ,protect,(req , res , next)=>transactionController.getAll(req , res , next));
router.get("/Overdue", protect, (req , res , next)=> transactionController.getOverDue(req , res , next))
router.get("/equipmentHistory/:id",protect, (req , res , next)=> transactionController.getEquipment(req , res , next))
router.get("/borrowerHistory/:borrower", protect, (req , res , next)=> transactionController.getBorrower(req , res , next))

//POST/api/transaction
router.post("/checkout",protect , restrictTo("Admin","Technician"), validateCheck, (req , res,next)=> transactionController.progressCheckout(req ,res,next))
router.post("/return", protect , restrictTo("Admin","Technician"),validateReturn, (req,res, next)=> transactionController.processReturn(req,res,next))


export default router;