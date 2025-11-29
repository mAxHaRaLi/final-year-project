import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utilities/cloudinary.js";
import {apiResponse} from "../utilities/apiResponse.js";

const logoutUser=asyncHandler(async (req , res) =>{

   await User.findByIdAndUpdate(
    req.User._id,
    {
        $unset: { refreshToken: undefined }
    },
    { new: true }  
    
)
const options={
    expires:new Date(Date.now()+3*24*60*60*1000),
    httpOnly:true,
    secure:true,
}
    return res.status(200)
    .clearcookie("refreshToken",options)
    .clearcookie("accessToken",options)
    .json(
        new apiResponse(200, {},
            "User logged out successfully" ))
});
export {logoutUser};

   