import { User } from '../models/user.model.js';
import { apiError } from '../utils/apiError.js'
import { apiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js';

const registerUser = asyncHandler(async (req, res) => {
    // take data from frontend
    // validation to check if any fields are missing
    // upload cover image and avatar to cloudinary


    const { username, email, fullName, password } = req.body

    // validation, gets all the fields, trim it and if its empty throws error
    if (!fullName
    ) {
        console.log('all fields are required');
        // throw new apiError(400, "all fields are required")
    }

    //check if user already exists
    const existedUser = User.findOne({
        $or: [email, username]
    })

    if (existedUser) {
        throw new apiError(409, "This user already exists")
    }

    //handle images avatar and cover image
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0].path
    if (!avatarLocalPath) {
        throw new apiError(400, "avatar local path not found")
    }

    // upload avatar and coverimage to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    //create the user and sent to database
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    if (!createdUser) {
        throw new apiError(400, "registration failed")
    }

    return res.status(201).json(
        new apiResponse(200, createdUser, "user creation successful")
    )

})

export { registerUser }