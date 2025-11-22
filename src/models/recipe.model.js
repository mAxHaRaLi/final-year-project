//Recipe Schema (Main entity:
//  ingredients, steps, image, uploaded by user)
import mongoose from "mongoose";
const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  ingredients: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ingredient",
      required: true
    }
  ],

  generalIngredients: {
    type: [String],
    default: ["salt", "pepper", "water", "onion", "garlic"]   // ignored in search
  },

  steps: [
    {
      type: String,
      required: true
    }
  ],

  image: {
    type: String,  // image URL
    default: ""
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  ratings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review"
    }
  ],

  averageRating: {
    type: Number,
    default: 0
  }
});

//module.exports = mongoose.model("Recipe", recipeSchema);
export const Recipe = mongoose.model("Recipe", recipeSchema);