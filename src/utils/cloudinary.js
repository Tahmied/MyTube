import { v2 as cloudinary } from 'cloudinary'

// Configuration
cloudinary.config({
    cloud_name: 'dzkdemrec',
    api_key: '973334968424263',
    api_secret: 'iHTxrVgcnHo8WxEev6QX2pC5wV8'
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        // console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

export { uploadOnCloudinary }