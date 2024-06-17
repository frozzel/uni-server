////////// CGI Pro Painters API //////////
const axios = require('axios');
const cloudinary = require('../config/cloudinary.js')



////////// Test API //////////
exports.testApi = (req, res) => {
    res.send('Hello, CGI Pro Painters!');
}


////////// Cloudinary API //////////

/////////////////////////////////////
// Gets details of an uploaded image
/////////////////////////////////////
const getAssetInfo = async (publicId) => {


    try {
        // Get details about the asset
        const result = await cloudinary.api.resources();
        console.log("Number Of Photos", result.resources.length);
        console.log("Photos", result);
        return result.colors;
        } catch (error) {
        console.error(error);
    }
};

// getAssetInfo();