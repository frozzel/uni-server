const express = require('express');
const router = express.Router();


const {testApi} = require('../controllers/twitter.js');

/////////////////////////// use routes ///////////////////////////
router.get('/test', testApi);


module.exports = router;