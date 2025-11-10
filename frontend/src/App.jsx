import React, { useState } from "react";
import GenerateQuizTab from "./tabs/GenerateQuizTab";
import HistoryTab from "./tabs/HistoryTab";

export default function App() {
  const [activeTab, setActiveTab] = useState("generate");

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold">AI Wiki Quiz Generator</h1>
        </div>
      </header>
      <main className="max-w-4xl mx-auto py-8 px-4">
        <nav className="mb-6">
          <button
            className={`mr-2 px-4 py-2 rounded ${
              activeTab === "generate"
                ? "bg-blue-600 text-white"
                : "bg-white border"
            }`}
            onClick={() => setActiveTab("generate")}
          >
            Generate Quiz
          </button>
          <button
            className={`px-4 py-2 rounded ${
              activeTab === "history"
                ? "bg-blue-600 text-white"
                : "bg-white border"
            }`}
            onClick={() => setActiveTab("history")}
          >
            History
          </button>
        </nav>

        {activeTab === "generate" ? <GenerateQuizTab /> : <HistoryTab />}
      </main>
    </div>
  );
}
