import React, { useState } from "react";
import axios from "axios";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question) return;

    try {
      const res = await axios.post("/api/ask", { question });
      setAnswer(res.data.answer);
    } catch (err) {
      console.error(err);
      setAnswer("Error getting answer. Try again.");
    }
  };

  return (
    <div className="container mx-auto p-10 bg-slate-800">
      <h1 className="text-3xl font-bold mb-4 text-cyan-200">AI Q&A App</h1>
      
      <form onSubmit={handleSubmit}>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question..."
          className="w-full p-2 border rounded-md"
        ></textarea>
        
        <button
          type="submit"
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Ask
        </button>
      </form>

      {answer && (
        <div className="mt-6 bg-gray-100 p-4 border rounded-md">
          <h2 className="font-semibold">Answer:</h2>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}

export default App;
