const axios = require('axios');

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


