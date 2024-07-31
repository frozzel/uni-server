///////////////////////////////////////////////////////////////////////////
const express = require('express');
const router = express.Router();
const {testApi, getInfo, postToLinkedIn, aiPostToLinkedIn, getContacts} = require('../controllers/hubspot.js');


/////////////////////////// use routes ///////////////////////////
router.get('/test', testApi);
router.get('/getInfo', getInfo);
router.post('/postToLinkedIn', postToLinkedIn);
router.post('/aiPostToLinkedIn', aiPostToLinkedIn);
router.get('/contacts', getContacts);

module.exports = router;