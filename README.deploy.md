# Deploying AI Quiz Generator (Vercel frontend + Render backend)

This document shows the recommended steps to publish the project using Vercel (frontend) and Render (backend). It also lists local Docker Compose instructions for testing a production-like setup.

1. Prepare repository

- Push the repository to GitHub.
- Make sure `.env.sample` is filled and you create `.env` locally for Docker Compose testing.

2. Deploy Backend to Render (recommended)

- Create a Render account and connect your GitHub repo.
- Create a new Web Service (choose Docker or the Python option).
  - If using Docker, Render will use `backend/Dockerfile`.
  - If using Python, set Build Command: `pip install -r requirements.txt` and Start Command: `gunicorn main:app -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT --workers 2`.
- Set Environment Variables in Render:
  - `DATABASE_URL` — connection string for your Postgres database (Render or external).
  - `GEMINI_API_KEY` — (optional) API key for Gemini LLM if available.
  - Any other secrets required.
- Deploy and note the public URL of your backend (e.g., `https://your-backend.onrender.com`).

3. Deploy Frontend to Vercel

- Create a Vercel account and import your GitHub repo.
- Project settings:
  - Build Command: `npm ci && npm run build`
  - Output Directory: `dist`
- Add Environment Variable in Vercel (Production):
  - `VITE_API_BASE` = `https://your-backend.onrender.com` (the Render backend URL)
- Deploy. Vercel will give you the frontend URL (e.g., `https://your-app.vercel.app`).

4. Local testing with Docker Compose

- Copy `.env.sample` to `.env` and set appropriate values.
- Build and run:
  ```bash
  docker compose build
  docker compose up -d
  docker compose logs -f backend
  ```
- Open http://localhost in your browser (Nginx serves the frontend and proxies /generate_quiz to backend).

5. Notes and next steps

- Change CORS in `backend/main.py` to restrict to your frontend domain in production.
- For production LLM generation, ensure `GEMINI_API_KEY` is set and your `requirements.txt` includes the correct LangChain and provider packages.
- Consider adding Alembic-based migrations if you use Postgres for persistent storage.
