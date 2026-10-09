import express from 'express'; 
import cors from 'cors'; 
import dotenv from 'dotenv';  
import equipmentRoutes from "./src/routes/equipmentRoutes.js"
import transactionRoutes from "./src/routes/transactionRoutes.js"
import authRoutes from "./src/routes/authRoutes.js"
import errorHandler from './src/middlewares/errorHandler.js';


dotenv.config();

const app = express(); 
const PORT = process.env.PORT || 5000; 


// middleware --- code that runs while a request is travelling through your express application
app.use(cors())  
app.use(express.json()) 

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