///////////////////////////////////////////////////////////////////////////
const express = require('express');
const router = express.Router();
const {testApi, getInfo} = require('../controllers/hubspot.js');


/////////////////////////// use routes ///////////////////////////
router.get('/test', testApi);
router.get('/getInfo', getInfo);
// router.post('/generate-response', chatGPT);

module.exports = router;