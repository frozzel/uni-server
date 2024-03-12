const axios = require('axios');
const {TwitterApi} = require('twitter-api-v2');
const cron = require('node-cron');
const {downloadFile} = require('../Utils/download.js');


////////// Test API //////////

exports.testApi = (req, res) => {
    res.send('Hello, Twitter!');
}

////////// Twitter API //////////

const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_API_KEY_NON_CONSUMER,
    accessSecret: process.env.TWITTER_API_SECRET_NON_CONSUMER,
});

////// testing the twitter api with image upload const img = (__dirname +    '/CRM.jpeg')

// exports.postTweet = async (req, res) => {
//     try {
//         const mediaIds = await Promise.all([
//             client.v1.uploadMedia(img),
//             // client.v1.uploadMedia('https://www.example.com/image2.jpg'),
//         ]);
//         const tweet = req.body.tweet;
//         const resp = await client.v2.tweet({
//             text: tweet,
//             media: {media_ids: mediaIds}
//         });
//         res.json(resp);
//     } catch (error) {
//         console.error(error);
//     }
// };
exports.postTweet = async (req, res) => {
    try {
        const recentBlogPost = 'https://api.hubapi.com/cms/v3/blogs/posts'
        const headers = {
            Authorization: `Bearer ${process.env.PRIVATE_APP_ACCESS}`,
            'Content-Type': 'application/json'
        }
    
        const getBlogPost = await axios.get(recentBlogPost, { headers });
        const blogPostData = getBlogPost.data.results;  
        const lastBlogPost = blogPostData.map((item) => {
            return {
                id: item.id,
                authorName: item.authorName,
                created: item.created,
                currentState: item.currentState,
                featuredImage: item.featuredImage,
                htmlTitle: item.htmlTitle,
                metaDescription: item.metaDescription,
                postBody: item.postBody,
                url: item.url
                }
                });
    
        const lastObject = lastBlogPost[lastBlogPost.length - 1];
    
        console.log("Last Blog Post Obtained", lastObject.htmlTitle, lastObject.metaDescription, lastObject.url, lastObject.featuredImage);
    
        const apiKey = process.env.OPENAI_API_KEY;
        const chatGPTApiUrl = 'https://api.openai.com/v1/chat/completions';
    
        const userMessage = `Compose a Twitter post for my blog post with the title '${lastObject.htmlTitle}' discussing '${lastObject.metaDescription}'. Please include relevant hashtags in the post. Provide only the content of the post as the response. I will provide the image and link to the blog post.`;
        
        const chatGPTResponse = await axios.post(
            chatGPTApiUrl,
            {
              model: 'gpt-3.5-turbo',
              messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: userMessage },
              ],
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
              },
            }
          );
            
        const reply = chatGPTResponse.data.choices[0].message.content;
          console.log("CHATGPT", reply);

        // const img = req.body.imageUrl; // Assuming the image URL is provided in the request body
        const { filePath } = await downloadFile(lastObject.featuredImage); // Download the image and get the file path
        const mediaId = await client.v1.uploadMedia(filePath); // Upload the downloaded image
        // const tweet = req.body.tweet;
        const resp = await client.v2.tweet({
            text: reply + ' ' + lastObject.url,
            media: { media_ids: [mediaId] }
        });
        res.json(resp);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while posting the tweet' });
    }
};
////////// Cron API //////////

cron.schedule('0 21 * * 1-5', async () => {
    try {
        const recentBlogPost = 'https://api.hubapi.com/cms/v3/blogs/posts'
        const headers = {
            Authorization: `Bearer ${process.env.PRIVATE_APP_ACCESS}`,
            'Content-Type': 'application/json'
        }
    
        const getBlogPost = await axios.get(recentBlogPost, { headers });
        const blogPostData = getBlogPost.data.results;  
        const lastBlogPost = blogPostData.map((item) => {
            return {
                id: item.id,
                authorName: item.authorName,
                created: item.created,
                currentState: item.currentState,
                featuredImage: item.featuredImage,
                htmlTitle: item.htmlTitle,
                metaDescription: item.metaDescription,
                postBody: item.postBody,
                url: item.url
                }
                });
    
        const lastObject = lastBlogPost[lastBlogPost.length - 1];
    
        console.log("Last Blog Post Obtained", lastObject.htmlTitle, lastObject.metaDescription, lastObject.url, lastObject.featuredImage);
    
        const apiKey = process.env.OPENAI_API_KEY;
        const chatGPTApiUrl = 'https://api.openai.com/v1/chat/completions';
    
        const userMessage = `Compose a Twitter post for my blog post with the title '${lastObject.htmlTitle}' discussing '${lastObject.metaDescription}'. Please include relevant hashtags in the post. Provide only the content of the post as the response. I will provide the image and link to the blog post.`;
        
        const chatGPTResponse = await axios.post(
            chatGPTApiUrl,
            {
              model: 'gpt-3.5-turbo',
              messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: userMessage },
              ],
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
              },
            }
          );
            
        const reply = chatGPTResponse.data.choices[0].message.content;
          console.log("CHATGPT", reply);

        // const img = req.body.imageUrl; // Assuming the image URL is provided in the request body
        const { filePath } = await downloadFile(lastObject.featuredImage); // Download the image and get the file path
        const mediaId = await client.v1.uploadMedia(filePath); // Upload the downloaded image
        // const tweet = req.body.tweet;
        const resp = await client.v2.tweet({
            text: reply + ' ' + lastObject.url,
            media: { media_ids: [mediaId] }
        });
        res.json(resp);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while posting the tweet' });
    }
});