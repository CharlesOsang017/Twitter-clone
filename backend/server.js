import path from 'path'
import express from 'express'
import authRoutes from "./routes/auth.route.js"
import postRoutes from './routes/post.route.js'
import dotenv from 'dotenv'
import connectToDb from './db/dbconnection.js'
import cookieParser from 'cookie-parser'
import userRoutes from './routes/user.route.js'
import notificationRoutes from './routes/notification.route.js'
import { v2 as cloudinary } from "cloudinary";
// import cors from "cors"
const app = express()

dotenv.config()

//cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Your Cloudinary cloud name
    api_key: process.env.CLOUDINARY_API_KEY, // Your Cloudinary API key
    api_secret: process.env.CLOUDINARY_API_SECRET, // Your Cloudinary API secret
  });
// middleware
// app.use(cors())
app.use(express.json({limit: "5mb"})) // to pass req.body
app.use(express.urlencoded({extended: true})) // to parse form data(urlencoded)
app.use(cookieParser())

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/notifications", notificationRoutes)

const port = process.env.PORT
const __dirname = path.resolve()

if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, "/frontend/dist")))

    app.get("*", (req, res)=>{
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"))
    })
}

app.get("/test", (req, res)=>{
    res.send("The server is running properly")
})

app.listen(port, () =>{
    connectToDb()
    console.log(`server is running on port ${port}`)
})