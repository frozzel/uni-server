const axios = require('axios');
const fs = require('fs');


////////// Test API //////////
exports.testApi = (req, res) => {
    res.send('Hello, World!');
}

////////// HubSpot API //////////

exports.getInfo = async (req, res) => {

    const pets = 'https://api.hubapi.com/cms/v3/blogs/posts';
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
const linkToImage = "/Users/frozzel/Documents/BootCampGT/uni-server/downloaded-image.jpeg";

console.log('Image Path', linkToImage);
// Function to download image from URL


// Function to upload image to LinkedIn

exports.postToLinkedIn = async (req, res) => {
    try {
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

          const resp2 = await axios.post(url, linkToImage, {
      
            // {
            //   "uploadBinaryRequest": {
            //     // "uploadUrl": url,
            //     "binary": linkToImage
            //   }
            // },
            
              headers: {
                'LinkedIn-Version': '202402',
                'X-Restli-Protocol-Version': '2.0.0',
                'Authorization': `Bearer ${process.env.LINKEDIN_TOKEN}`,
                'Content-Type': 'image/jpg'
              }
            }
          );

            console.log('Image Uploaded', resp2.statusText);

        const response = await axios.post(
          `https://api.linkedin.com/rest/posts`, 
          {
            "author": `urn:li:organization:${process.env.LINKEDIN_ORG_ID}`,
            "commentary": "Sample article Post with image and link",    
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
                    "title": "Sample Article Post with Image and Link",
                    "description": "some metadata about the article",
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
        // console.error('Error posting to LinkedIn:', error.response.data);
        // res.status(500).json({ error: error.response.data });
        console.error('Error posting to LinkedIn:', error);
        res.status(500).json({ error: error });
      }
    };

exports.aiPostToLinkedIn = async (req, res) => {
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