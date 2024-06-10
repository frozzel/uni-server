const axios = require('axios');
const fs = require('fs');
const { exec } = require('child_process');
const {downloadFile} = require('../Utils/download.js');
const OpenAI = require('openai');
const { createReadStream } = require('fs');
const path = require('path');
const FormData = require('form-data');
const slugify = require('slugify')
const cron = require('node-cron');

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

const webDevTopics = [
  "Top Web Development Trends in 2024",
  "How to Choose the Right Web Development Framework for Your Project",
  "Essential Skills Every Web Developer Should Have in 2024",
  "The Importance of Responsive Design in 2024",
  "A Beginner's Guide to Progressive Web Apps (PWAs)",
  "How to Optimize Your Website for Speed and Performance",
  "The Role of Artificial Intelligence in Modern Web Development",
  "Best Practices for Ensuring Website Security",
  "Case Study: Transforming a Client’s Website with Modern Web Technologies",
  "Understanding the Basics of SEO for Web Developers",
  "The Future of E-Commerce Websites: What to Expect in the Next 5 Years",
  "How to Create Accessible Websites for All Users",
  "Integrating Third-Party APIs: Benefits and Challenges",
  "The Impact of 5G on Web Development",
  "Building a Scalable Web Application: Key Considerations",
  "Top 10 Tools for Efficient Web Development in 2024",
  "How to Conduct a Website Audit: A Step-by-Step Guide",
  "Why Content Management Systems (CMS) are Essential for Modern Websites",
  "Creating Engaging User Experiences: Tips and Tricks",
  "The Benefits of Using Serverless Architecture in Web Development"
];

const stripeTopics = [
  "Understanding Payment Gateways: Stripe vs. PayPal",
  "How to Integrate Stripe with Shopify: A Step-by-Step Guide",
  "Top 5 Payment Processing Solutions for E-Commerce Businesses",
  "The Future of Payment Processing: Trends to Watch in 2024",
  "How to Optimize Your Checkout Process for Higher Conversions",
  "Security Best Practices for Payment Processing in E-Commerce",
  "Stripe's New Features: What They Mean for Your E-Commerce Business",
  "Integrating Multiple Payment Gateways: Benefits and Challenges",
  "How to Set Up Recurring Payments with Stripe",
  "Maximizing Sales with Shopify’s Built-In Payment Processing Tools",
  "Case Study: Successful E-Commerce Integrations with Stripe",
  "The Role of Mobile Payments in E-Commerce: Adapting to a Mobile-First World",
  "Shopify and Stripe: Enhancing the Customer Experience",
  "Building a Scalable Payment Infrastructure for Your Online Store",
  "Understanding and Reducing Payment Processing Fees",
  "The Importance of Multi-Currency Support in E-Commerce",
  "Top Plugins for Enhancing Payment Processing on Shopify",
  "Customer Trust and Payment Processing: Building Confidence at Checkout",
  "How to Handle Payment Disputes and Chargebacks Effectively",
  "Setting Up International Payment Processing with Stripe"
];

const seoTopics = [

    "Top 10 SEO Trends for 2024: Stay Ahead of the Curve",
    "How to Perform a Comprehensive SEO Audit: Step-by-Step Guide",
    "The Ultimate Guide to On-Page SEO: Best Practices and Techniques",
    "Understanding Off-Page SEO: Strategies to Boost Your Website's Authority",
    "SEO for Beginners: A Complete Guide to Getting Started",
    "Local SEO Strategies: How to Optimize Your Website for Local Search",
    "The Role of Content in SEO: How to Create SEO-Friendly Content",
    "Technical SEO: The Importance of Site Speed, Mobile-Friendliness, and More",
    "Voice Search Optimization: Preparing Your Website for the Future",
    "How to Use Schema Markup for Better SEO",
    "Google Analytics 4: What's New and How to Use It",
    "Understanding Key Metrics in Google Analytics: A Beginner's Guide",
    "How to Set Up Goals and Conversions in Google Analytics",
    "Advanced Google Analytics: Custom Reports, Segments, and Dashboards",
    "Google Analytics for E-commerce: Tracking and Optimizing Sales",
    "How to Use Google Analytics to Improve Your Website's User Experience",
    "Demystifying Google Analytics: Common Misconceptions and How to Avoid Them",
    "Tracking Multi-Channel Funnels in Google Analytics",
    "Using Google Analytics to Track and Improve Your SEO Performance",
    "How to Integrate Google Analytics with Google Ads for Better Campaign Insights",

   
    "Google Ads 101: A Beginner's Guide to PPC Advertising",
    "How to Create Effective Google Ads Campaigns: Best Practices",
    "Understanding Google Ads Quality Score: How to Improve Your Ads",
    "The Importance of Keyword Research in Google Ads",
    "Remarketing with Google Ads: Strategies to Re-Engage Visitors",
    "A/B Testing in Google Ads: How to Optimize Your Ad Performance",
    "Budgeting for Google Ads: How to Maximize Your ROI",
    "The Role of Ad Extensions in Google Ads: Types and Benefits",
    "How to Use Google Ads Keyword Planner for Better Campaigns",
    "Common Google Ads Mistakes and How to Avoid Them"
];

const aiTopics = [
  "How ChatGPT Bots are Revolutionizing Customer Service",
  "HubSpot AI: Transforming Your Marketing Automation",
  "The Future of Content Creation: AI-Powered Tools and Techniques",
  "Boosting Ad Campaigns with AI-Powered Google Ads",
  "Integrating ChatGPT with Your Website: A Step-by-Step Guide",
  "Case Studies: Businesses Thriving with AI Integrations",
  "The Role of AI in Personalizing Customer Experiences",
  "Top AI Tools for Web Developers in 2024",
  "How to Use AI for Effective Lead Generation and Management",
  "Improving SEO with AI: Techniques and Tools",
  "The Ethical Implications of AI in Web Development",
  "AI-Powered Analytics: Making Data-Driven Decisions",
  "The Intersection of AI and UX Design: What You Need to Know",
  "Automating Routine Tasks with AI: Increasing Efficiency in Web Development",
  "Building Smarter Websites: The Role of AI in Web Development",
  "ChatGPT vs. Traditional Chatbots: Which is Better for Your Business?",
  "Leveraging AI for E-commerce: Enhancing Customer Journeys",
  "AI in Social Media Management: Tools and Strategies",
  "AI and Web Security: Protecting Your Website from Cyber Threats",
  "Training Your Team to Work with AI Technologies"
];

const marketingTopics = [
  "How to Integrate Popular CRMs with Your Website for Seamless Marketing",
  "Maximizing Your Marketing Efforts with Google Analytics Integration",
  "Streamline Your Marketing with SMS Integration: A Comprehensive Guide",
  "The Ultimate Guide to Email Marketing Integration for Your Business",
  "Automated Content Creation with AI: Tools and Techniques",
  "Boost Your Marketing ROI with CRM and Google Analytics Integration",
  "Top 5 Benefits of Integrating Your CRM with Email Marketing",
  "How to Use AI for Personalized Email Marketing Campaigns",
  "Effective Strategies for SMS Marketing Automation",
  "Integrating AI Chatbots with Your CRM for Enhanced Customer Engagement",
  "Leveraging Google Analytics for Advanced Marketing Insights",
  "Automated Content Creation: How AI Can Revolutionize Your Marketing Strategy",
  "From Lead to Loyalty: Integrating CRM with Email and SMS for Comprehensive Customer Journeys",
  "Best Practices for Integrating AI with Your Marketing Stack",
  "How to Track and Optimize Your Marketing Campaigns with CRM and Google Analytics",
  "The Future of Automated Content Creation: Trends and Predictions",
  "Case Studies: Successful Marketing Integrations with Popular CRMs",
  "AI in Marketing: A Deep Dive into Automated Content and Campaign Management",
  "Enhancing Customer Experience with CRM and AI Integration",
  "Step-by-Step Guide to Setting Up Automated Email Marketing Campaigns"
]

const crmTopics = [
  "The Ultimate Guide to Salesforce Integration: Best Practices and Tips",
  "Unlocking the Power of HubSpot CRM: Integration Strategies for Success",
  "Maximizing Marketing Efficiency: How to Integrate Mailchimp with Your CRM",
  "Streamlining Sales Processes: Benefits of Brevo CRM Integration",
  "Top 5 Challenges of CRM Integration and How to Overcome Them",
  "Choosing the Right CRM Integration: Factors to Consider",
  "Case Study: Successful Salesforce Integration for [Client Name]",
  "How to Build Custom CRM Integrations Tailored to Your Business Needs",
  "The Future of CRM Integration: Trends and Predictions",
  "Improving Customer Relationships Through Seamless CRM Integration",
  "Boosting Productivity with Automated Workflows: A Guide to CRM Integration",
  "Avoiding Common Pitfalls in CRM Integration Projects",
  "Measuring Success: Key Metrics for Evaluating CRM Integration Performance",
  "Integrating CRM with E-commerce Platforms: Opportunities and Challenges",
  "Enhancing Customer Experience with Personalized CRM Integrations"
];
createBlogPost = async (req, res) => {

  console.log("🤖🤖🤖🤖🤖 Creating Blog Post HubSpot 🤖🤖🤖🤖🤖🤖🤖");
  ///// Global Variables ////////

  const chatGPTApiUrl = 'https://api.openai.com/v1/chat/completions';
  const openai = new OpenAI({ apiKey: apiKey });

    // Get the current date
  const currentDate = new Date();

  // Array to map the numeric day of the week to the name of the day
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // Get the numeric day of the week (0 for Sunday, 1 for Monday, etc.)
  const dayOfWeek = currentDate.getDay();

  // Get the name of the day from the daysOfWeek array
  const dayName = daysOfWeek[dayOfWeek];


  /////// Get Blog Topic Randomly ///////

  let topic = [];
  let tagIds = [];

  if (dayName === "Monday") {
     topic.push(stripeTopics);
     tagIds.push(159421975454);
  } else if (dayName === "Tuesday") {
     topic.push(seoTopics);
     tagIds.push(160263059017);
  } else if (dayName === "Wednesday") {
      topic.push(aiTopics)
      tagIds.push(158146563347);
  } else if (dayName === "Thursday") {
      topic.push(marketingTopics)
      tagIds.push(158429568113);
  } else if (dayName === "Friday") {
      topic.push(crmTopics);
      tagIds.push(160425892926);
  } else if (dayName === "Saturday") {
      topic.push(webDevTopics);
      tagIds.push(165135476399);
  } else if (dayName === "Sunday") {
      topic.push(aiTopics);
      tagIds.push(158146563347);
  }


  // const topic = ["Web Development", "AI integrations like chatGpt bots, HubSpot AI, AI content creation, AI powered google ads", "E-commerce integration like Shopify or Payment Processing like Stripe", "SEO optimization, google analytics, and google ads", "marketing integrations with popular CRMs, google analytics, sms, and email marketing, and automated content creation with ai", "CRM integrations like salesforce, HubSpot, MailChimp, Brevo"]
  const randomTopic = topic[Math.floor(Math.random() * topic.length)];

  console.log("Random Topic:",randomTopic);

   /////// Assign Tag Ids based on Topic //////
   

  //  if (randomTopic === "Web Development") {
  //      tagIds.push(165135476399);
  //  } else if (randomTopic === "AI integrations like chatGpt bots, HubSpot AI, AI content creation, AI powered google ads") {
  //      tagIds.push(158146563347);
  //  } else if (randomTopic === "E-commerce integration like Shopify or Payment Processing like Stripe") {
  //      tagIds.push(159421975454);
  //  } else if (randomTopic === "SEO optimization, google analytics, and google ads") {
  //      tagIds.push(160263059017);
  //  } else if (randomTopic === "marketing integrations with popular CRMs, google analytics, sms, and email marketing, and automated content creation with ai") {
  //      tagIds.push(158429568113);
  //  } else if (randomTopic === "CRM integrations like salesforce, HubSpot, MailChimp, Brevo") {
  //      tagIds.push(160425892926);
  //  }
   
   // Example usage:
   console.log( "Tag Ids:", tagIds); // Output will depend on the value of randomTopic


      /////// Get Blog Title from ChatGPT //////

  const getBlogTitle = await axios.post(chatGPTApiUrl, {
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: `Create a blog title for my web development company that focuses on one of these'${randomTopic}', respond with just text no quotes and only on one topic` },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }

      );
      
      console.log("Blog Title Response:", getBlogTitle.data.choices[0].message);
      const blogTitle = getBlogTitle.data.choices[0].message.content;

      console.log("Blog Title:", blogTitle);

      /////// Create Blog Image from Dalle-3 //////

      const dalleQuestion = `Create a dalle 3 prompt to create an image for this blog topic: ${blogTitle}. Don't add text to the image in any way`;

      const getDallePrompt = await axios.post(chatGPTApiUrl, {
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: dalleQuestion },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }

      );

      const dallePrompt = getDallePrompt.data.choices[0].message.content;

      console.log("Featured Image:", dallePrompt);

      ////// Get image from Dalle-3 //////

      const getImage = await openai.images.generate({
        model: "dall-e-3",
        prompt: dallePrompt,
        n: 1,
        size: "1792x1024",
      });

      const image_url = getImage.data[0].url;

      console.log("Featured Image URL:", image_url);

      ////// upload image to HubSpot //////

      const {filePath} = await downloadFile(image_url, 'dallE');
      console.log('Image generated successfully!');
      console.log("Image URL", image_url);
  
   
      const formData = new FormData();
      formData.append('file', createReadStream(filePath), path.basename(filePath));
      formData.append('folderPath', '/images'); // Set the folderPath as per HubSpot example
      formData.append('options',`{"access":"PUBLIC_INDEXABLE"}`); // Set the access field to PUBLIC_INDEXABLE directly in the form data

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

        const uploadImageHubspot = await axios.request(config);

        const featuredImage = uploadImageHubspot.data.objects[0].url;


      console.log('Image uploaded to HubSpot:', featuredImage);




      /////// Create Slug from Blog Title //////

      const slug = slugify(blogTitle);

      console.log("Slug:", slug);

      /////// Get Blog Description from ChatGPT //////

      const getBlogDescription = await axios.post(chatGPTApiUrl, {
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: `Create a blog body for my web development company 'Cyrus Group Innovations' that focuses on this title:'${blogTitle}', respond with just text no quotes or # or * and use html formatting, do not use h1 or h2 tags. Do not include the title As I will provide it` },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }

      );

      postBody = getBlogDescription.data.choices[0].message.content;

      console.log("Blog Description:", postBody);

      /////// Create Meta Description //////

      const getMetaDescription = await axios.post(chatGPTApiUrl, {
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: `Create a meta description for my web development company that focuses on this article:'${blogTitle}', respond with just text no quotes or # or *` },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      });


      const metaDescription = getMetaDescription.data.choices[0].message.content;

      console.log("Meta Description:", metaDescription);

  try {
    

    const blogPostData = {
      publishDate: new Date().toISOString(),

      name: blogTitle,
      postBody: postBody,
      slug: slug,
      publishImmediately: true,
      tagIds: tagIds,
      blogAuthorId: 158140284837,
      state: 'PUBLISHED', // or 'draft' if you don't want to publish it immediately
      metaTitle: blogTitle,
      metaDescription: metaDescription,
      featuredImage: featuredImage,
      contentGroupId: 158129258575,
      publishImmediately: true,
      createdById: "63468404",
      language: "en",
      htmlTitle: blogTitle,
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
    const response = await axios.post('https://api.hubapi.com/cms/v3/blogs/posts', blogPostData, {
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

createBlogPost();

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



/////// Cron Scheduler For HubSpot Blog Post //////

cron.schedule('0 7 * * *', async () => {
  console.log('Running cron job to create a HubSpot blog post... 3AM EST, 7AM UTC');
  createBlogPost();
}, null, true, 'America/New_York');

