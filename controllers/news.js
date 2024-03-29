const axios = require('axios');


////////// Test API //////////

exports.testApi = (req, res) => {
    console.log('Hello, News!');
    res.send('Hello, News!');
}

////////// News API //////////

exports.getNews = async (req, res) => {
    try {
        console.log('Getting News..........')
        const news = await axios.get(`https://newsapi.org/v2/everything?pageSize=10&language=en&domains=wired.com,techcrunch.com,theverge.com,thenextweb.com&apiKey=${process.env.NEWS_API_KEY}`);
        console.log("News Articles", news.data.articles.length);

        const articles = news.data.articles.map((article) => {
            return {
                source: article.source.name,
                title: article.title,
                description: article.description,
                url: article.url,
                image: article.urlToImage,

            }
        }
        )
        

        res.json(articles);
    } 
    catch (error) {
        console.error(error.message);
        res.json({error: error.message});
    }
};
