import express from 'express'; // used to create my server api
import cors from 'cors'; // controls whether request from another origin are allowed to accesss the backend ... frontend can be running on another :5173 , but backend can be running on : 3000
import dotenv from 'dotenv';  // this let you load environment variables from a .env file
import equipmentRoutes from "./src/routes/equipmentRoutes.js"
import transactionRoutes from "./src/routes/transactionRoutes.js"
import authRoutes from "./src/routes/authRoutes.js"
import errorHandler from './src/middlewares/errorHandler.js';


dotenv.config(); // read the .env file and load those vsriables into process.env

const app = express(); // creates the express application  -- app is like the backend server/ application
const PORT = process.env.PORT || 5000; // use want is stored in the enviroment variable port or load 5000


// middleware --- code that runs while a request is travelling through your express application
app.use(cors())  // -- enables cors
app.use(express.json()) // parses the json request body , so the controllers can access it using req.body

app.use("/api/auth" , authRoutes)
app.use('/api/equipment', equipmentRoutes);
app.use("/api/transactions", transactionRoutes);


app.get('/api/health' , (req , res)=>{
    res.json({
        status: "API is running"
    })
})

app.use(errorHandler)


app.listen(PORT, ()=>{
    console.log(`Server is running on ${PORT}`)
})