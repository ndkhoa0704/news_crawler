import OpenAI from "openai";
const openai = new OpenAI();

function Embedder() {
    const self = {
        model: "text-embedding-3-small",
    }
    return {
        embed: async (text) => {
            const embedding = await openai.embeddings.create({
                model: self.model,
                input: text,
                encoding_format: "float",
            });
            return embedding.data[0].embedding;
        }
    }
}


module.exports = Embedder();