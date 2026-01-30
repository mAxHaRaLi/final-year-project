import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utilities/cloudinary.js";
import {apiResponse} from "../utilities/apiResponse.js";
import jwt from "jsonwebtoken"

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
})
const refreshAccessToken = asyncHandler( async(req ,req)=>{
    const incomingRefreshtoken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshtoken) {
        throw new apiError(401 , "unauthorized Request")
        
    }
   try {
     const decodedToken = jwt.verify(
         incomingRefreshtoken,
         process.env.ACCESS_TOKEN_SECRET
     )
    const user = await User.findById(decodedToken?._id)
 
      if (!user) {
         throw new apiError(401 , "Invalid Refresh Token")
         
     }
 
     if (incomingRefreshtoken !== user?.refreshToken) {
          throw new apiError(401 , "Refresh Token are Expired")
         
     }
 
     const options={
         httpOnly:true,
         secure: true
     }
     const{accessToken , newRefreshToken}= await generateAccessAndRefreshToken(user._id)
 
       return res.status(200)
     .cookie("refreshToken",accessToken, options)
     .cookie("accessToken", newRefreshToken, options)
     .json(
         new apiResponse( 200,
              {accessToken , refreshToken:  newRefreshToken},
             "Access token refreshed" ))
 
 
 
 } catch (error) {
    throw new apiError(401 ,error?.message || "Invalid refresh token")
    
   }
})
export {logoutUser,
    refreshAccessToken
};

   