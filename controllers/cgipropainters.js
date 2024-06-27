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

postTwitterCGI = async (req, res) => {
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
    return;
    } catch (error) {
    console.error("CGI Twitter Post Failed", error);
    return;
    // res.status(500).json({ error: 'An error occurred while posting the tweet' });
    }
  }

  // postTwitterCGI()

/////////////////////////////////////
// Schedule the Twitter post daily //
/////////////////////////////////////

cron.schedule('30 21 * * 4', () => {
    console.log('𝕏𝕏𝕏𝕏𝕏 CGI Pro Painters Posting to twitter every day at at 9:30 utc 5:30pm EST! 🐥🐥🐥🐥🐥');
    postTwitterCGI();
  }
  , null, true, 'America/New_York');


//////////////////////////////////////
// Facebook CGI Pro Painters API /////
//////////////////////////////////////

postFacebookCGI = async (req, res) => {
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
          return;
          // res.status(200).json({ success: true, message: 'Shared on Facebook successfully' }); // remove for production needed for endpoint testing
        });
    
  }

  // postFacebookCGI()

//////////////////////////////////////
// Schedule the Facebook post daily //
//////////////////////////////////////

cron.schedule('30 22 * * 1', () => {
    console.log('CGI Pro Painters Posting to facebook every day at 6:30PM 22utc ⓕⓕⓕⓕⓕ');
    postFacebookCGI();
  }, null, true, 'America/New_York');


//////////////////////////////////////
// Instagram CGI Pro Painters API ////
//////////////////////////////////////

postInstagramCGI = async (req, res) => {
  FB.setAccessToken(process.env.FACEBOOK_ACCESS_TOKEN_CGI);

      // Randomly select a post
      const lastObject = post[Math.floor(Math.random() * post.length)];

      // Post the content on Facebook
    

      // Step 1: Upload the image to Facebook
    FB.api(`/${process.env.IG_ID_CGI}/media`, 'POST', {
      media_type: 'IMAGE', // or VIDEO
      image_url: lastObject.image_url,
      caption: lastObject.message + `\n \n` + lastObject.link,
      comment_enabled: true,
      published: true
  }, function (response) {
      if (!response || response.error) {
          console.error('Error uploading image: Instagram', response.error);
          return;
      }

      const photoId = response.id;

      console.log('📸 Photo uploaded successfully: Instagram 📸 CGI Pro Painters', photoId);

      // Step 2: Publish the photo to Instagram
      FB.api(`/${process.env.IG_ID_CGI}/media_publish`, 'POST', {
          creation_id: photoId
      }, function (response) {
          if (!response || response.error) {
              console.error('Error publishing to Instagram CGI: 📸', response.error);
              return;
          }
          console.log('📸 Shared successfully: Instagram CGI 📸', response);
          return;

      });
  });
}  

// postInstagramCGI()

//////////////////////////////////////
// Schedule the Instagram post daily //
//////////////////////////////////////

cron.schedule('30 16 * * 2', () => {
  console.log('CGI Posting to Instagram at 8am (12utc)📸 📸');
  postToInstagramCGI();
}, null, true, 'America/New_York');

