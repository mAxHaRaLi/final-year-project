import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utilities/cloudinary.js";
import {apiResponse} from "../utilities/apiResponse.js";

const generateAccessAndRefereshToken= async(userId)=>{
    try {
       const user= await User. findById(userId)
       const accessToken=user.generateAccessToken()
       const refreshToken=user.generateRefreshToken()
       user.refreshToken = refreshToken
       await user.save({validateBeforeSave:false})
       return {accessToken, refreshToken}
    } catch (error) {
        throw new apiError(501 ,"Something went worng while generating Referesh and access token ")
        
    }
     const{accessToken,refreshToken}=
      await generateAccessAndRefereshToken(User._Id)
      const logedInUser= await User.findById(User._Id).select("-password -refreshToken")

      const options={
        expires:new Date(Date.now()+3*24*60*60*1000),
        httpOnly:true,
        secure:true,
    
}
 return res.status(200)
 .cookie("refreshToken",refreshToken,options)
 .cookie("refreshToken",refreshToken, options)
    
    .json(
        new apiResponse(200, {logedInUser, accessToken,refreshToken},
            "User logged in successfully" ))
    
 
        }





const loginUser=asyncHandler(async (req , res) =>{

    const {email,username,password} = req.body
    if(! email && !password){
        throw new apiError(400 ,"email and password are required")
          
    }

    const user= await User.findOne({
        $and:[{email},{password}]
    })

    if (!user) {
        throw new apiError(404 ,"User does not exist")   
    }

    const ispasswordcorrect= await user.ispasswordcorrect(password)
    if (!ispasswordcorrect) {
        throw new apiError(401, "Password INCORRECT!!!")
        
    }


})

export {
     loginUser
}