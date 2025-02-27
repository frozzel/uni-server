const axios = require('axios');
const cron = require('node-cron');
const fs = require('fs');
const { exec } = require('child_process');
const {downloadFile} = require('../Utils/download.js');
const { response } = require('express');
const ApiKey = require('../models/pinterest.js');
const { default: mongoose } = require('mongoose');



////////// Test API //////////
exports.testApi = (req, res) => {
    res.send('Hello, LinkedIn!');
}

////////// LinkedIn Api //////////

postBlogToLinkedIn = async (req, res) => {
  const apiKey1 = await ApiKey.findOne({token_vendor: 'linkedin'}).limit(1);
  const LINKEDIN_TOKEN = apiKey1.decryptKey();
  
    console.log('Posting to LinkedIn........');
    try {
      console.log('Posting to LinkedIn  every weekday at 2:30 PM 18utc');
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
    
        const { filePath } = await downloadFile(lastObject.featuredImage); // Download the image and get the file path
  
        const resp = await axios.post(
          `https://api.linkedin.com/rest/images?action=initializeUpload`,
          {
            "initializeUploadRequest": {
                  "owner": `urn:li:organization:${process.env.LINKEDIN_ORG_ID}`
            }
          },
          {
            headers: {
              'LinkedIn-Version': process.env.LINKEDIN_VERSION,
              'X-Restli-Protocol-Version': '2.0.0',
              'Authorization': `Bearer ${LINKEDIN_TOKEN}`,
              'Content-Type': 'application/json'
            }
          }
          );
  
          const url = resp.data.value.uploadUrl;
          console.log('URL', url);
          const imageUrn = resp.data.value.image;
          console.log('Image URN', imageUrn);
  
          // const imageData = fs.readFileSync(filePath);
  
          // Initialize the curl command
          const curlCommand = `curl -i --upload-file ${filePath} -H 'Authorization: Bearer ${process.env.LINKEDIN_TOKEN}' "${url}"`;
  
        //   console.log('CURL COMMAND', curlCommand);
  
          // Execute the curl command
          exec(curlCommand, (error, stdout, stderr) => {
              if (error) {
                  console.error(`Error executing curl command: ${error.message}`);
                  return;
              }
              if (stderr) {
                  console.error(`stderr: ${stderr}`);
                  console.log('Error uploading image to LinkedIn');
                  console.log('stdout', stdout);
                  postNow()
                  return;
              }
              console.log(`stdout: ${stdout}`);
  
              // Now you can proceed with your postNow function or any other logic
              postNow();
          });
  
        const apiKey = process.env.OPENAI_API_KEY;
        const chatGPTApiUrl = 'https://api.openai.com/v1/chat/completions';
      
        const userMessage = `Compose a LinkedIn post with the title '${lastObject.htmlTitle}' discussing '${lastObject.metaDescription}'. Please include relevant hashtags and mentions in the post . Provide only the content of the post as the response And Do not add the link to the article, and keep the post under 2500 characters.`;
  
    const postNow = async () => {
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
  
  
          console.log('Posting to LinkedIn........');
  
  
          const response = await axios.post(
            `https://api.linkedin.com/rest/posts`, 
            {
              "author": `urn:li:organization:${process.env.LINKEDIN_ORG_ID}`,
              "commentary": reply + ' ' + lastObject.url,    
              "visibility": "PUBLIC",
              "distribution": {
                "feedDistribution": "MAIN_FEED",
                "targetEntities": [],
                "thirdPartyDistributionChannels": []
              }, 
              "content": {
                "media": {
                    // "source": lastObject.url,
                    "id": imageUrn,
                    "title": lastObject.title,
                    "altText": lastObject.description,
                }
            },
              "lifecycleState": "PUBLISHED",
              "isReshareDisabledByAuthor": false
             
            },
            {
              headers: {
                'LinkedIn-Version': process.env.LINKEDIN_VERSION,
                'X-Restli-Protocol-Version': '2.0.0',
                'Authorization': `Bearer ${LINKEDIN_TOKEN}`,
                'Content-Type': 'application/json'
              }
            },
  
          );
          if (response.status === 201 || response.status === 200) {
            console.log('Post ', response.statusText);
          } else {
            console.log('Error: ', response.statusText);
          }
          
    }
  
    console.log('Post to LinkedIn Completed');
  } catch (error) {
    console.error('Error posting to LinkedIn:');
    // res.status(500).json({ error: error.response.data });  
  }
}

postLinkedInTechNews = async (req, res) => {
  const apiKey1 = await ApiKey.findOne({token_vendor: 'linkedin'}).limit(1);
  const LINKEDIN_TOKEN = apiKey1.decryptKey();

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

    const { filePath } = await downloadFile(lastObject.image); // Download the image and get the file path

    const resp = await axios.post(
        `https://api.linkedin.com/rest/images?action=initializeUpload`,
        {
          "initializeUploadRequest": {
                "owner": `urn:li:organization:${process.env.LINKEDIN_ORG_ID}`
          }
        },
        {
          headers: {
            'LinkedIn-Version': process.env.LINKEDIN_VERSION,
            'X-Restli-Protocol-Version': '2.0.0',
            'Authorization': `Bearer ${LINKEDIN_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
        );

        const url = resp.data.value.uploadUrl;
        console.log('URL', url);
        const imageUrn = resp.data.value.image;
        console.log('Image URN', imageUrn);

        // const imageData = fs.readFileSync(filePath);

        // Initialize the curl command
        const curlCommand = `curl -i --upload-file ${filePath} -H 'Authorization: Bearer ${process.env.LINKEDIN_TOKEN}' "${url}"`;

        // console.log('CURL COMMAND', curlCommand);

        // Execute the curl command
        exec(curlCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing curl command: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                console.log('Error uploading image to LinkedIn');
                console.log('stdout', stdout);
                postNow()
                return;
            }
            console.log(`stdout: ${stdout}`);

            // Now you can proceed with your postNow function or any other logic
            postNow();
        });

        const apiKey = process.env.OPENAI_API_KEY;
        const chatGPTApiUrl = 'https://api.openai.com/v1/chat/completions';
      
        const userMessage = `Compose a LinkedIn blog post with the title '${lastObject.title}' discussing '${lastObject.description}' and the source'${lastObject.source}'. Please include relevant hashtags and mentions in the post. Provide only the content of the post as the response And Add the link to the article at the end of the post '${lastObject.url}', and keep the post under 2500 characters.`;
  
    const postNow = async () => {
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
  
  
          console.log('Posting to LinkedIn........');
  
  
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
                  "media": {
                      // "source": lastObject.url,
                      "id": imageUrn,
                      "title": lastObject.title,
                      "altText": lastObject.description,
                  }
              },
              "lifecycleState": "PUBLISHED",
              "isReshareDisabledByAuthor": false
             
            },
            {
              headers: {
                'LinkedIn-Version': process.env.LINKEDIN_VERSION,
                'X-Restli-Protocol-Version': '2.0.0',
                'Authorization': `Bearer ${LINKEDIN_TOKEN}`,
                'Content-Type': 'application/json'
              }
            },
  
          );
          if (response.status === 201 || response.status === 200) {
            console.log('Post ', response.statusText);
          } else {
            console.log('Error: ', response.statusText);
          }
          
    }
  
    console.log('Post to LinkedIn Completed');
}

postLinkedInBusNews = async (req, res) => {
  const apiKey1 = await ApiKey.findOne({token_vendor: 'linkedin'}).limit(1);
  const LINKEDIN_TOKEN = apiKey1.decryptKey();

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

    const { filePath } = await downloadFile(lastObject.image); // Download the image and get the file path

    const resp = await axios.post(
        `https://api.linkedin.com/rest/images?action=initializeUpload`,
        {
          "initializeUploadRequest": {
                "owner": `urn:li:organization:${process.env.LINKEDIN_ORG_ID}`
          }
        },
        {
          headers: {
            'LinkedIn-Version': process.env.LINKEDIN_VERSION,
            'X-Restli-Protocol-Version': '2.0.0',
            'Authorization': `Bearer ${LINKEDIN_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
        );

        const url = resp.data.value.uploadUrl;
        console.log('URL', url);
        const imageUrn = resp.data.value.image;
        console.log('Image URN', imageUrn);

        // const imageData = fs.readFileSync(filePath);

        // Initialize the curl command
        const curlCommand = `curl -i --upload-file ${filePath} -H 'Authorization: Bearer ${process.env.LINKEDIN_TOKEN}' "${url}"`;

        // console.log('CURL COMMAND', curlCommand);

        // Execute the curl command
        exec(curlCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing curl command: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                console.log('Error uploading image to LinkedIn');
                console.log('stdout', stdout);
                postNow()
                return;
            }
            console.log(`stdout: ${stdout}`);

            // Now you can proceed with your postNow function or any other logic
            postNow();
        });

        const apiKey = process.env.OPENAI_API_KEY;
        const chatGPTApiUrl = 'https://api.openai.com/v1/chat/completions';
      
        const userMessage = `Compose a LinkedIn blog post with the title '${lastObject.title}' discussing '${lastObject.description}' and the source'${lastObject.source}'. Please include relevant hashtags and mentions in the post. Provide only the content of the post as the response And Add the link to the article at the end of the post '${lastObject.url}', and keep the post under 2500 characters.`;
  
    const postNow = async () => {
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
  
  
          console.log('Posting to LinkedIn........');
  
  
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
                "media": {
                    // "source": lastObject.url,
                    "id": imageUrn,
                    "title": lastObject.title,
                    "altText": lastObject.description,
                }
            },
              "lifecycleState": "PUBLISHED",
              "isReshareDisabledByAuthor": false
             
            },
            {
              headers: {
                'LinkedIn-Version': process.env.LINKEDIN_VERSION,
                'X-Restli-Protocol-Version': '2.0.0',
                'Authorization': `Bearer ${LINKEDIN_TOKEN}`,
                'Content-Type': 'application/json'
              }
            },
  
          );
          if (response.status === 201 || response.status === 200) {
            console.log('Post ', response.statusText);
          } else {
            console.log('Error: ', response.statusText);
          }
          
    }
  
    console.log('Post to LinkedIn Completed');
}

// postLinkedInTechNews();
// postBlogToLinkedIn();

////////// LinkedIn Cron Job //////////

cron.schedule('30 18 * * *', async () => {
    console.log('Posting to LinkedIn every weekday at 2:30 PM 18utc');
    postBlogToLinkedIn();
  
  
  }, null, true, 'America/New_York');

cron.schedule('0 14 * * *', async () => {
    console.log('Posting Tech News to LinkedIn every day at 10am 14utc');
    postLinkedInTechNews();
}, null, true, 'America/New_York');

cron.schedule('0 22 * * *', async () => {
    console.log('Posting Business News to LinkedIn every day at 6pm 22utc');
    postLinkedInBusNews();
}, null, true, 'America/New_York');

cron.schedule('39 23 * * *', async () => {
  console.log('Posting Business News to LinkedIn every day at 6pm 22utc');
  postLinkedInBusNews();
}, null, true, 'America/New_York');

/////////////// LinkedIn Oauth Call //////////////////////

const authorizationUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=https%3A%2F%2Fwww.linkedin.com%2Fdevelopers%2Ftools%2Foauth%2Fredirect&scope=r_organization_social%20w_member_social%20w_organization_social%20openid%20profile%20r_ads_reporting%20rw_organization_admin%20r_ads%20rw_ads%20r_basicprofile%20r_organization_admin%20email%20r_1st_connections_size`;

// console.log('Open this URL in your browser and authorize the app:', authorizationUrl);

async function getAccessToken() {
    const response = await axios.post(
        'https://www.linkedin.com/oauth/v2/accessToken',
        {
            grant_type: 'authorization_code',
            code: process.env.REDIRECT_CODE,
            client_id: process.env.LINKEDIN_CLIENT_ID,
            redirect_uri: "https://www.linkedin.com/developers/tools/oauth/redirect",
            client_secret: process.env.LINKEDIN_CLIENT_SECRET,
        },
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }
    );

    console.log('Access Token:', response.data);
    // console.log(response)
}

async function refreshAccessToken() {
  try {
    const response = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      {
        grant_type: "refresh_token",
        refresh_token: process.env.LINKEDIN_REFRESH_TOKEN,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
        // redirect_uri: "https://www.linkedin.com/developers/tools/oauth/redirect",
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const deleteKeys = await ApiKey.deleteOne({"token_vendor": "linkedin"});
    console.log("🔑🔑🔑 Deleted Old LinkedIn API Keys, Number Deleted: ", deleteKeys);

    console.log("LinkedIn Access Token Response:", response.data);

    const apikey = new ApiKey({
      token_vendor: "linkedin",
      refresh_token: response.data.refresh_token,
      access_token: response.data.access_token,
      response_type: response.data.response_type,
      expires_in: response.data.expires_in,
      scope: response.data.scope,
    });
    await apikey.save();

    console.log("🎯 LinkedIn API Key Generated 🔑"  );
  } catch (error) {
    console.error("Error refreshing LinkedIn access token:", error.response?.data || error.message, error);
  }
}

// refreshAccessToken();
// getAccessToken();

cron.schedule('0 0 15 * *', () => {
  console.log('🔑🔑 Running LinkedIn API KEY GENERATOR on the 15th of the month 🔑🔑');
  refreshAccessToken();
}, null, true, 'America/New_York');
