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

/////////////////////////// use routes ///////////////////////////
app.use('/api/chatgpt', chatgptRouter);
app.use('/api/hubspot', hubspotRouter);
app.use('/api/cron', cronRouter);
app.use('/api/twitter', twitterRouter);


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