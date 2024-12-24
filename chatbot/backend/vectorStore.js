class MemoryVectorStore {
    constructor(chunks) {
      this.vectors = chunks.map((chunk, index) => ({
        id: index,
        content: chunk,
        embedding: this.embed(chunk),  // Basic embedding
      }));
    }
  
    embed(text) {
      return text.split(' ').map((word) => word.length);  // Simple word-length-based embedding
    }
  
    retrieveRelevantChunks(query) {
      const queryEmbedding = this.embed(query);
      const scores = this.vectors.map((doc) => ({
        score: cosineSimilarity(doc.embedding, queryEmbedding),
        content: doc.content,
      }));
      const sorted = scores.sort((a, b) => b.score - a.score);
      return sorted.slice(0, 3).map((item) => item.content).join('\n\n');
    }
  }
  
  function splitText(text) {
    return text.match(/(.{1,1000})(\s|$)/g);  // Split by 1000 characters
  }
  
  // Simple cosine similarity
  function cosineSimilarity(a, b) {
    const dotProduct = a.reduce((acc, val, i) => acc + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((acc, val) => acc + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((acc, val) => acc + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
  
  module.exports = { MemoryVectorStore, splitText };
  