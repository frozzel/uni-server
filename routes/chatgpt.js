///////////////////////////////////////////////////////////////////////////
const express = require('express');
const router = express.Router();
const {testApi, chatGPT, dallE} = require('../controllers/chatgpt.js')


/////////////////////////// use routes ///////////////////////////
router.get('/test', testApi);
router.post('/generate-response', chatGPT);
router.post('/dallE', dallE);

module.exports = router;