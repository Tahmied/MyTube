import mongoose from "mongoose";
import { DB_NAME } from "../constants.js"

async function connectDb() {
    try {
        const dbResponse = await mongoose.connect(`${process.env.DATABASE_URL}/${DB_NAME}`)
        console.log(`Connected to the database on ${dbResponse.connection.host}`);
    } catch (err) {
        console.log(`Couldn't connect to the database due to ${err}`);
    }
}


export { connectDb }