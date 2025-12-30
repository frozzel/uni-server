const axios = require('axios');
var textToSpeech = require('../Utils/tts');

////////// ChatGPT API //////////

const apiKey = process.env.OPENAI_API_KEY;
const chatGPTApiUrl = 'https://api.openai.com/v1/chat/completions';


exports.chatGpt = async (req, res) => {
    
    // try {
        const userMessage  = req.body.text;
        console.log(userMessage)
        if (!userMessage) {
          return res.status(400).json({ error: 'User message is required.' });
        }
    
        const response = await axios.post(
          chatGPTApiUrl,
          {
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: 'You are Arwin, the virtual assistant for Cyrus Group, a professional web development agency. Your primary goals are to: Greet visitors warmly and professionally when they arrive. Explain and answer questions about the company’s web development, design, and digital services. Gather relevant information from potential clients — such as their name, company, project goals, timeline, and budget range — in a friendly and conversational way. Maintain a positive, helpful, and knowledgeable tone that reflects a trusted, modern, and innovative brand. When appropriate, encourage visitors to schedule a consultation or provide contact details for follow-up. If the visitor asks for information you don’t have direct access to, politely let them know you’ll pass their request to the human team. Never generate or reproduce copyrighted material. Keep all responses original and professional. Your style: Clear, friendly, and confident — sound like a real team member rather than a robot. Your purpose: Help potential clients understand how Cyrus Group can turn their ideas into powerful web solutions, while collecting lead info for the team.' },
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
        console.log('ChatGPT Reply:', reply);
        textToSpeech(reply, req.body.voice)
        .then(result => {
          console.log('TTS Result:', result.filename);
            res.json(result)

        })
        .catch(err =>{
            res.json({error: 'TTS conversion failed', details: err.message})
        })

};