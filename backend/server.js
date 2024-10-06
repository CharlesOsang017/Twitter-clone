import express from 'express'
import authRoutes from "./routes/auth.routes.js"
import dotenv from 'dotenv'
import connectToDb from './db/dbconnection.js'

const app = express()
dotenv.config()

app.use("/api/auth", authRoutes)
console.log(process.env.MONGO_URI);

const port = process.env.PORT

app.get("/test", (req, res)=>{
    res.send("The server is running properly")
})

app.listen(port, () =>{
    connectToDb()
    console.log(`server is running on port ${port}`)
})