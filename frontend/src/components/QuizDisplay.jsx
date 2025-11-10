import React, { useState, useMemo } from "react";

export default function QuizDisplay({ data }) {
  if (!data) return null;

  const title = data.title || data.article_title || "Generated Quiz";
  const summary = data.summary || data.overview || data.description || "";
  const questions = data.questions || data.quiz || [];

  // Track answers: map question index -> selected choice
  const [answers, setAnswers] = useState({});

  const score = useMemo(() => {
    let s = 0;
    questions.forEach((q, idx) => {
      const sel = answers[idx];
      if (
        sel &&
        q.correct_answer &&
        (sel === q.correct_answer || sel === q.answer)
      )
        s += 1;
    });
    return s;
  }, [answers, questions]);

  function selectAnswer(idx, choice) {
    // If already answered, do nothing (lock in answer)
    if (answers.hasOwnProperty(idx)) return;
    setAnswers((prev) => ({ ...prev, [idx]: choice }));
  }

  return (
    <div className="space-y-4">
      {/* debug: show returned questions count */}
      <div className="text-xs text-gray-500">
        Returned questions: {questions.length}
      </div>
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="text-sm text-gray-600">
          Score: {score}/{questions.length}
        </div>
      </div>

      {summary && <p className="text-sm text-gray-700">{summary}</p>}

      <div className="mt-4 space-y-4">
        {questions.length === 0 && (
          <p className="text-sm text-gray-600">
            No questions in the returned data.
          </p>
        )}

        {questions.map((q, idx) => {
          const selected = answers[idx];
          const correct = q.correct_answer || q.answer;
          return (
            <div key={idx} className="bg-white p-4 rounded shadow">
              <div className="font-medium mb-2">
                {idx + 1}. {q.question || q.prompt || q.text}
              </div>

              {q.choices && (
                <div className="grid gap-2">
                  {q.choices.map((c, i) => {
                    const isSelected = selected === c;
                    const isCorrect = correct && c === correct;
                    // Determine button style
                    let btnClass = "text-left px-3 py-2 rounded border";
                    if (selected) {
                      if (isSelected && isCorrect)
                        btnClass +=
                          " bg-green-100 border-green-400 text-green-800";
                      else if (isSelected && !isCorrect)
                        btnClass += " bg-red-100 border-red-400 text-red-800";
                      else if (!isSelected && isCorrect)
                        btnClass +=
                          " bg-green-50 border-green-200 text-green-700";
                      else btnClass += " bg-white text-gray-800";
                    } else {
                      btnClass += " bg-white hover:bg-gray-50";
                    }

                    return (
                      <button
                        key={i}
                        className={btnClass}
                        onClick={() => selectAnswer(idx, c)}
                        disabled={selected !== undefined}
                        type="button"
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              )}

              {selected && (
                <div className="mt-2 text-sm">
                  {selected === correct ? (
                    <div className="text-green-700 font-semibold">Correct</div>
                  ) : (
                    <div className="text-red-700 font-semibold">Incorrect</div>
                  )}
                  {q.explanation && (
                    <div className="mt-1 text-xs text-gray-700">
                      {q.explanation}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
