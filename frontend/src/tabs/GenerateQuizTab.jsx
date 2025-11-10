import React, { useState } from "react";
import { generateQuiz } from "../services/api";
import QuizDisplay from "../components/QuizDisplay";

export default function GenerateQuizTab() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  function validUrl(u) {
    try {
      new URL(u);
      return true;
    } catch {
      return false;
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!url || !validUrl(url)) {
      setError("Please enter a valid URL");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const json = await generateQuiz(url);
      console.log("generate_quiz response:", json);
      // Normalize response: the backend may return the quiz directly or wrap it in full_quiz_data
      let quizData = json;
      try {
        if (json && typeof json === "object" && json.full_quiz_data)
          quizData = json.full_quiz_data;
        else if (typeof json === "string") quizData = JSON.parse(json);
      } catch (e) {
        console.warn("Could not normalize quiz response", e);
      }
      setResult(quizData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="bg-white p-4 rounded shadow mb-6">
        <label className="block text-sm font-medium mb-2">Wikipedia URL</label>
        <div className="flex">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://en.wikipedia.org/wiki/Artificial_intelligence"
            className="flex-1 border rounded px-3 py-2 mr-2"
          />
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            disabled={loading}
          >
            Generate
          </button>
        </div>
        {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
      </form>

      {loading && (
        <div className="text-sm text-gray-600">
          Generating quiz... this may take a moment.
        </div>
      )}

      {result && (
        <div className="mt-4">
          <QuizDisplay data={result} />
        </div>
      )}
    </div>
  );
}
