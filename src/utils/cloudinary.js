import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'
import dotenv from 'dotenv';

dotenv.config({ path: './.env' })

// Configuration
cloudinary.config({
    cloud_name: 'dzkdemrec',
    api_key: process.env.API_KEY_CLOUDINARY,
    api_secret: process.env.API_SECRET_CLOUDINARY
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        // console.log("Cloudinary Response:", response); // Debugging log
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        console.error("Cloudinary Upload Error:", error); // Debugging log
        fs.unlinkSync(localFilePath);
        return null;
    }
};


export { uploadOnCloudinary }