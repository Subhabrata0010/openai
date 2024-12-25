require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { createEmbeddings } = require('./embeddings');
const { queryDocuments } = require('./vectorStore');

const app = express();
app.use(bodyParser.json());

let vectorStore;  // To store vectors globally

// Load documents and create embeddings at startup
(async () => {
    vectorStore = await createEmbeddings('./data/westin_rulebook.txt');
    console.log("Embeddings created and Vector Store initialized!");
})();

// API Route for Question Answering
app.post('/api/ask', async (req, res) => {
    const { question } = req.body;
    if (!question) {
        return res.status(400).json({ error: "Question is required" });
    }
    
    try {
        const answer = await queryDocuments(vectorStore, question);
        res.json({ answer });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error processing request" });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
