import { Router } from "express"
import { loginUser, logoutUser, registerUser, renewTokens } from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJwt } from "../middlewares/auth.middleware.js"

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

router.route('/login').post(loginUser)

//secure routes
router.route('/logout').post(verifyJwt, logoutUser)
router.route('/renew-tokens').post(renewTokens)

export default router