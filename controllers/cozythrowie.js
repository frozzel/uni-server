//////////// Cozy Throwie Controller ///////////////
const { model } = require('mongoose');
const Blog = require('../models/blog');


///////////// Importing Dependencies ///////////////
const { response } = require('express');
const OpenAI = require('openai');
const openai = new OpenAI(process.env.OPENAI_API_KEY);
const { zodResponseFormat } = require("openai/helpers/zod");
const { z } = require("zod");
const cloudinary = require('../config/cloudinary');

//////////////// testApi function ///////////////////////////
exports.testApi = (req, res) => {
    res.send(`<body style="background: black; display: flex">
        <div style="width: 30%; height: auto"></div>
        <div style="display: flex-column; position: relative; top: 25%; width: 100%; height: 15%; box-shadow: 0 0 3px 2px #0fa; padding: 1em; border-radius: 8px;">
        <h1 style="text-align: center; color: white; text-shadow: 0 0 7px #0fa, 0 0 10px #0fa, 0 0 21px #0fa">👽   Cozy Throwie Routes   👽</h1> \n 
        </div><div style="width: 30%; height: auto"></div>
        </body>`);
};

//////////////// Get Cozy Blogs function ///////////////////////////

exports.getCozyBlogs = async (req, res) => {
  // console.log('Getting Cozy Blogs');
  try {
      const blogs = await Blog.find().sort({ createdAt: -1 }).limit(10); // Fetch the last 10 posts
      // console.log('Blogs:', ...blogs);
      res.json({ message: blogs });
  } catch (error) {
      console.error('Error fetching blogs:', error);
      res.status(500).json({ error: 'Failed to fetch blogs' });
  }
};

exports.getSingleBlog = async (req, res) => {
  // console.log('Getting Single Blog');
  try {
      const blog = await Blog.findById(req.params._id);
      // console.log('Blog:', blog);
      res.json({ message: blog });
  } catch (error) {
      console.error('Error fetching blog:', error);
      res.json({ error: 'Failed to fetch blog' });
  }
};


// ////////////////////////////////////////////////////////////////////////////////////////
// /////////////////////////////// Structured Output Testing ///////////////////////////////
///////////////////////////// Create a Zod Schema for the Response ////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////

const socialMediaSchema = z.object({
  text: z.string()
});

const pinterestSchema = z.object({
  text: z.string(),
  photoDescription: z.string(),
  titleOverlay: z.string(),
  photoUrl: z.string().optional()  // Use optional if it can start as undefined before being generated
});

const productDescriptionSchema = z.object({
  description: z.string(),
  productKeywords: z.array(z.string()),
  productUrl: z.string().optional()
});

// Define the main blog Zod schema
const blogSchema = z.object({
  titleMain: z.string(),
  descriptionSummary: z.string(),
  featuredPhotoDescription: z.string(),
  featuredPhotoUrl: z.string().optional(),
  facebook: socialMediaSchema,
  instagram: socialMediaSchema,
  twitter: socialMediaSchema,
  pinterest: pinterestSchema,
  sections: z.array(
      z.object({
          title: z.string(),
          description: z.string(),
          productDescription: z.array(productDescriptionSchema)
      })
  ),
  tags: z.array(z.string())
});

const blogTopicSchema = z.object({
    topics: z.array(z.string())
});


// ////////////////////////////////////////////////////////////////////////////////////////
// /////////////////////////////// Structured Output Testing /////////////////////////////
//////////////////////////////////// Use Schema in Ai Call ///////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////


const createBlogWithImages = async (req, res) => {
  console.log('🚀 Creating Blog with Images 🚀');

  try {
      // Step 1: Fetch a random home decor trend topic
      const topicResponse = await openai.beta.chat.completions.parse({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a content creator for Cozy Throwie...",
            },
            { role: "user", content: "Provide 10 random trending topic for a home decor blog:" },
          ],
          response_format: zodResponseFormat(blogTopicSchema, "Topics"),

      });
    //   console.log('Topic Response:', topicResponse);
      const topics = topicResponse.choices[0].message.parsed;
      const randomTopics = topics.topics[Math.floor(Math.random() * topics.topics.length)];
      console.log('Random Topics:', randomTopics);
    //   console.log(`Selected Blog Topic: ${topics} `, topics.topics);

      const createBlogResponse = await openai.beta.chat.completions.parse({
          model: "gpt-4o",
          messages: [
              {
                  role: "system",
                  content: "You are a content creator for Cozy Throwie...",
              },
              { role: "user", content: `I would like to create a blog post about: ${randomTopics}` },
          ],
          response_format: zodResponseFormat(blogSchema, "Blog"),
      });

      const blog = createBlogResponse.choices[0].message.parsed;

      // Function to generate and upload images
      const generateAndUploadImage = async (description, size) => {
          // Generate image using DALL-E
          const prompt =  `${description}`;
          const imageResponse = await openai.images.generate({
              model: 'dall-e-3',
              prompt: prompt,
              n: 1,
              size: size,
            //   quality: 'hd'
          });

          const imageUrl = imageResponse.data[0].url;

          // Upload to Cloudinary
          const uploadResponse = await cloudinary.uploader.upload(imageUrl, { folder: 'blog_images' });

          return uploadResponse.secure_url;
      };

      // Generate and upload the featured photo
      blog.featuredPhotoUrl = await generateAndUploadImage(blog.featuredPhotoDescription, "1792x1024");

      // Generate and upload the Pinterest photo with the title overlay, formatted for Pinterest
      const pinterestImageSize = "1024x1792"; // Commonly recommended size for Pinterest
      blog.pinterest.photoUrl = await generateAndUploadImage(blog.pinterest.photoDescription, pinterestImageSize);

        // Ensure social media text is populated, else generate it
        const generateSocialMediaText = async (platform, goal, tags) => {
          const socialResponse = await openai.chat.completions.create({
              model: "gpt-4o",
              messages: [
                  {
                      role: "system",
                      content: `You are a content creator for Cozy Throwie, creating a ${platform} post...`,
                  },
                  { role: "user", content: `Create a ${platform} post to promote a blog titled '${blog.titleMain}' about new home decor trends. Make it engaging and include these hashtags: ${tags.join(', ')}. Total characters should meet ${platform} standards.` },
              ],
            });
          
          return socialResponse.choices[0].message.content;
      };

      const facebookTags = ["#HomeDecorTrends", "#CozyLiving", "#InteriorDesign"];
      const instagramTags = ["#DecorGoals", "#InstaHome", "#HomeSweetHome"];
      const twitterTags = ["#DecorTrends2025", "#CozyHome", "#Design"];

      if (!blog.facebook.text) {
          blog.facebook.text = await generateSocialMediaText("Facebook", "engagement", facebookTags);
      }
      if (!blog.instagram.text) {
          blog.instagram.text = await generateSocialMediaText("Instagram", "visual appeal", instagramTags);
      }
      if (!blog.twitter.text) {
          blog.twitter.text = await generateSocialMediaText("Twitter", "conciseness", twitterTags);
      }
      // Format product URLs
      blog.sections = blog.sections.map(section => {
          section.productDescription = section.productDescription.map(product => {
              const keywords = product.productKeywords.join('+');
              product.productUrl = `https://www.amazon.com/s?k=${keywords}`;
              return product;
          });
          return section;
      });

      // Save the blog
      const newBlog = new Blog(blog);
      await newBlog.save();


      console.log('✨ Blog Created with Images ✨', );
      // res.status(201).json({ message: "Blog successfully created!", blog });
  } catch (error) {
      console.error('Error creating blog:', error);
      // res.status(500).json({ error: 'Failed to create blog with images' });
  }
};

// createBlogWithImages()