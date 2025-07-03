const mongoose = require('mongoose');

// Define schemas for social media content
const socialMediaSchema = new mongoose.Schema({
    text: {
        type: String,
        required: false
    }
});

const pinterestSchema = new mongoose.Schema({
    text: {
        type: String,
        required: false
    },
    photoDescription: {
        type: String,
        required: false
    },
    photoUrl: {
        type: String,
        required: false
    },
    titleOverlay: { // to include the title within the image
        type: String,
        required: false
    }
});

// Define the main blog schema
const blogSchema = new mongoose.Schema({
    titleMain: {
        type: String,
        required: true
    },
    descriptionSummary: {
        type: String,
        required: true
    },
    featuredPhotoDescription: {
        type: String,
        required: false
    },
    featuredPhotoUrl: {
        type: String,
        required: false
    },
    facebook: {
        type: socialMediaSchema,
        required: false
    },
    instagram: {
        type: socialMediaSchema,
        required: false
    },
    twitter: {
        type: socialMediaSchema,
        required: false
    },
    pinterest: {
        type: pinterestSchema,
        required: false
    },
    sections: [
        {
            title: {
                type: String,
                required: true
            },
            description: {
                type: String,
                required: true
            },
            productDescription: [{
                description: {
                    type: String,
                    required: false
                },
                productKeywords: {
                    type: Array,
                    required: false
                },
                productUrl: {
                    type: String,
                    required: false
                },
            }],
        }
    ],
    tags: {
        type: Array,
        required: false
    }
},
    { timestamps: true }
);

module.exports = mongoose.model('Blog', blogSchema);