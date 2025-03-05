import dotenv from 'dotenv'
import { connectDb } from './db/mongoDb.js'
import { app } from './app.js'

dotenv.config({ path: './.env' })

connectDb()
    .then(() => {
        app.listen(process.env.PORT || 1000, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        })
    })
    .catch((err) => {
        console.log(`Couldn't connect to the database due to ${err} in server.js`);
    })