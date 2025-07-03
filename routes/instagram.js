const express = require('express');
const router = express.Router();


const {testApi} = require('../controllers/instagram.js');

/////////////////////////// use routes ///////////////////////////
router.get('/test', testApi);
// router.post('/postTweet', postTweet);

module.exports = router;