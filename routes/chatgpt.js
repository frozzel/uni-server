///////////////////////////////////////////////////////////////////////////
const express = require('express');
const router = express.Router();
const {testApi, chatGPT} = require('../controllers/chatgpt.js')


/////////////////////////// use routes ///////////////////////////
router.get('/test', testApi);
router.post('/generate-response', chatGPT);

module.exports = router;