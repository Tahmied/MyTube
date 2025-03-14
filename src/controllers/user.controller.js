import jwt from 'jsonwebtoken'
import { User } from '../models/user.model.js'
import { apiError } from '../utils/apiError.js'
import { apiResponse } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId).select("-password")
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken
        user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }

    } catch (err) {
        console.log(`failed to generate refresh and access token`);
        throw new Error("failed to generate tokens")
    }
}

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
    } else {
        throw new apiError(500, "Multer file upload error")
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

const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body

    if ([username, email].some((e) => !e)) {
        throw new apiError(400, "all fields are required")
    }

    const user = await User.findOne({ $or: [{ username }, { email }] })
    if (!user) {
        throw new apiError(401, "wront username or email")
    }
    const checkPass = await user.checkPassword(password)
    if (!checkPass) {
        throw new apiError(400, "wrong password")
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)
    const loggedInUser = await User.findById(user._id)

    const cookieOptions = {
        httpOnly: true,
        secure: true
    }
    res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new apiResponse(200, loggedInUser, "User logged in successful")
        )
})

const logoutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )


    const cookieOptions = {
        httpOnly: true,
        secure: true
    }
    res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie('refreshToken', cookieOptions)
        .json(
            new apiResponse(200, {}, "User logged Out")
        )
})

const renewTokens = asyncHandler(async (req, res) => {
    const userRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if (!userRefreshToken) {
        throw new apiError(400, "No refresh token found")
    }

    try {
        const decodedRefreshToken = await jwt.verify(userRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedRefreshToken._id)

        if (!decodedRefreshToken) {
            throw new apiError(400, "Unauthorized request")
        }
        if (decodedRefreshToken !== user.refreshToken) {
            throw new apiError(404, "Refresh TOken already used or expired")
        }
        const { newAccessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id)

        const cookieOptions = {
            httpOnly: true,
            secure: true
        }

        return res
            .status(200)
            .cookie('accessToken', newAccessToken, cookieOptions)
            .cookie('refreshToken', newRefreshToken, cookieOptions)
            .json(
                new apiResponse(200, {}, "Access and refresh token regenrated")
            )

    } catch (err) {
        throw new apiError(400, `Failed to renew tokens automatically due to ${err}`)
    }

})
const changePassword = asyncHandler(async (req,res) => {
    const {oldPass , newPass , confirmNewPass} = req.body
    if([oldPass , newPass , confirmNewPass].some((e)=>!e)){
        throw new apiError(400 , 'All fields are required')
    }
    if(newPass !== confirmNewPass){
        throw new apiError(401, 'New password and confirm password didnt match')
    }
    const user = await req.user
    if(!user){
        throw new apiError(401 , "Unable to find the user")
    }
    const checkPass = await user.isPasswordCorrect(oldPass)
    if(!checkPass){
        throw new apiError(401, "Wrong old password")
    }
    user.password = newPass
    await user.save({validateBeforeSave:false})
    
    return res
    .status(200)
    .json(
        new apiResponse(200 , {} , "Password updated")
    )
})

const updateProfileDetails = asyncHandler(async(req,res)=>{
    const user = await req.user
    const {  email, fullName, password } = req.body
    
    if(!fullName && !email){
        throw new apiError(401, "At least one field should be changed")
    }

    if(!password){
        throw new apiError(401, "Please input your password")
    }
    const checkPass = await user.isPasswordCorrect(password)
    if(!checkPass){
        throw new apiError(400 , "Wrong password")
    }

    if(fullName){
        user.fullName = fullName
        await user.save({validateBeforeSave:false})
    } 
    if(email){
        user.email = email
        await user.save({validateBeforeSave:false})
    }
    const updatedUser = await User.findById(user._id)
    return res 
    .status(200)
    .json(
        new apiResponse(200 , updatedUser , "Selected fieelds are updated")
    )
})

export { changePassword, loginUser, logoutUser, registerUser, renewTokens, updateProfileDetails }
