import Transaction from "../models/Transaction.js";
import AppError from "../utils/AppError.js";



class transactionController {


    //GET/api/getall
    async getAll(req, res, next) {
        try {
            const records = await Transaction.findAll()

            return res.status(200).json({
                success: true,
                count: records.length,
                data: records

            });
        }

        catch (error) {
            next(error)
        }
    }

    // GET/ap1/OverDue
    async getOverDue(req, res, next) {

        try {
            const OverDueList = await Transaction.findOverDue();
            res.status(200).json({
                success: true,
                count: OverDueList.length,
                data: OverDueList
            })
        }

        catch (error) {
            next(error)
        }

    }


    // GET/api/historyEquipment
    async getEquipment(req, res, next) {
        try {
            const { id } = req.params;
            const history = await Transaction.findEquipment(id);

            res.status(200).json({
                success: true,
                count: history.length,
                data: history
            })
        }

        catch (error) {
            next(error)
        }
    }


    //GET/api/borrowerHistory
    async getBorrower(req, res, next) {
        try {
            const { borrower } = req.params;
            const history = await Transaction.findByBorrower(borrower);

            res.status(200).json({
                success: true,
                count: history.length,
                data: history
            })
        }
        catch (error) {
            next(error)
        }
    }

    // POST/api/checkout
    async progressCheckout(request, response, next) {

        try {

            const newTransactionId = await Transaction.checkout(request.body)

            return response.status(201).json({
                success: true,
                message: 'Equipment successfully checked out.',
                transactionId: newTransactionId
            })


        }
        catch (error) {
            next(error)
        }
    }



    async processReturn(req, res, next) {

        // POST/api/return


        try {

            const newReturnId = await Transaction.returnItem(req.body) // calling the model
            return res.status(200).json({
                success: true,
                message: "Equipment successfully returned",
                transaction_id: newReturnId
            })

        }


        catch (error) {
            next(error)
        }
    }

}

export default new transactionController();