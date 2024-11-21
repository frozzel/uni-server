const express = require('express');
const router = express.Router();
const textToSpeech = require('../utils/tts');

// import controller
const {chatGpt} = require('../controllers/avatar');

// routes

router.post('/talk', chatGpt)
router.post('/talk2', function(req, res, next) {
    // console.log(req.body.text);


    textToSpeech(req.body.text, req.body.voice)
    .then(result => {
      res.json(result);    
    })
    .catch(err => {
      res.json({});
    });
  
  
  });

module.exports = router;