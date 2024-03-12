const axios = require('axios');
const cron = require('node-cron');


////////// Test API //////////
exports.testApi = (req, res) => {
    res.send('Hello, Cron!');
}

////////// Test Cron //////////

// cron.schedule('* * * * *', async () => {
//     console.log('running a task every minute');
//   });

////////// Cron API //////////

cron.schedule('0 14 * * 1-5', async () => {
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
    
        const userMessage = `Compose a LinkedIn blog post with the title '${lastObject.htmlTitle}' discussing '${lastObject.metaDescription}'. Please include relevant hashtags in the post. Provide only the content of the post as the response.`;
        
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
          
          const response = await axios.post(
            `https://api.linkedin.com/rest/posts`, 
            {
              "author": `urn:li:organization:${process.env.LINKEDIN_ORG_ID}`,
              "commentary": reply,    
              "visibility": "PUBLIC",
              "distribution": {
                "feedDistribution": "MAIN_FEED",
                "targetEntities": [],
                "thirdPartyDistributionChannels": []
              }, 
              "content": {
                  "article": {
                      "source": lastObject.url,
                      "thumbnail": "urn:li:image:D4E10AQH8oZGdGHaVlA",
                      "title": lastObject.htmlTitle,
                      "description": lastObject.metaDescription,
                  }
              },
              "lifecycleState": "PUBLISHED",
              "isReshareDisabledByAuthor": false
             
            },
            {
              headers: {
                'LinkedIn-Version': '202402',
                'X-Restli-Protocol-Version': '2.0.0',
                'Authorization': `Bearer ${process.env.LINKEDIN_TOKEN}`,
                'Content-Type': 'application/json'
              }
            },
      
          );
    
          console.log('Post ', response.statusText);
          res.status(201).json(response.statusText);
    } catch (error) {
      console.error('Error posting to LinkedIn:', error.response.data);
      res.status(500).json({ error: error.response.data });
    }


}, null, true, 'America/New_York');


