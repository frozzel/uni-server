

////////// Test API //////////
exports.testApi = (req, res) => {
    res.send('Hello, World!');
}

////////// ChatGPT API //////////
exports.chatGPT = async (req, res) => {
    //console.log(req.body)
    const prompt = req.body.prompt
    const length = req.body.length
    const temperature = req.body.temperature
    const top_p = req.body.top_p
    const frequency_penalty = req.body.frequency_penalty
    const presence_penalty = req.body.presence_penalty
    const stop = req.body.stop
    const model = req.body.model
    const token = req.body.token
    const chatbot = new OpenAI(token);
    const gptResponse = await chatbot.complete({
        prompt: prompt,
        maxTokens: length,
        temperature: temperature,
        topP: top_p,
        frequencyPenalty: frequency_penalty,
        presencePenalty: presence_penalty,
        stop: stop,
        model: model,
    });
    res.json(gptResponse.data);
}
