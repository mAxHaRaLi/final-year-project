const mongoose = require('mongoose');

const recipeSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        ingredients: [
            {
                item: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Ingredient',
                    required: true,
                },
                quantity: {
                    type: String,
                    required: true // e.g., "200g", "2 cups"
                }
            },
        ],
        instructions: {
            type: String, // Can be a long text or array of strings. storing as string for simplicity, or array for steps.
            required: true,
        },
        imageUrl: {
            type: String,
            required: false,
        },
        media: [
            {
                url: { type: String },
                type: { type: String, enum: ['image', 'video', 'other'], default: 'image' },
                caption: { type: String },
            }
        ],
        visibility: {
            type: String,
            enum: ['public', 'private', 'shared'],
            default: 'public',
        },
        sharedWith: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            }
        ],
        servings: { type: String },
        prepTime: { type: String },
        cookTime: { type: String },
        tags: [String],
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        // We can store average rating here to avoid heavy calculation on read
        averageRating: {
            type: Number,
            default: 0,
        },
        numReviews: {
            type: Number,
            default: 0,
        }
    },
    {
        timestamps: true,
    }
);

// Virtual populate for reviews if needed
recipeSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'recipe',
});

const Recipe = mongoose.model('Recipe', recipeSchema);
module.exports = Recipe;
