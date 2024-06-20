////////// CGI Pro Painters API //////////
const axios = require('axios');
const cloudinary = require('../config/cloudinary.js')
const {TwitterApi} = require('twitter-api-v2');



////////// Test API //////////
exports.testApi = (req, res) => {
    res.send('Hello, CGI Pro Painters!');
}


////////// Cloudinary API //////////

/////////////////////////////////////
// Gets details of an uploaded image
/////////////////////////////////////
const getAssetInfo = async (publicId) => {


    try {
        // Get details about the asset
        const result = await cloudinary.api.resources();
        console.log("Number Of Photos", result.resources.length);
        console.log("Photos", result);
        return result.colors;
        } catch (error) {
        console.error(error);
    }
};

// getAssetInfo();


/////////////////////////////////////
// Twitter CGI Pro Painters API /////
/////////////////////////////////////

// const client = new TwitterApi({
//     // appKey: process.env.TWITTER_APP_KEY_CGI,
//     // appSecret: process.env.TWITTER_APP_SECRET_CGI,
//     accessToken: process.env.TW_API,
//     accessSecret: process.env.TWITTER_API_SECRET_NON_CONSUMER_CGI,
//     // bearerToken: process.env.TWITTER_BEARER_TOKEN_CGI
//   });
//   console.log(client);

//   const client = new TwitterApi({
//     // appKey: process.env.TWITTER_APP_KEY_CGI,
//     // appSecret: process.env.TWITTER_APP_SECRET_CGI,
//     // Following access tokens are not required if you are
//     // at part 1 of user-auth process (ask for a request token)
//     // or if you want a app-only client (see below)
//     accessToken: process.env.TWITTER_APP_KEY_CGI,
//     accessSecret: process.env.TWITTER_APP_SECRET_CGI,
//   });

// console.log(client);



checkTweet = async (req, res) => {
    try {
        // Tell typescript it's a readonly app
        const readOnlyClient = client.readOnly;

        // Play with the built in methods
        const user = await readOnlyClient.v2.userByUsername('@CGIProPainters');
        console.log(user);

        // const tweet = await client.v2.tweet({
        //     text: 'Hello, CGI Pro Painters!',

        // });
        // console.log(tweet);
        return user;
    } catch (error) {
        console.error("Error:",error);
    }
}
//   const resp =  client.v2.tweet({
//     text: 'Hello, CGI Pro Painters!',
//   });

//   checkTweet();
//     console.log(resp);

//   Get the recent tweets
//   const getRecentTweets = async () => {
//     try {
//       const tweets = await client.v1.timeline('user_timeline', {screen_name: 'CGIProPainters', count: 5});
//       console.log(tweets);
//       return tweets;
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   getRecentTweets();    
