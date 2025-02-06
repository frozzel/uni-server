const  axios  = require('axios');
const {downloadFile} = require('../Utils/download.js');
const { VertexAI } = require('@google-cloud/vertexai');


exports.testApi2 = (req, res) => {
    res.send(`<body style="background: black; display: flex">
        <div style="width: 30%; height: auto"></div>
        <div style="display: flex-column; position: relative; top: 25%; width: 100%; height: 15%; box-shadow: 0 0 3px 2px #0fa; padding: 1em; border-radius: 8px;">
        <h1 style="text-align: center; color: white; text-shadow: 0 0 7px #0fa, 0 0 10px #0fa, 0 0 21px #0fa">👽   GEMINI TEST ROUTE   👽</h1> \n 
        </div><div style="width: 30%; height: auto"></div>
        </body>`);
};

const geminiImageCreate = async (req, res) => {
    
        // Initialize Google Vertex AI
    const vertexAI = new VertexAI({ api_key: process.env.GEMINI_API_KEY });
    const model = vertexAI.getGenerativeModel({ model: 'imagen-3.0-generate-002' });

    const geminiResponse = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: 'create an image of a cat made up of gummys' }] }] });
 
    console.log(geminiResponse.data);
    const imageUrl = geminiResponse.data.image_url;

    const downloadResponse = await downloadFile(imageUrl, 'cat.jpg');

    console.log(downloadResponse);

}

// geminiImageCreate();
