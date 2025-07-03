//////////////// Load Modules //////////////////////////
const express = require('express');
const router = express.Router();

///////////////// Import Controllers ////////////////////
const { testApi, getCozyBlogs, getSingleBlog,  } = require('../controllers/cozythrowie.js');
const { testApi2 } = require('../controllers/gemini.js');


///////////////// Routes ////////////////////////////////
router.get('/test', testApi);
router.get('/blog', getCozyBlogs);
router.get('/blog/:_id', getSingleBlog);

router.get('/test2', testApi2)


module.exports = router;