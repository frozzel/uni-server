const express = require('express');
const router = express.Router();
// const textToSpeech = require('../utils/tts');
const textToSpeech = require('../Utils/tts');

// import controller
const {chatGpt} = require('../controllers/avatar');

// routes

router.post('/talk', chatGpt)
router.post('/talk2', function(req, res, next) {
    console.log(req.body.text);


    textToSpeech(req.body.text, req.body.voice)
    .then(result => {
      console.log('TTS Result:', result.filename);  
      res.json(result);    
    })
    .catch(err => {
      res.json({error: 'TTS conversion failed', details: err.message});
    });
  
  
  });

module.exports = router;