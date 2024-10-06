import mongoose from 'mongoose'

const connectToDb = async (req, res)=>{
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log('succeffully connected to the database')
    } catch (error) {
        console.log("Error connecting to DB", error.message)
        process.exit(1)
    }
}

export default connectToDb 