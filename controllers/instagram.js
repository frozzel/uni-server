const axios = require('axios');
const FB = require('fb');
const cron = require('node-cron');


////////// Test API //////////
exports.testApi = (req, res) => {
    res.send('Hello, Instagram!');
}

////////// Post Instagram //////////


postToInstagram = async (req, res) => {
    FB.setAccessToken(process.env.FACEBOOK_ACCESS_TOKEN);

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
    // const lastObject = getBlogPost.data;

    console.log("Last blog post Obtained: ", lastObject.htmlTitle, lastObject.metaDescription, lastObject.url);

    const apiKey = process.env.OPENAI_API_KEY;
    const chatGPTApiUrl = 'https://api.openai.com/v1/chat/completions';

    const userMessage = `Compose a Instagram post for my blog post with the title '${lastObject.htmlTitle}' discussing '${lastObject.metaDescription}'. Please include relevant hashtags in the post. Provide only the content of the post as the response. I will provide the image and link to the blog post.`;

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


    // Step 1: Upload the image to Facebook
    FB.api(`/${process.env.IG_ID}/media`, 'POST', {
        media_type: 'IMAGE', // or VIDEO
        image_url: lastObject.featuredImage,
        // media: imageUrl,
        caption: reply,
        comment_enabled: true,
        published: true
    }, function (response) {
        if (!response || response.error) {
            console.error('Error uploading image: Instagram', response.error);
            return;
        }

        const photoId = response.id;

        console.log('Photo uploaded successfully: Instagram', photoId);

        // Step 2: Publish the photo to Instagram
        FB.api(`/${process.env.IG_ID}/media_publish`, 'POST', {
            creation_id: photoId
        }, function (response) {
            if (!response || response.error) {
                console.error('Error publishing to Instagram:', response.error);
                return;
            }

        });
    });
}

// postToInstagram();

/////// cron post to instagram ///////

cron.schedule('32 13 * * 1-5', () => {
    console.log('Posting to Instagram at 8am (12utc)');
    postToInstagram();
}, null, true, 'America/New_York');