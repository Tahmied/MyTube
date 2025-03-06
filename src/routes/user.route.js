import { Router } from "express"
import { registerUser } from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js"

const router = Router()

//routes
router.route('/register').post(upload.fields([
    {
        name: 'avatar', // one object for avatar
        maxCount: 1
    },
    {
        name: 'coverImage',  // one object for cover image
        maxCount: 1
    }
])
    , registerUser)

export default router