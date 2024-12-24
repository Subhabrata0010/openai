const express = require('express');
const axios = require('axios');
const cohere = require('cohere-ai');
const fs = require('fs');
require('dotenv').config();
const { MemoryVectorStore, splitText } = require('./vectorStore');

const app = express();
const port = 3000;

app.use(express.json());
cohere.init(process.env.COHERE_API_KEY);

// Load and split the rulebook on server start
const rulebookText = fs.readFileSync('./westin_rulebook.txt', 'utf8');
let vectorStore = null;

(async () => {
  const chunks = splitText(rulebookText);
  vectorStore = new MemoryVectorStore(chunks);
  console.log('Vector store initialized with Westin Rulebook.');
})();

// API Route to Query the Rulebook
app.post('/api/ask', async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  try {
    const context = vectorStore.retrieveRelevantChunks(question);
    const response = await cohere.generate({
      model: 'command',
      prompt: `${context}\nQuestion: ${question}`,
      max_tokens: 200,
    });

    res.json({ answer: response.body.generations[0].text });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch response from Cohere' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
