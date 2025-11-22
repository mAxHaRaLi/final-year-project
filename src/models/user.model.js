 import mongoose, {Schema} from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
// const UserSchema = new Schema({})

// export const User = mongoose.model("User", UserSchema)



const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    lowercase:true,
    trim: true,
    index:true
  },

  email: {
    type: String,
    unique:true,
    required: true,
    lowercase:true,
    unique: true
  },

  password: {
    type: String,
    required: [true,'password is required']
  },

  profileImage: {
    type: String,   // URL of image
    default: ""
  },

  favorites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe"
    }
  ],

  cookingHistory: [
    {
      recipe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recipe"
      },
      cookedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],

  createdRecipes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe"
    }
  ],
  refreshToken: {
    type: String
  }
  
},
{
    timestamps:true
  });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
})
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
}
  
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { 
      id: this._id,
      username: this.username,
      email: this.email },
      process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN }
  );
}
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { 
      id: this._id,
      username: this.username,
      email: this.email }, 
      process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
  );
}

//module.exports = mongoose.model("User", userSchema);
export const User = mongoose.model("User", userSchema);
