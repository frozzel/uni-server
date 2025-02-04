//////////////// Load Modules //////////////////////////
const express = require('express');
const router = express.Router();

///////////////// Import Controllers ////////////////////
const { testApi, getCozyBlogs, getSingleBlog } = require('../controllers/cozythrowie.js');


///////////////// Routes ////////////////////////////////
router.get('/test', testApi);
router.get('/blog', getCozyBlogs);
router.get('/blog/:_id', getSingleBlog);




module.exports = router;