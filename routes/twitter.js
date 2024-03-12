const express = require('express');
const router = express.Router();


const {testApi, postTweet} = require('../controllers/twitter.js');

/////////////////////////// use routes ///////////////////////////
router.get('/test', testApi);
// router.post('/textTweet', textTweet);
router.post('/postTweet', postTweet);

module.exports = router;