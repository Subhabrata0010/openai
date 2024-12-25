const { CohereEmbeddings, CohereRerank } = require("@langchain/cohere");
const { RetrievalQAChain } = require("langchain/chains");
const { ChatCohere } = require("@langchain/cohere");

async function queryDocuments(vectorStore, question) {
    const model = new ChatCohere({
        model: "command",
        temperature: 0.3,
        apiKey: process.env.COHERE_API_KEY,
    });

    // Use Reranker to Improve Retrieval
    const reranker = new CohereRerank({
        model: "rerank-english-v3.0",  // Best reranking model
        apiKey: process.env.COHERE_API_KEY,
    });

    const retriever = vectorStore.asRetriever();
    retriever.reranker = reranker;

    const chain = RetrievalQAChain.fromLLM(model, retriever);

    const result = await chain.call({ query: question });
    return result.text;
}

module.exports = { queryDocuments };

