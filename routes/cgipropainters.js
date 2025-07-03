///////////////////////////////////////////////////////////////////////////
const express = require('express');
const router = express.Router();
const {testApi, } = require('../controllers/cgipropainters.js')


/////////////////////////// use routes ///////////////////////////
router.get('/test', testApi);
// router.post('/generate-response', chatGPT);
// router.post('/dallE', dallE);

module.exports = router;