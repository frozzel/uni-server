const axios = require('axios');


////////// Test API //////////

exports.testApi = (req, res) => {
    console.log('Hello, News!');
    res.send('Hello, News!');
}

////////// News API //////////

exports.getNews = async (req, res) => {
    try {

        const {category} = req.body;
        console.log('Category', category);
        console.log('Getting News..........')
        const news = await axios.get(`https://newsapi.org/v2/everything?q=SEO&domains=techcrunch.com,thenextweb.com,theverge.com,wired.com&apiKey=${process.env.NEWS_API_KEY}`);
        console.log("News Articles", news.data.articles.length);
        res.json(news.data.articles);
    } 
    catch (error) {
        console.error(error.message);
        res.json({error: error.message});
    }
};
