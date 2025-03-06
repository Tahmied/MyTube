import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'

const app = express()
app.use(cookieParser())
app.use(express.json({ limit: '16kb' }))
app.use(express.urlencoded({ extended: 'true', limit: '16kb' }))
app.use(cors({ origin: process.env.ORIGIN }))

//routes import
import userRouter from './routes/user.route.js'

//routes declaration
app.use('/api/v1/users', userRouter)

export { app }