import express from 'express'
import authRoutes from "./routes/auth.routes.js"
import dotenv from 'dotenv'
import connectToDb from './db/dbconnection.js'
import cookieParser from 'cookie-parser'

const app = express()
dotenv.config()

// middleware
app.use(express.json()) // to pass req.body
app.use(express.urlencoded({extended: true})) // to parse form data(urlencoded)
app.use(cookieParser())
app.use("/api/auth", authRoutes)


const port = process.env.PORT



app.get("/test", (req, res)=>{
    res.send("The server is running properly")
})

app.listen(port, () =>{
    connectToDb()
    console.log(`server is running on port ${port}`)
})