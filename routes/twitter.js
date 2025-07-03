const express = require('express');
const router = express.Router();


const {testApi, postTweet, } = require('../controllers/twitter.js');

/////////////////////////// use routes ///////////////////////////
router.get('/test', testApi);
router.post('/postTweet', postTweet);
// router.post('/genImage', imgGen);

module.exports = router;