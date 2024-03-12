const axios = require('axios');


////////// Test API //////////

exports.testApi = (req, res) => {
    res.send('Hello, Twitter!');
}

////////// Twitter API //////////
const {TwitterApi} = require('twitter-api-v2');

const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_API_KEY_NON_CONSUMER,
    accessSecret: process.env.TWITTER_API_SECRET_NON_CONSUMER,
});

exports.postTweet = async (req, res) => {
    try {
        const tweet = req.body.tweet;
        const resp = await client.v2.tweet(tweet);
        res.json(resp);
    } catch (error) {
        console.error(error);
    }
};
