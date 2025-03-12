import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken'

const verifyJwt = asyncHandler(async (req, _, next) => {
    try {
        const AccessToken = req.cookies?.accessToken || req.header('Authorization')?.replace("Bearer ", "");
        if (!AccessToken) {
            throw new apiError(401, "Unauthorized request");
        }

        const decodedToken = jwt.verify(AccessToken, process.env.ACCESS_TOKEN_SECRET);
        if (!decodedToken) {
            throw new apiError(401, "Invalid token - decodedToken is null");
        }

        const user = await User.findById(decodedToken._id);
        if (!user) {
            throw new apiError(401, "failed to fetch the user through access token");
        }
        req.user = user;
        next();
    } catch (err) {
        throw new apiError(401, "couldn't get the accessToken")
    }
})

export { verifyJwt }