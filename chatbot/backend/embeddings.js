const { CohereEmbeddings } = require("@langchain/cohere");
const { Document } = require("@langchain/core/documents");
const fs = require('fs').promises;
const { MemoryVectorStore } = require("langchain/vectorstores/memory");

async function createEmbeddings(filePath) {
    const embeddings = new CohereEmbeddings({
        model: "embed-english-v3.0",
        apiKey: process.env.COHERE_API_KEY,
    });

    const content = await fs.readFile(filePath, 'utf-8');

    // Better Chunking with Overlap
    const CHUNK_SIZE = 400;
    const OVERLAP = 100;

    const chunks = [];
    for (let i = 0; i < content.length; i += CHUNK_SIZE - OVERLAP) {
        chunks.push(content.slice(i, i + CHUNK_SIZE));
    }

    const docs = chunks.map(chunk => new Document({ pageContent: chunk }));

    return await MemoryVectorStore.fromDocuments(docs, embeddings);
}

module.exports = { createEmbeddings };
