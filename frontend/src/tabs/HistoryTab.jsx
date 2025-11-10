import React, { useEffect, useState } from "react";
import { getHistory, getQuiz } from "../services/api";
import Modal from "../components/Modal";
import QuizDisplay from "../components/QuizDisplay";

export default function HistoryTab() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    setLoading(true);
    setError(null);
    try {
      const data = await getHistory();
      setHistory(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function openDetails(id) {
    setError(null);
    try {
      const data = await getQuiz(id);
      setSelected(data);
      setModalOpen(true);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-medium mb-2">Generated Quizzes</h3>
        {loading && <div className="text-sm text-gray-600">Loading...</div>}
        {error && <div className="text-sm text-red-600">{error}</div>}
        {!loading && history.length === 0 && (
          <div className="text-sm text-gray-600">No quizzes generated yet.</div>
        )}

        {history.length > 0 && (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2">ID</th>
                <th className="py-2">Title</th>
                <th className="py-2">URL</th>
                <th className="py-2">Date</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id} className="border-b">
                  <td className="py-2 align-top">{h.id}</td>
                  <td className="py-2 align-top">{h.title}</td>
                  <td className="py-2 align-top">
                    <a
                      href={h.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600"
                    >
                      Link
                    </a>
                  </td>
                  <td className="py-2 align-top">
                    {new Date(h.date_generated).toLocaleString()}
                  </td>
                  <td className="py-2 align-top">
                    <button
                      className="px-2 py-1 bg-blue-600 text-white rounded"
                      onClick={() => openDetails(h.id)}
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selected?.title || "Quiz Details"}
      >
        <QuizDisplay
          data={selected?.full_quiz_data ? selected.full_quiz_data : selected}
        />
      </Modal>
    </div>
  );
}
