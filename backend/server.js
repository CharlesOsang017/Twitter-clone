import express from 'express'
import authRoutes from "./routes/auth.routes.js"
import dotenv from 'dotenv'
import connectToDb from './db/dbconnection.js'
import cookieParser from 'cookie-parser'
import userRoutes from './routes/user.routes.js'
import {v2 as cloudinary} from 'cloudinary'

const app = express()

dotenv.config()

//cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

// middleware
app.use(express.json()) // to pass req.body
app.use(express.urlencoded({extended: true})) // to parse form data(urlencoded)
app.use(cookieParser())

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)


const port = process.env.PORT



app.get("/test", (req, res)=>{
    res.send("The server is running properly")
})

app.listen(port, () =>{
    connectToDb()
    console.log(`server is running on port ${port}`)
})