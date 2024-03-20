const express = require('express');
const router = express.Router();


const {testApi, postFacebook} = require('../controllers/facebook.js');

/////////////////////////// use routes ///////////////////////////
router.get('/test', testApi);
router.post('/postFacebook', postFacebook);

module.exports = router;