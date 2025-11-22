import mongoose from "mongoose";


// const ingredientSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//     unique: true
//   },

//   category: {
//     type: String,
//     enum: ["vegetable", "fruit", "grain", "meat", 
//         "spice", "other"],
//     default: "other"
//   }
// });
const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  
  category: {
    type: String,
    enum: ['vegetable', 'fruit', 'meat', 'dairy', 'grain', 'spice', 'other'],
    required: true
  },
  isCommon: {
    type: Boolean,
    default: false // For spices/ingredients like salt, pepper, onion, garlic
  },
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number
  },
  image: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

//module.exports = mongoose.model("Ingredient", ingredientSchema);
export const Ingredient = mongoose.model("Ingredient", ingredientSchema);
