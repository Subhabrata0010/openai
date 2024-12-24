import express from "express";
import fs from "fs";
import { CohereEmbeddings } from "@langchain/cohere";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { RunnableSequence, RunnablePassthrough } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import dotenv from "dotenv";
dotenv.config();


const app = express();
const port = 5000;

// Read and prepare rulebook data
const rulebookData = JSON.parse(fs.readFileSync("rulebook.json", "utf8"));
let vectorStore = null;

// Split documents for vector storage
async function initializeVectorStore() {
    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
    const docs = await splitter.createDocuments(
        rulebookData.map((section) => `${section.title}\n\n${section.content}`)
    );

    // Initialize Cohere embeddings
    vectorStore = await MemoryVectorStore.fromDocuments(docs, new CohereEmbeddings({
        model: "embed-english-v3.0",
        apiKey: process.env.COHERE_API_KEY  // Replace with your actual key
    }));
    console.log("Vector Store Initialized");
}

// Run the initialization when server starts
initializeVectorStore();

// Express route for querying the rulebook
app.post("/api/ask", async (req, res) => {
    const { question } = req.body;
    if (!question) return res.status(400).send({ error: "Question is required" });

    try {
        const retriever = vectorStore.asRetriever();
        const SYSTEM_TEMPLATE = `Use the context below to answer the question:\n{context}`;
        
        const prompt = ChatPromptTemplate.fromMessages([
            ["system", SYSTEM_TEMPLATE],
            ["human", "{question}"]
        ]);

        const model = new RunnableSequence([
            {
                context: retriever.pipe((docs) => docs.map(doc => doc.pageContent).join("\n\n")),
                question: new RunnablePassthrough()
            },
            prompt,
            new StringOutputParser()
        ]);

        const answer = await model.invoke(question);
        res.json({ answer });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send({ error: "Failed to process request" });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
