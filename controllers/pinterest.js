const axios = require('axios');
const ApiKey = require('../models/pinterest.js');
const cron = require('node-cron');

///////////////////////////////////////// test route /////////////////////////////////
exports.testApi = (req, res) => {
    res.send('Hello, Pinterest!');
}

/////////////////////////// Pinterest API Key Generator ///////////////////////////
const clientCredentialsController = async (req, res) => {
    console.log('🚀 init Pinterest API Key Gen 🚀');
      try {
        const authString = Buffer.from(`${process.env.PINTEREST_APP_ID}:${process.env.PINTEREST_APP_SECRET}`).toString('base64');
        const response = await axios.post('https://api.pinterest.com/v5/oauth/token', 'grant_type=client_credentials&scope=boards:read,boards:write,pins:read,pins:write', {
          headers: {
            'Authorization': `Basic ${authString}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });
        const deleteKeys = await ApiKey.deleteMany({});

        console.log( `🔑🔑🔑 Deleted Old Pinterest API Keys, Number Deleted: ${deleteKeys.deletedCount} key 🔑🔑🔑`);

        const apiKey = new ApiKey({
          access_token: response.data.access_token,
          response_type: response.data.response_type,
          token_type: response.data.token_type,
          expires_in: response.data.expires_in,
          scope: response.data.scope,
        });
        await apiKey.save();
        console.log("🎯 Pinterest API Key Generated 🔑");
      } catch (error) {
        console.log("⚠️⚠️⚠️ Error Pinterest API Key Gen ⚠️⚠️⚠️", error.response.data);
      }
    };
// clientCredentialsController();

// Schedule a job to run at midnight on the 15th of every month
cron.schedule('0 0 15 * *', () => {
    console.log('🔑🔑 Running Pinterest API KEY GENERATOR on the 15th of the month 🔑🔑');
    clientCredentialsController();
}, null, true, 'America/New_York');
