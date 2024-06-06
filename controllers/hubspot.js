const axios = require('axios');
const fs = require('fs');
const { exec } = require('child_process');
const {downloadFile} = require('../Utils/download.js');
const OpenAI = require('openai');
const { createReadStream } = require('fs');
const path = require('path');
const FormData = require('form-data');






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
      
        res.json(data);  
    } catch (error) {
        console.error(error);
       
    }

};

////////// LinkedIn API //////////



const linkToBlogPost = 'https://cyrusgroupinnovations.com/blog/boosting-small-business-content-creation-with-ai';
// const linkToImage = 'https://45070224.fs1.hubspotusercontent-na1.net/hubfs/45070224/business%20documents%20on%20office%20table%20with%20smart%20phone%20and%20digital%20tablet%20and%20graph%20financial%20with%20social%20network%20diagram%20and%20man%20working%20in%20the%20background.jpeg';
// const linkToImage = "/Users/frozzel/Documents/BootCampGT/uni-server/downloaded-image.png";
const linkToImage = "https://oaidalleapiprodscus.blob.core.windows.net/private/org-maWxLhs60s3ZoF5kEnTcLytn/user-6IZ8GvCSWHdHsJdlu7U685P9/img-kjbcqym8NErD4NyQchqZOdEH.png?st=2024-06-05T18%3A32%3A13Z&se=2024-06-05T20%3A32%3A13Z&sp=r&sv=2023-11-03&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2024-06-05T17%3A17%3A31Z&ske=2024-06-06T17%3A17%3A31Z&sks=b&skv=2023-11-03&sig=7p9FgNqES1QLeK7sbCMK6dpyZ9E8Jud8eXhv7WHuR/c%3D";


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
////////// ChatGPT API //////////

const apiKey = process.env.OPENAI_API_KEY;
const chatGPTApiUrl = 'https://api.openai.com/v1/chat/completions';

///// upload image to hubspot /////

uploadImage = async (req, res) => {
  try {
    const openai = new OpenAI({ apiKey: apiKey });

    const {userMessage}  = {
      "userMessage":  "The Rise of Conversational Interfaces: Designing AI-Powered Chatbots for Websites"
    
    
    };
    // console.log(req.body)
    if (!userMessage) {
      return res.status(400).json({ error: 'User message is required.' });
    }

    const dalleQuestion = `Create a dalle 3 prompt to create an image for this blog topic: ${userMessage}. Don't add text to the image in any way`;
    console.log(dalleQuestion);

    const response1 = await axios.post(
      chatGPTApiUrl,
      {
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: dalleQuestion },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );
      
    const reply = response1.data.choices[0].message.content;
    console.log(reply);

    // Generate an image using the DALL-E model
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: reply,
      n: 1,
      size: "1792x1024",
    });
    image_url = response.data[0].url;
    console.log(response)
    

    // Save the image to a file
    const {filePath} = await downloadFile(image_url, 'dallE');
    console.log('Image generated successfully!');
    console.log("Image URL", image_url);

 
    const formData = new FormData();
    formData.append('file', createReadStream(filePath), path.basename(filePath));
    formData.append('folderPath', '/images'); // Set the folderPath as per HubSpot example
    // formData.append('fileName', 'downloaded-image.png'); // Set the fileName as per HubSpot example
    // formData.append('fileType', 'image/png'); // Set the fileType as per HubSpot example
    // formData.append('access', 'PUBLIC_INDEXABLE'); // Set the access field to PUBLIC_INDEXABLE directly in the form data
    formData.append('options',`{"access":"PUBLIC_INDEXABLE"}`); // Set the access field to PUBLIC_INDEXABLE directly in the form data

    const {ImportFromUrlInput} = { folderPath: '/images', access: "PUBLIC_INDEXABLE",  url: image_url, };

    // console.log("Form Data", formData);
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://api.hubapi.com/api/filemanager/api/v3/files/upload',
      headers: {
      'Authorization': `Bearer ${process.env.PRIVATE_APP_ACCESS}`,
      ...formData.getHeaders()
      },
      data : formData
      };
      

    const resp = await axios.request(config);
      // 'https://api.hubapi.com/filemanager/api/v3/files/upload',
      // {headers: {
      //   "Authorization": `Bearer ${process.env.PRIVATE_APP_ACCESS}`,
      //   "folderPath": '/images', 
      //   "access": "PUBLIC_INDEXABLE",  
      //   "url": image_url,
      //   'Content-Type': 'application/json',
      // },}
    // );

    console.log('Image uploaded to HubSpot:', resp.data.objects[0].url);
    // res.json({ url: resp.data.objects[0].url });
  } catch (error) {
    console.error('Error uploading image to HubSpot:', error);
    // res.status(500).json({ error: error.message });
  }
};

// uploadImage();


///// post to hubspot blog /////
createBlogPost = async (req, res) => {
  try {
    const HUBSPOT_BLOG_POST_URL = 'https://api.hubapi.com/cms/v3/blogs/posts';

    // Extract blog data from the request body
    // const { title, content, slug, tags, authorId, blogId, metaTitle, metaDescription, featuredImage } = req.body;

    // Prepare the data to be sent to HubSpot
    const blogPostData = {
      name: "The Rise of Conversational Interfaces: Designing AI-Powered Chatbots for Websites",
      postBody: "The Rise of Conversational Interfaces: Designing AI-Powered Chatbots for Websites Body",
      slug: "blog/efficient-inventory-tracking-strategies-with-shopify22",
      publishImmediately: true,
      tagIds: [159421975454, 165135476399],
      blogAuthorId: 158140284837,
      state: 'PUBLISHED', // or 'draft' if you don't want to publish it immediately
      metaTitle: "Some Meta Title",
      metaDescription: "Some Meta Description",
      featuredImage: "https://cyrusgroupinnovations.com/hubfs/CrmIntegrations.001-Jun-05-2024-02-56-40-4390-AM.png",
      contentGroupId: 158129258575,
      publishImmediately: true,
      createdById: "63468404",
      language: "en",
      htmlTitle: "string",
      publicAccessRulesEnabled: true,
      widgetContainers: {},
		  widgets: {
			blog_subscribe: {
				body: {
					description: "<p>&nbsp;</p>\n<p><span style=\"color: #ffffff;\">&nbsp;</span></p>\n<p><span>Stay updated on the newest technology news to enhance and optimize your small business requirements!</span></p>\n<p>&nbsp;</p>\n<div class=\"hs-embed-wrapper\"><div class=\"hs-embed-content-wrapper\"><div class=\"hs-cta-embed hs-cta-simple-placeholder hs-cta-embed-157859368197\" style=\"max-width: 100%; max-height: 100%; width: 195px; height: 46.6875px;\" data-hubspot-wrapper-cta-id=\"157859368197\"><a href=\"https://cta-service-cms2.hubspot.com/web-interactives/public/v1/track/redirect?encryptedPayload=AVxigLKlTPk3k9gDdPlDJ81HuMZcrj6h%2BH2sk9%2BheL0pT0js712Swb3V0%2FrPOEPpP7a6iEofszfd0PcUm4xCQjKfGsW5g6t3Ogzz01EqMPQBfyh0RHz4L6T%2FM9s5owElh%2FJ0%2BAztZEFINGYjLDFsL%2F1Xn6qz4A%3D%3D&amp;webInteractiveContentId=157859368197&amp;portalId=45070224\" target=\"_blank\" rel=\"noopener\" crossorigin=\"anonymous\"> <img alt=\"Learn More\" loading=\"lazy\" src=\"https://no-cache.hubspot.com/cta/default/45070224/interactive-157859368197.png\" style=\"height: 100%; width: 100%; object-fit: fill;\" onerror=\"this.style.display='none'\" data-mce-paste=\"true\"> </a></div></div></div>\n<p style=\"text-align: center;\"><span>&nbsp;</span></p>",
					style: {
						background: {
							background_color: {
								color: "#ff6cab",
								opacity: 10
							}
						},
						cta_content: {
							overline_font: {
								color: "#000000"
							},
							title_font: {
								color: "#000000"
							}
						},
						custom_style: true
					}
				},
				child_css: {},
				css: {},
				id: "blog_subscribe",
				label: "Blog subscribe",
				module_id: 154798881064,
				name: "blog_subscribe",
				order: 8,
				styles: {},
				type: "module"
			}
		}


    }

    // Send a POST request to HubSpot
    const response = await axios.post(HUBSPOT_BLOG_POST_URL, blogPostData, {
      headers: {
        'Content-Type': 'application/json',
         'Authorization': `Bearer ${process.env.PRIVATE_APP_ACCESS}`
      }
    });

    // Handle the response
    if (response.status === 201) {
      console.log('Blog post created successfully:', response.data);
      // res.status(201).json({ message: 'Blog post created successfully', data: response.data });
    } else {
      console.log('Failed to create blog post:', response.data);
      // res.status(response.status).json({ message: 'Failed to create blog post', error: response.data });
    }
  } catch (error) {
    console.error('Error creating blog post:', error);
    // res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// createBlogPost();

const HUBSPOT_BLOG_AUTHORS_URL = 'https://api.hubapi.com/cms/v3/blogs/authors';

/////// Function to get the author ID by name //////
const getAuthorIdByName = async (authorName) => {
  try {
    const response = await axios.get(HUBSPOT_BLOG_AUTHORS_URL, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PRIVATE_APP_ACCESS}`
      }
    });

    const authors = response.data.results;
    const author = authors.find(a => a.fullName.toLowerCase() === authorName.toLowerCase());
    console.log('Author:', author);
    console.log('Author ID:', author ? author.id : null);
    return author ? author.id : null;
  } catch (error) {
    console.error('Error fetching author ID:', error);
    throw new Error('Could not fetch author ID');
  }
};

// getAuthorIdByName('Cyrus Group');