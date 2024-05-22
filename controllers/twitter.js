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
        // Calculate the date 5 days ago
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

        // Format the date to YYYY-MM-DD
        const formattedDate = fiveDaysAgo.toISOString().split('T')[0];

        const recentBlogPost = `https://api.hubapi.com/cms/v3/blogs/posts?limit=10&createdAfter=${formattedDate}`;
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
    
        const userMessage = `Compose a Twitter post for my blog post with the title '${lastObject.htmlTitle}' discussing '${lastObject.metaDescription}'. Please include relevant hashtags and mentions in the post include this mention @CyrusGroupInv. Provide only the content of the post as the response. I will provide the image and link to the blog post.`;
        
        const chatGPTResponse = await axios.post(
            chatGPTApiUrl,
            {
              model: 'gpt-4o',
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

postTweetTechNews = async (req, res) => {
  
    console.log('Getting Tech News..........')
    const news = await axios.get(`https://newsapi.org/v2/everything?q=Technology+OR+AI+OR+Crypto+OR+Security+OR+startups+OR+apps&pageSize=100&sortBy=relevancy&excludeDomains=engadget.com&apiKey=${process.env.NEWS_API_KEY}`);
    console.log("News Articles", news.data.articles.length);


    const articles = news.data.articles.map((article) => {
        return {
            source: article.source.name,
            title: article.title,
            description: article.description,
            url: article.url,
            image: article.urlToImage,

        }
    }
    )

    const randomIndex = Math.floor(Math.random() * articles.length);

    const lastObject = articles[randomIndex];
    


    console.log("Last Tech News Obtained: ", lastObject.title, lastObject.description, lastObject.url);

      const apiKey = process.env.OPENAI_API_KEY;
      const chatGPTApiUrl = 'https://api.openai.com/v1/chat/completions';
  
      const userMessage = `Compose a Twitter post for this news article post with the title '${lastObject.title}' discussing '${lastObject.description}' and the source'${lastObject.source}'. Please include relevant hashtags and mentions in the post include this mention @CyrusGroupInv. Provide only the content of the post as the response. I will provide the image and link to the blog post. Keep the post under 230 characters so there is room for me to add the links to photo and article.`;
      
      const chatGPTResponse = await axios.post(
          chatGPTApiUrl,
          {
            model: 'gpt-4o',
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
      const { filePath } = await downloadFile(lastObject.image); // Download the image and get the file path
      const mediaId = await client.v1.uploadMedia(filePath); // Upload the downloaded image
      // const tweet = req.body.tweet;
      const resp = await client.v2.tweet({
          text: reply + ' ' + lastObject.url,
          media: { media_ids: [mediaId] }
      });
      console.log("Tweeted Successfully", resp);

};

postTweetBusNews = async (req, res) => {
  
  console.log('Getting Tech News..........')
  const news = await axios.get(`https://newsapi.org/v2/everything?q=%2Bsmall+%2Bbusiness+AND+%28Supply+Chain+Disruptions+OR+Tax+Changes+OR+Rising+Costs+OR+Remote+Work+OR+E-commerce%29+NOT%28climate+OR+trump+OR+biden+OR+DEI+OR+diversity+OR+Israel+OR+palestine+OR+environment%29&pageSize=100&sortBy=relevancy&apiKey=${process.env.NEWS_API_KEY}`);
  console.log("News Articles", news.data.articles.length);


  const articles = news.data.articles.map((article) => {
      return {
          source: article.source.name,
          title: article.title,
          description: article.description,
          url: article.url,
          image: article.urlToImage,

      }
  }
  )

  const randomIndex = Math.floor(Math.random() * articles.length);

  const lastObject = articles[randomIndex];
  


  console.log("Last Tech News Obtained: ", lastObject.title, lastObject.description, lastObject.url);

    const apiKey = process.env.OPENAI_API_KEY;
    const chatGPTApiUrl = 'https://api.openai.com/v1/chat/completions';

    const userMessage = `Compose a Twitter post for this news article post with the title '${lastObject.title}' discussing '${lastObject.description}' and the source'${lastObject.source}'. Please include relevant hashtags and mentions in the post include this mention @CyrusGroupInv. Provide only the content of the post as the response. I will provide the image and link to the blog post. Keep the post under 230 characters so there is room for me to add the links to photo and article.`;
    
    const chatGPTResponse = await axios.post(
        chatGPTApiUrl,
        {
          model: 'gpt-4o',
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
    const { filePath } = await downloadFile(lastObject.image); // Download the image and get the file path
    const mediaId = await client.v1.uploadMedia(filePath); // Upload the downloaded image
    // const tweet = req.body.tweet;
    const resp = await client.v2.tweet({
        text: reply + ' ' + lastObject.url,
        media: { media_ids: [mediaId] }
    });
    console.log("Tweeted Successfully", resp);

};


////////// Cron API //////////

cron.schedule('0 21 * * 1-5', async () => {
    try {
        console.log('Running a task every weekday at 9:00 utc 5pm EST! Twitter!');
        // Calculate the date 5 days ago
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

        // Format the date to YYYY-MM-DD
        const formattedDate = fiveDaysAgo.toISOString().split('T')[0];

        const recentBlogPost = `https://api.hubapi.com/cms/v3/blogs/posts?limit=10&createdAfter=${formattedDate}`;
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
    
        const userMessage = `Compose a Twitter post for my blog post with the title '${lastObject.htmlTitle}' discussing '${lastObject.metaDescription}'. Please include relevant hashtags in the post. Provide only the content of the post as the response. I will provide the image and link to the blog post. Keep the post under 230 characters so there is room for me to add the links to photo and article.`;
        
        const chatGPTResponse = await axios.post(
            chatGPTApiUrl,
            {
              model: 'gpt-4o',
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
        // res.json(resp);
        console.log("Tweeted Successfully", resp);
    } catch (error) {
        console.error("Twitter Error Failure", error);
        // res.status(500).json({ error: 'An error occurred while posting the tweet' });
    }
});

cron.schedule('0 12 * * *', async () => {
  console.log('Posting to twitter tech news a task every day at 8:00 am 12utc  EST! Twitter!');
  postTweetTechNews()
}, null, true, 'America/New_York');

cron.schedule('0 16 * * *', async () => {
  console.log('Posting to twitter business news a task every day at 12:00 am 16utc  EST! Twitter!');
  postTweetBusNews()
}, null, true, 'America/New_York');