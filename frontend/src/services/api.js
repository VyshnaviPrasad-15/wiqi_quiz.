// Vite exposes environment variables via import.meta.env and uses the VITE_ prefix for user-defined vars.
// Use import.meta.env.VITE_API_BASE (set in .env as VITE_API_BASE) or fall back to localhost.
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 30000 } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(resource, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    if (err.name === "AbortError") throw new Error("Request timed out");
    throw err;
  }
}

async function parseResponse(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Unexpected response: ${text || res.status}`);
  }
}

export async function generateQuiz(url) {
  const res = await fetchWithTimeout(`${API_BASE}/generate_quiz`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
    timeout: 60000,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to generate quiz: ${res.status} ${body}`);
  }
  return parseResponse(res);
}

export async function getHistory() {
  const res = await fetchWithTimeout(`${API_BASE}/history`, { timeout: 15000 });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to fetch history: ${res.status} ${body}`);
  }
  return parseResponse(res);
}

export async function getQuiz(quizId) {
  const res = await fetchWithTimeout(`${API_BASE}/quiz/${quizId}`, {
    timeout: 15000,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to fetch quiz: ${res.status} ${body}`);
  }
  return parseResponse(res);
}
