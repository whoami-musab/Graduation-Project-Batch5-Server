import mongoose from "mongoose";
import dotenv from 'dotenv'

dotenv.config()

const connDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URL)
        console.log('Connected successfully to DB. ✅')
    } catch (error) {
        console.log('Error Connecting to DB. ❌', error.message)
        process.exit(1)
    }
}

export default connDB