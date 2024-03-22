const axios = require('axios');
const fs = require('fs');
const OpenAI = require('openai');
const {downloadFile} = require('../Utils/download.js');



////////// Test API //////////
exports.testApi = (req, res) => {
    res.send('Hello, World!');
}

////////// ChatGPT API //////////

const apiKey = process.env.OPENAI_API_KEY;
const chatGPTApiUrl = 'https://api.openai.com/v1/chat/completions';

exports.chatGPT = async (req, res) => {
    
    try {
        const { userMessage } = req.body;
        console.log(req.body)
        if (!userMessage) {
          return res.status(400).json({ error: 'User message is required.' });
        }
    
        const response = await axios.post(
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
          
        const reply = response.data.choices[0].message.content;
    
        return res.json({ reply });
      } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error', error });
      }
};


exports.dallE = async (req, res) => {

    const openai = new OpenAI({ apiKey: apiKey });

    const promptText = "A happy little house with a garden";
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: 'Create an engaging image depicting a small business owner excitedly managing their website  Make sure the image highlights the advantages of marketing automation for small businesses and encourages viewers to seek more information by visiting our blog.',
      n: 1,
      size: "1024x1024",
    });
    image_url = response.data[0].url;
    console.log(response)
    

    // Save the image to a file
    const {filePath} = await downloadFile(image_url, 'dallE');
    console.log('Image generated successfully!');
    res.json({ image_url, filePath });
}

