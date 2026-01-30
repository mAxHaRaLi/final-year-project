import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utilities/cloudinary.js";
import { apiResponse } from "../utilities/apiResponse.js";

const changeCurrentPassword = asyncHandler( async (req , res) => {
    const {oldPassword, newPassword } = req.body

    

    const user= await User.findById(req.user?.id)
    const isPasswordCorrect= isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new apiError(400 ,"Invalid old password")
    }
    user.password = newPassword
    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(
        new apiResponse(200 ,{}, "Password Change successfully")
    )
})

export {changeCurrentPassword}