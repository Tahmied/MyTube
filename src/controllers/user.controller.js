import { User } from '../models/user.model.js';
import { apiError } from '../utils/apiError.js'
import { apiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js';

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    const { username, email, fullName, password } = req.body
    // validation - not empty
    if ([username, email, fullName, password].some((e) => !e)) {
        throw new apiError(400, "all fields are required")
    }
    // check if user already exists: username, email
    if (await User.findOne({
        $or: [{ username }, { email }]
    })) {
        throw new apiError(409, "the email or username already exists")
    }

    // check for images, check for avatar and upload them on cloudinary
    const avatarLocalPath = await req.files?.avatar[0]?.path

    if (!avatarLocalPath) {
        throw new apiError(400, "avatar is a required field")
    }

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files?.coverImage.length > 0) {
        coverImageLocalPath = await req.files.coverImage[0].path
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    // create user object - create entry in db

    const user = await User.create({
        fullName,
        email,
        username: username.toLowerCase(),
        password,
        avatar: avatar.url,
        coverImage: coverImage.url
    })
    // remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    // check for user creation
    if (!createdUser) {
        throw new apiError(500, "user registration failed")
    }

    // return the response
    return res.status(201).json(new apiResponse(200, createdUser, "user registration successfull"))
})

export { registerUser }