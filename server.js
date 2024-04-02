/////////////////////////// import modules ///////////////////////////
const express = require('express');
require('dotenv').config()// import dotenv
require('./config/connections')//   import database connection
var cors = require('cors')// import cors


/////////////////////////// use middleware ///////////////////////////
const app = express();
app.use(express.static('public'));
app.use(express.json())// parse json request body
app.use(cors())// enable cors

/////////////////////////// import routes ///////////////////////////
const chatgptRouter = require('./routes/chatgpt.js');
const hubspotRouter = require('./routes/hubspot.js');
const cronRouter = require('./routes/cron.js');
const twitterRouter = require('./routes/twitter.js');
const facebookRouter = require('./routes/facebook.js');
const instagramRouter = require('./routes/instagram.js');
const newsRouter = require('./routes/news.js');
const linkedinRouter = require('./routes/linkedin.js');


/////////////////////////// use routes ///////////////////////////
app.use('/api/chatgpt', chatgptRouter);
app.use('/api/hubspot', hubspotRouter);
app.use('/api/cron', cronRouter);
app.use('/api/twitter', twitterRouter);
app.use('/api/facebook', facebookRouter);
app.use('/api/instagram', instagramRouter);
app.use('/api/news', newsRouter);
app.use('/api/linkedin', linkedinRouter);

/////////////////////////// start server ///////////////////////////
const server = require('http').Server(app); // import http
const PORT = process.env.PORT || 8080;

/////////////////////// test server running ///////////////////////
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

server.listen(PORT,  () => {// start express server on port 8080
    console.log(`................................................`)
    console.log(`🚀  Server running on http://localhost:${PORT}, 🚀`)
    console.log(`...............................................`)
    console.log(`...............Starting Database...............`)
   
    
})