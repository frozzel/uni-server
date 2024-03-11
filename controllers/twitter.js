const axios = require('axios');

////////// Test API //////////

exports.testApi = (req, res) => {
    res.send('Hello, Twitter!');
}