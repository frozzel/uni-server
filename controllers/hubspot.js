const axios = require('axios');

////////// Test API //////////
exports.testApi = (req, res) => {
    res.send('Hello, World!');
}

////////// HubSpot API //////////

exports.getInfo = async (req, res) => {

    const pets = 'https://api.hubapi.com/cms/v3/blogs/posts';
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