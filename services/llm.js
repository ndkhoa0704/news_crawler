const { OpenAI } = require('openai');

function llmService() {
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
            const response = await self.client.responses.create({
                model: self.model,
                input: [
                    { role: "system", content: "You are a finance specialist." },
                    { role: "user", content: userMessage }
                ],
            });
            return response.output_text
        },
    }
}

module.exports = llmService();