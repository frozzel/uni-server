const express = require('express');
const router = express.Router();

const {testApi} = require('../controllers/news.js');


/////////////////////////// use routes ///////////////////////////

router.get('/test', testApi);
// router.get('/getNews', getNews);

module.exports = router;