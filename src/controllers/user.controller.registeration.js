import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utilities/cloudinary.js";
import {apiResponse} from "../utilities/apiResponse.js";




// ===============================
// REGISTER USER CONTROLLER
// ===============================
const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    console.log("Registering user:", { username, email, password });

    // -------------------------------
    // EMPTY FIELD VALIDATION (FIXED)
    // -------------------------------
    if ([username, email, password].some(field => field?.trim() === "")) {
        throw new apiError(400, "All fields are required");
    }

    // -------------------------------
    // INPUT VALIDATION
    // -------------------------------
    validateUserInput(username, email, password);

    // Just a response example (you will replace this later)
    res.status(200).json({
        success: true,
        message: "Validation passed."
    });
});


// ===============================
// INPUT VALIDATION FUNCTION
// ===============================
function validateUserInput(username, email, password) {

    // Username validation
    if (!username || username.length < 3 || username.length > 20) {
        throw new apiError(400, "Username must be between 3 and 20 characters long.");
    }

    // Email validation (REGEX FIXED)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        throw new apiError(400, "Please enter a valid email address.");
    }

    // Password validation
    if (!password || password.length < 8) {
        throw new apiError(400, "Password must be at least 8 characters long.");
    }

    if (!/[A-Z]/.test(password)) {
        throw new apiError(400, "Password must contain at least one uppercase letter.");
    }

    if (!/[a-z]/.test(password)) {
        throw new apiError(400, "Password must contain at least one lowercase letter.");
    }

    if (!/[0-9]/.test(password)) {
        throw new apiError(400, "Password must contain at least one digit.");
    }

    if (!/[!@#$%^&]/.test(password)) {
        throw new apiError(400, "Password must contain at least one special character (!@#$%^&).");
    }

    return true; // validation passed
}

// check the user exests or not
const existUser = await User.findOne({email});
if(existUser){
    throw new apiError(409,"User with this email already exists");
}

 // --- Handle Profile Image ---
  let profileImage = "";
  if (req.files && req.files.profileImage) {
    profileImage = req.files.profileImage[0].path; // multer uploaded file path
  }

// upload profile picture on cloudinary
const profileImageUploadResponse= await uploadOnCloudinary(profileImage);


// create user object - create entry in db

if(!profileImage){
    throw new apiError(500,"profile picture is required");
}
// create user object - create entry in db
const  newUser= await  User .create({
    username,
    email,  
    profileImage:profileImageUploadResponse.url,
    password,

});

const createdUser= await newUser.findById(newUser._id).select(
    "-password -__v -refreshToken");

    //check user created or not
    if(!createdUser){
        throw new apiError (500,"User creation failed");
    }

    // send response
    res.status (201).json (new apiResponse(
        201,
        createdUser,
        "User registered successfully"
    ));


// ===============================


// import { User } from "../models/user.model.js";
// import { asyncHandler } from "../utils/asyncHandler.js";
// import { apiError } from "../utils/apiError.js";
// import { apiResponse } from "../utils/apiResponse.js";

// export const registerUser = asyncHandler(async (req, res) => {
//   const { username, email, password } = req.body;

//   // --- Validation ---
//   if (!username || !email || !password) {
//     throw new apiError(400, "All fields (username, email, password) are required");
//   }

//   // Check if user already exists
//   const existingUser = await User.findOne({ email });
//   if (existingUser) {
//     throw new apiError(400, "User already exists with this email");
//   }

//   // --- Handle Profile Image ---
//   const profileImage = "";
//   if (req.files && req.files.profileImage) {
//     profileImage = req.files.profileImage[0].path; // multer uploaded file path
//   }

//   // --- Create User ---
//   const newUser = await User.create({
//     username,
//     email,
//     password,
//     profileImage,
//   });

//   // Token generate
//   const accessToken = newUser.generateAccessToken();
//   const refreshToken = newUser.generateRefreshToken();

//   newUser.refreshToken = refreshToken;
//   await newUser.save();

//   return res.status(201).json(
//     new apiResponse(201, 
//       {
//         user: {
//           id: newUser._id,
//           username: newUser.username,
//           email: newUser.email,
//           profileImage: newUser.profileImage,
//         },
//         accessToken,
//         refreshToken,
//       },
//       "User registered successfully"
//     )
//   );
// });
// export { registerUser };


export {
     registerUser
    
     }