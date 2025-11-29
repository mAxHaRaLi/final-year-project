import{apiError} from '../utils/apiError.js';
import {asyncHandler} from '../utilities/asyncHandler.js';
import jwt from 'jsonwebtoken';
import {User} from '../models/user.model.js';
export const verifyJWT = asyncHandler(async(req ,_,
    next)=>{
      try {
         const token= req.cookies?.accessToken || req.header
          ("Authorization")?.replace("Bearer" , "")
           if (!token) {
              throw new apiError(401 , "unauthorized request")
  
                 }
  
                const decodedToken= jwt.verify(token,process
                .env. REFRESH_TOKEN_SECRET)
  
              const user = await User.findById(decodedToken?._id).select
                ("-password -refreshToken")
              if (!user) {
                  throw new apiError(401 , "Invalid token - user not found")
              }
              req.user = user;
              next()
      } catch (error) {
        throw new apiError(401 , error?.message || "Invalid access token")
        
      }



    })