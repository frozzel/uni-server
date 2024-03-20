const axios = require('axios');
const FB = require('fb');
const cron = require('node-cron');

////////// Test API //////////

exports.testApi = (req, res) => {
    res.send('Hello, Facebook!');
}

////////// Facebook API //////////

FB.setAccessToken(process.env.FACEBOOK_ACCESS_TOKEN);

// Data to share

// const shareData = {
//   link: 'https://cyrusgroupinnovations.com/blog/ai-content-generation-boosting-seo-performance',
//   message: 'Check out this cool page!',
// };

// Share the content on Facebook

// exports.postFacebook = async (req, res) => {
//     FB.api(`/${process.env.FB_PAGE_ID}/feed`, 'POST', shareData, function (fbRes) {
//         if (!fbRes || fbRes.error) {
//           console.error('Error sharing:', fbRes.error || 'Unknown error');
//           res.status(400).json({ error: fbRes || 'Unknown error'});
//           return;
//         }
//         console.log('Shared successfully:', fbRes);
//         res.status(200).json({ success: true, message: 'Shared on Facebook successfully' });
//       });
//     };

postFacebook = async (req, res) => {
 
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

    console.log("Last blog post Obtained: ", lastObject.htmlTitle, lastObject.metaDescription, lastObject.url);

    const apiKey = process.env.OPENAI_API_KEY;
    const chatGPTApiUrl = 'https://api.openai.com/v1/chat/completions';

    const userMessage = `Compose a Facebook post for my blog post with the title '${lastObject.htmlTitle}' discussing '${lastObject.metaDescription}'. Please include relevant hashtags in the post. Provide only the content of the post as the response. I will provide the image and link to the blog post.`;

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

    // Share the content on Facebook

    const shareData = {
      link: lastObject.url,
      message: reply,
    };

    FB.api(`/${process.env.FB_PAGE_ID}/feed`, 'POST', shareData, function (fbRes) {
        if (!fbRes || fbRes.error) {
          console.error('Error sharing:', fbRes.error || 'Unknown error');
          res.status(400).json({ error: fbRes || 'Unknown error'});
          return;
        }
        console.log('Shared successfully:', fbRes);
        res.status(200).json({ success: true, message: 'Shared on Facebook successfully' });
      });
  
}

// Schedule the Facebook post

cron.schedule('56 17 * * 1-5', () => {
    console.log('Running a task every day at 7PM 23utc');
    postFacebook();
}, null, true, 'America/New_York');