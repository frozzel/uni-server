const axios = require('axios');
const cron = require('node-cron');
const fs = require('fs');
const { exec } = require('child_process');
const {downloadFile} = require('../Utils/download.js');


////////// Test API //////////
exports.testApi = (req, res) => {
    res.send('Hello, Cron!');
}

////////// Test Cron //////////

// cron.schedule('* * * * *', async () => {
//     console.log('running a task every minute');
//   });

////////// Cron API ////////// Depreciated


// cron.schedule('30 18 * * 1-5', async () => {
//   try {
//     console.log('Posting to LinkedIn  every weekday at 2:30 PM 18utc');
//     // Calculate the date 5 days ago
//     const fiveDaysAgo = new Date();
//     fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

//     // Format the date to YYYY-MM-DD
//     const formattedDate = fiveDaysAgo.toISOString().split('T')[0];

//       const recentBlogPost = `https://api.hubapi.com/cms/v3/blogs/posts?limit=10&createdAfter=${formattedDate}`;
//       const headers = {
//           Authorization: `Bearer ${process.env.PRIVATE_APP_ACCESS}`,
//           'Content-Type': 'application/json'
//       }
  
//       const getBlogPost = await axios.get(recentBlogPost, { headers });
//       const blogPostData = getBlogPost.data.results;  
//       const lastBlogPost = blogPostData.map((item) => {
//           return {
//               id: item.id,
//               authorName: item.authorName,
//               created: item.created,
//               currentState: item.currentState,
//               featuredImage: item.featuredImage,
//               htmlTitle: item.htmlTitle,
//               metaDescription: item.metaDescription,
//               postBody: item.postBody,
//               url: item.url
//               }
//               });
  
//       const lastObject = lastBlogPost[lastBlogPost.length - 1];
  
//       console.log("Last Blog Post Obtained", lastObject.htmlTitle, lastObject.metaDescription, lastObject.url, lastObject.featuredImage);
  
//       const { filePath } = await downloadFile(lastObject.featuredImage); // Download the image and get the file path

//       const resp = await axios.post(
//         `https://api.linkedin.com/rest/images?action=initializeUpload`,
//         {
//           "initializeUploadRequest": {
//                 "owner": `urn:li:organization:${process.env.LINKEDIN_ORG_ID}`
//           }
//         },
//         {
//           headers: {
//             'LinkedIn-Version': '202402',
//             'X-Restli-Protocol-Version': '2.0.0',
//             'Authorization': `Bearer ${process.env.LINKEDIN_TOKEN}`,
//             'Content-Type': 'application/json'
//           }
//         }
//         );

//         const url = resp.data.value.uploadUrl;
//         console.log('URL', url);
//         const imageUrn = resp.data.value.image;
//         console.log('Image URN', imageUrn);

//         // const imageData = fs.readFileSync(filePath);

//         // Initialize the curl command
//         const curlCommand = `curl -i --upload-file ${filePath} -H 'Authorization: Bearer ${process.env.LINKEDIN_TOKEN}' "${url}"`;

//         console.log('CURL COMMAND', curlCommand);

//         // Execute the curl command
//         exec(curlCommand, (error, stdout, stderr) => {
//             if (error) {
//                 console.error(`Error executing curl command: ${error.message}`);
//                 return;
//             }
//             if (stderr) {
//                 console.error(`stderr: ${stderr}`);
//                 console.log('Error uploading image to LinkedIn');
//                 console.log('stdout', stdout);
//                 postNow()
//                 return;
//             }
//             console.log(`stdout: ${stdout}`);

//             // Now you can proceed with your postNow function or any other logic
//             postNow();
//         });

//       const apiKey = process.env.OPENAI_API_KEY;
//       const chatGPTApiUrl = 'https://api.openai.com/v1/chat/completions';
    
//       const userMessage = `Compose a LinkedIn blog post with the title '${lastObject.htmlTitle}' discussing '${lastObject.metaDescription}'. Please include relevant hashtags in the post. Provide only the content of the post as the response.`;

//   const postNow = async () => {
//         const chatGPTResponse = await axios.post(
//             chatGPTApiUrl,
//             {
//               model: 'gpt-4o',
//               messages: [
//                 { role: 'system', content: 'You are a helpful assistant.' },
//                 { role: 'user', content: userMessage },
//               ],
//             },
//             {
//               headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${apiKey}`,
//               },
//             }
//           );

//         const reply = chatGPTResponse.data.choices[0].message.content;
//         console.log("CHATGPT", reply);


//         console.log('Posting to LinkedIn........');


//         const response = await axios.post(
//           `https://api.linkedin.com/rest/posts`, 
//           {
//             "author": `urn:li:organization:${process.env.LINKEDIN_ORG_ID}`,
//             "commentary": reply,    
//             "visibility": "PUBLIC",
//             "distribution": {
//               "feedDistribution": "MAIN_FEED",
//               "targetEntities": [],
//               "thirdPartyDistributionChannels": []
//             }, 
//             "content": {
//                 "article": {
//                     "source": lastObject.url,
//                     "thumbnail": imageUrn,
//                     "title": lastObject.htmlTitle,
//                     "description": lastObject.metaDescription,
//                 }
//             },
//             "lifecycleState": "PUBLISHED",
//             "isReshareDisabledByAuthor": false
           
//           },
//           {
//             headers: {
//               'LinkedIn-Version': '202402',
//               'X-Restli-Protocol-Version': '2.0.0',
//               'Authorization': `Bearer ${process.env.LINKEDIN_TOKEN}`,
//               'Content-Type': 'application/json'
//             }
//           },

//         );
//         if (response.status === 201 || response.status === 200) {
//           console.log('Post ', response.statusText);
//         } else {
//           console.log('Error: ', response.statusText);
//         }
        
//   }

//   console.log('Post to LinkedIn Completed');
// } catch (error) {
//   console.error('Error posting to LinkedIn:');
//   // res.status(500).json({ error: error.response.data });  
// }


// }, null, true, 'America/New_York');
