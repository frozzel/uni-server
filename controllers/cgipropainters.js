////////// CGI Pro Painters API //////////
const axios = require('axios');
const cloudinary = require('../config/cloudinary.js')
const {TwitterApi} = require('twitter-api-v2');
const FB = require('fb');
const post = require('./seedData.js');
const cron = require('node-cron');
const {downloadFile} = require('../Utils/download.js');



////////// Test API //////////
exports.testApi = (req, res) => {
    res.send('Hello, CGI Pro Painters!');
}

/////////////////////////////////////
////////// Cloudinary API //////////
/////////////////////////////////////

// Gets details of an uploaded image
const getAssetInfo = async () => {
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

postTwitter = async (req, res) => {
      // Set the access token

  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY_CGI,
    appSecret: process.env.TWITTER_API_SECRET_CGI,
    accessToken: process.env.TWITTER_API_KEY_NON_CONSUMER_CGI,
    accessSecret: process.env.TWITTER_API_SECRET_NON_CONSUMER_CGI,
  });
  try {

  // Randomly select a post
  const lastObject = post[Math.floor(Math.random() * post.length)];

  // Post the content on Twitter

  const { filePath } = await downloadFile(lastObject.image_url); // Download the image and get the file path
  const mediaId = await client.v1.uploadMedia(filePath); // Upload the downloaded image
  const resp = await client.v2.tweet({
    text: lastObject.message + ' ' + lastObject.link,
    media: { media_ids: [mediaId] }
    });
    // res.json(resp);
    console.log('CGI Pro Painters Shared successfully: Twitter ⓉⓉⓉⓉⓉ', resp);
    } catch (error) {
    console.error(error);
    // res.status(500).json({ error: 'An error occurred while posting the tweet' });
    }
  }

  // postTwitter()

/////////////////////////////////////
// Schedule the Twitter post daily //
/////////////////////////////////////

cron.schedule('30 21 * * *', () => {
    console.log('𝕏𝕏𝕏𝕏𝕏 CGI Pro Painters Posting to twitter every day at at 9:30 utc 5:30pm EST! 🐥🐥🐥🐥🐥');
    postTwitter();
  }
  , null, true, 'America/New_York');


//////////////////////////////////////
// Facebook CGI Pro Painters API /////
//////////////////////////////////////

postFacebook = async (req, res) => {
    // Set the access token
    FB.setAccessToken(process.env.FACEBOOK_ACCESS_TOKEN_CGI);

    // Randomly select a post
    const lastObject = post[Math.floor(Math.random() * post.length)];

    // Post the content on Facebook
  
      const shareData = {
        message: lastObject.message + ' ' + lastObject.link,
        url: lastObject.image_url,
      };
  
      FB.api(`/${process.env.FB_PAGE_ID_CGI}/photos`, 'POST', shareData, function (fbRes) {
          if (!fbRes || fbRes.error) {
            console.error('CGI Error sharing: facebook', fbRes.error || 'Unknown error facebook');
            // res.status(400).json({ error: fbRes || 'Unknown error'}); // remove for production needed for endpoint testing
            return;
          }
          console.log('CGI Pro Painters Shared successfully: Facebook ⓕⓕⓕⓕⓕ', fbRes);
          // res.status(200).json({ success: true, message: 'Shared on Facebook successfully' }); // remove for production needed for endpoint testing
        });
    
  }

  // postFacebook()

//////////////////////////////////////
// Schedule the Facebook post daily //
//////////////////////////////////////

cron.schedule('30 22 * * *', () => {
    console.log('CGI Pro Painters Posting to facebook every day at 6:30PM 22utc ⓕⓕⓕⓕⓕ');
    postFacebook();
  }, null, true, 'America/New_York');


//////////////////////////////////////
