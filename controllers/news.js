const axios = require('axios');


////////// Test API //////////

exports.testApi = (req, res) => {
    console.log('Hello, News!');
    res.send('Hello, News!');
}

////////// News API //////////

