const { OpenAI } = require('openai');

async function chatbotController() {
    const self = {
        client: null,
        model: 'gpt-4o',
    }
    return {
        init: () => {
            self.client = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY, // Ensure you set this environment variable
            });
        },
        getResponse: async (userMessage) => {
            const response = await client.responses.create({
                model: self.model,
                instructions: 'You are a finance specialist.',
                input: userMessage,
            });
            return response.output_text;
        },
        classifyArticle: async (article) => {

            const response = await client.responses.create({
                model: self.model,
                instructions: 'Classify the article into one of the following categories: finance, technology, health, or entertainment.',
                input: article.content,
            })
        }

    }
}

module.exports = { chatbotProtocol };