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
const cgiProPaintersRouter = require('./routes/cgipropainters.js');
const avatarRouter = require('./routes/avatar.js');
const cozythrowieRoutes = require('./routes/cozythrowie.js');


/////////////////////////// use routes ///////////////////////////
app.use('/api/chatgpt', chatgptRouter);
app.use('/api/hubspot', hubspotRouter);
app.use('/api/cron', cronRouter);
app.use('/api/twitter', twitterRouter);
app.use('/api/facebook', facebookRouter);
app.use('/api/instagram', instagramRouter);
app.use('/api/news', newsRouter);
app.use('/api/linkedin', linkedinRouter);
app.use('/api/cgipropainters', cgiProPaintersRouter);
app.use('/api/avatar', avatarRouter);
app.use('/api/cozythrowie', cozythrowieRoutes);


/////////////////////////// start server ///////////////////////////
const server = require('http').Server(app); // import http
const PORT = process.env.PORT || 8080;

/////////////////////// test server running ///////////////////////
app.get('/', (req, res) => {
    const date = new Date();
    res.send(`<body style="background: #333; display: flex">
        <div style="width: 30%; height: auto"></div>
        <div style="display: flex-column; position: relative; top: 25%; width: 100%; height: 15%; box-shadow: 0 0 3px 2px #cec7c759; padding: 1em; border-radius: 8px;">
        <h1 style="text-align: center; color: white;">🚀  Server Running  🚀</h1> \n 
        <h3 style="text-align: center; color: white">${date.toString().slice(0, 24)}</h3>
        </div><div style="width: 30%; height: auto"></div>
        </body>`
     );
});

server.listen(PORT,  () => {// start express server on port 8080
    console.log(`................................................`)
    console.log(`🚀  Server running on http://localhost:${PORT}, 🚀`)
    console.log(`...............................................`)
    console.log(`...............Starting Database...............`)
   
    
})