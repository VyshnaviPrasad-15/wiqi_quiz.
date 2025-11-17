# Deploying AI Quiz Generator (Vercel frontend + Render backend)

This document shows the recommended steps to publish the project using Vercel (frontend) and Render (backend). It also lists local Docker Compose instructions for testing a production-like setup.

1. Prepare repository

- Push the repository to GitHub.
- Make sure `.env.sample` is filled and you create `.env` locally for Docker Compose testing.

2. Deploy Backend to Render (recommended)

- The repository now includes a `render.yaml` at the project root. When you connect the repo in Render, Render will detect `render.yaml` and can create the web service and a starter Postgres database automatically.

Steps (recommended):

1. Go to https://render.com and sign in.
2. Click "New" → "Web Service" → "Connect a repository" and choose `VyshnaviPrasad-15/wiqi_quiz` and the `master` branch.
   - If Render detects `render.yaml`, it will pre-fill settings. Review them and continue.
   - If Render doesn't detect it, create a Docker Web Service and set:
     - Environment: Docker
     - Dockerfile Path: `backend/Dockerfile`
     - Start Command: `gunicorn -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:10000 --workers 2`
3. Add/manage a Postgres database on Render (optional). If you create a managed DB, copy the DB connection string and add it to the Web Service's Environment Variables as `DATABASE_URL`.
4. Add other environment variables required by the app (Render Dashboard → Environment):
   - `GEMINI_API_KEY` — optional: API key for LLM generation.
   - `SENTRY_DSN` — optional: for error reporting.
5. Deploy the service. After a successful build, note the public URL (for example, `https://wiqi-quiz-backend.onrender.com`).

Notes:

- The included `render.yaml` requests a small managed Postgres database (starter plan) when used to create services via Render. If you prefer an external DB, set `DATABASE_URL` manually and remove the DB from Render.
- The `startCommand` in `render.yaml` binds to port `10000` — Render will route HTTP traffic to that port inside the container.

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
