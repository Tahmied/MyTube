import { Router } from "express"
import { changePassword, loginUser, logoutUser, registerUser, renewTokens, updateProfileDetails } from "../controllers/user.controller.js"
import { verifyJwt } from "../middlewares/auth.middleware.js"
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

router.route('/login').post(loginUser)

//secure routes
router.route('/logout').post(verifyJwt, logoutUser)
router.route('/renew-tokens').post(renewTokens)
router.route('/update-profile').post(verifyJwt , updateProfileDetails)
router.route('/change-password').post(verifyJwt , changePassword)

export default router