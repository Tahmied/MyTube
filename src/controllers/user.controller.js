import { User } from '../models/user.model.js';
import { apiError } from '../utils/apiError.js'
import { apiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js';

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const { username, email, fullName, password } = req.body

    if ([username, email, fullName, password].some((e) => !e)) {
        throw new apiError(400, "all fields are required")
    }

    if (await User.findOne({
        $or: [{ username }, { email }]
    })) {
        throw new apiError(409, "the email or username already exists")
    }


    const avatarLocalPath = await req.files?.avatar[0]?.path

    if (!avatarLocalPath) {
        throw new apiError(400, "avatar is a required field")
    }

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files?.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    const avatar = uploadOnCloudinary(avatarLocalPath)
    const coverImage = uploadOnCloudinary(coverImageLocalPath)

    const user = User.create({
        fullName,
        email,
        username: username.toLowerCase(),
        password,
        avatar: avatar.url,
        coverImage: coverImage.url
    })

    const createdUser = User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new apiError(500, "user registration failed")
    }

    return res.status(201).json(new apiResponse(200, createdUser, "user registration successfull"))
})

export { registerUser }