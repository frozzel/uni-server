const axios = require('axios');
const FB = require('fb');
const cron = require('node-cron');



////////// Test API //////////

exports.testApi = (req, res) => {
    res.send('Hello, Facebook!');
}

////////// Facebook API //////////



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

// postFacebook();// 

postFacebook = async (req, res) => {
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

    console.log("Last blog post Obtained: ", lastObject.htmlTitle, lastObject.metaDescription, lastObject.url, lastObject.featuredImage);

    const apiKey = process.env.OPENAI_API_KEY;
    const chatGPTApiUrl = 'https://api.openai.com/v1/chat/completions';

    const userMessage = `Compose a Facebook post for my blog post with the title '${lastObject.htmlTitle}' discussing '${lastObject.metaDescription}'. Please include relevant hashtags and mentions in the post include the mention of my company @CyrusGroupInnovations. Provide only the content of the post as the response. I will provide the image and link to the blog post. Do not include the image or link in the post.`;

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

    // Share the content on Facebook

    const shareData = {
      // scrape: true,
      // link: lastObject.url,
      message: reply + ' ' + lastObject.url,
      url: lastObject.featuredImage,
      // type: "article",
    };

    FB.api(`/${process.env.FB_PAGE_ID}/photos`, 'POST', shareData, function (fbRes) {
        if (!fbRes || fbRes.error) {
          console.error('Error sharing: facebook', fbRes.error || 'Unknown error facebook');
          // res.status(400).json({ error: fbRes || 'Unknown error'});
          return;
        }
        console.log('Shared successfully: Facebook ⓕⓕⓕⓕⓕ', fbRes);
        // res.status(200).json({ success: true, message: 'Shared on Facebook successfully' });
        return;
      });
  
}

postFacebookTechNews = async (req, res) => {
  FB.setAccessToken(process.env.FACEBOOK_ACCESS_TOKEN);


    console.log('Getting Tech News..........')
    const news = await axios.get(`https://newsapi.org/v2/everything?q=Technology+OR+AI+OR+Crypto+OR+Security+OR+startups+OR+apps&pageSize=100&sortBy=relevancy&excludeDomains=engadget.com,yahoo.com&apiKey=${process.env.NEWS_API_KEY}`);
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

    const userMessage = `Compose a Facebook post for this news article with the title '${lastObject.title}' discussing '${lastObject.description}' and the source'${lastObject.source}'. Please include relevant hashtags and mentions in the post include this mention @CyrusGroupInnovations. Provide only the content of the post as the response. I will provide the image and link to the blog post.`;

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

    // Share the content on Facebook

    const shareData = {
      link: lastObject.url,
      message: reply,
    };

    FB.api(`/${process.env.FB_PAGE_ID}/feed`, 'POST', shareData, function (fbRes) {
        if (!fbRes || fbRes.error) {
          console.error('Error sharing: facebook', fbRes.error || 'Unknown error facebook');
          // res.status(400).json({ error: fbRes || 'Unknown error'});
          return;
        }
        console.log('Shared successfully: Facebook ⓕⓕⓕⓕⓕ', fbRes);
        // res.status(200).json({ success: true, message: 'Shared on Facebook successfully' });
        return;
      });
  
}

postFacebookBusNews = async (req, res) => {
  FB.setAccessToken(process.env.FACEBOOK_ACCESS_TOKEN);


  console.log('Getting Tech News..........')
  const news = await axios.get(`https://newsapi.org/v2/everything?q=%2Bsmall+%2Bbusiness+AND+%28Supply+Chain+Disruptions+OR+Tax+Changes+OR+Rising+Costs+OR+Remote+Work+OR+E-commerce%29+NOT%28climate+OR+trump+OR+biden+OR+DEI+OR+diversity+OR+Israel+OR+palestine+OR+environment%29&pageSize=100&sortBy=relevancy&excludeDomains=engadget.com,yahoo.com&apiKey=${process.env.NEWS_API_KEY}`);
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

  const userMessage = `Compose a Facebook post for this news article with the title '${lastObject.title}' discussing '${lastObject.description}' and the source'${lastObject.source}'. Please include relevant hashtags and mentions in the post include this mention @CyrusGroupInnovations. Provide only the content of the post as the response. I will provide the image and link to the blog post.`;

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

  // Share the content on Facebook

  const shareData = {
    link: lastObject.url,
    message: reply,
  };

  FB.api(`/${process.env.FB_PAGE_ID}/feed`, 'POST', shareData, function (fbRes) {
      if (!fbRes || fbRes.error) {
        console.error('Error sharing: facebook', fbRes.error || 'Unknown error facebook');
        // res.status(400).json({ error: fbRes || 'Unknown error'});
        return;
      }
      console.log('Shared successfully: Facebook ⓕⓕⓕⓕⓕ', fbRes);
      // res.status(200).json({ success: true, message: 'Shared on Facebook successfully' });
      return;
    });

}
// postFacebookBusNews();
// postFacebook()
// Schedule the Facebook post

cron.schedule('0 23 * * *', () => {
    console.log('Posting to facebook every day at 7PM 23utc ⓕⓕⓕⓕⓕ');
    postFacebook();
}, null, true, 'America/New_York');


cron.schedule('0 13 * * *', () => {
    console.log('Posting Tech News to facebook every day at 9AM 13utc ⓕⓕⓕⓕⓕ');
    postFacebookTechNews();
} , null, true, 'America/New_York');

cron.schedule('0 17 * * *', () => {
    console.log('Posting Business News to facebook every day at 1PM 17utc ⓕⓕⓕⓕⓕ');
    postFacebookBusNews();
}, null, true, 'America/New_York');