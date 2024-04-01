const axios = require('axios');
const fs = require('fs');
const { exec } = require('child_process');
const {downloadFile} = require('../Utils/download.js');



////////// Test API //////////
exports.testApi = (req, res) => {
    res.send('Hello, World!');
}

////////// HubSpot API //////////

exports.getInfo = async (req, res) => {

    // Calculate the date 5 days ago
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    // Format the date to YYYY-MM-DD
    const formattedDate = fiveDaysAgo.toISOString().split('T')[0];

    const pets = `https://api.hubapi.com/cms/v3/blogs/posts?limit=10&createdAfter=${formattedDate}`;
    const headers = {
        Authorization: `Bearer ${process.env.PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    }

    try {
        const resp = await axios.get(pets, { headers });
        const data = resp.data.results;
        const data2 = data.map((item) => {
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


                // Get the last object in the array
                const lastObject = data2[data2.length - 1];
      
        res.json(lastObject);  
    } catch (error) {
        console.error(error);
       
    }

};

////////// LinkedIn API //////////



const linkToBlogPost = 'https://cyrusgroupinnovations.com/blog/boosting-small-business-content-creation-with-ai';
// const linkToImage = 'https://45070224.fs1.hubspotusercontent-na1.net/hubfs/45070224/business%20documents%20on%20office%20table%20with%20smart%20phone%20and%20digital%20tablet%20and%20graph%20financial%20with%20social%20network%20diagram%20and%20man%20working%20in%20the%20background.jpeg';
const linkToImage = "/Users/frozzel/Documents/BootCampGT/uni-server/controllers/crm-statistics.jpg";


// Function to download image from URL


// Function to upload image to LinkedIn

exports.postToLinkedIn = async (req, res) => {
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
              'LinkedIn-Version': '202402',
              'X-Restli-Protocol-Version': '2.0.0',
              'Authorization': `Bearer ${process.env.LINKEDIN_TOKEN}`,
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

          console.log('CURL COMMAND', curlCommand);

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
      
        const userMessage = `Compose a LinkedIn blog post with the title '${lastObject.htmlTitle}' discussing '${lastObject.metaDescription}'. Please include relevant hashtags in the post. Provide only the content of the post as the response.`;
          
  const postNow = async () => {
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
                "article": {
                    "source": linkToBlogPost,
                    "thumbnail": imageUrn,
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
      }
      } catch (error) {
        // console.error('Error posting to LinkedIn:', error.response.data);
        // res.status(500).json({ error: error.response.data });
        console.error('Error posting to LinkedIn:', error);
        res.status(500).json({ error: error });
      }
    };

exports.aiPostToLinkedIn = async (req, res) => {
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

      // console.log('Post Submitted', postToLinkedIn.statusText);
      // res.status(201).json(postToLinkedIn.statusText);

  // return res.json( postToLinkedIn.statusText);

      console.log('Post ', response.statusText);
      res.status(201).json(response.statusText);
} catch (error) {
  console.error('Error posting to LinkedIn:', error.response.data);
  res.status(500).json({ error: error.response.data });
}
}